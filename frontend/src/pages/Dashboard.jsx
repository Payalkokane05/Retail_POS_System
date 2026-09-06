import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const PRODUCT_LIST = [
  { name: "Rice", price: 65, unit: "kg" },
  { name: "Sugar", price: 50, unit: "kg" },
  { name: "Salt", price: 30, unit: "packet" },
  { name: "Wheat", price: 55, unit: "kg" },
  { name: "Tea", price: 120, unit: "packet" },
  { name: "Oil", price: 140, unit: "litre" },
  { name: "Chana", price: 90, unit: "kg" },
];

const API_BASE = "http://127.0.0.1:8000";

const extractCustomerName = (text) => {
  const match = text.match(/^(.*?)(\d)/);
  return match ? match[1].trim() : "";
};

const callBillingChat = async (message) => {
  const response = await fetch(`${API_BASE}/billing/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return response.json();
};

const UNIT_PATTERN =
  "kg|kgs|kilo|kilos|kilogram|kilograms|g|gram|grams|packet|packets|pkt|litre|litres|liter|liters|l";

const NUMBER_WORDS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
};

const createId = () =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceNumberWords = (text) => {
  let result = text || "";

  Object.entries(NUMBER_WORDS).forEach(([word, number]) => {
    result = result.replace(
      new RegExp(`\\b${word}\\b`, "gi"),
      String(number)
    );
  });

  return result;
};

const normalizeText = (text) => {
  return replaceNumberWords(text || "")
    .replace(/[,\u00A0]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeUnit = (unit) => {
  const value = (unit || "").toLowerCase();

  if (
    [
      "kg",
      "kgs",
      "kilo",
      "kilos",
      "kilogram",
      "kilograms",
    ].includes(value)
  ) {
    return "kg";
  }

  if (["g", "gram", "grams"].includes(value)) {
    return "g";
  }

  if (["packet", "packets", "pkt"].includes(value)) {
    return "packet";
  }

  if (
    ["litre", "litres", "liter", "liters", "l"].includes(value)
  ) {
    return "litre";
  }

  return value;
};

const getProduct = (name) => {
  return PRODUCT_LIST.find(
    (product) =>
      product.name.toLowerCase() ===
      String(name || "").trim().toLowerCase()
  );
};

const calculateTotal = (items = []) => {
  return items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
};

const formatQuantity = (quantity) => {
  const number = Number(quantity);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return String(Number(number.toFixed(3)));
};

/* =========================================================
   PARSE PRODUCTS (still used by local edit/add/remove commands)
========================================================= */

const parseProducts = (text) => {
  const input = normalizeText(text);

  if (!input) return [];

  const productNames = PRODUCT_LIST.map((product) =>
    escapeRegExp(product.name)
  )
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?\\s*(${productNames})\\b`,
    "gi"
  );

  const products = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    let quantity = Number(match[1]);
    const spokenUnit = normalizeUnit(match[2] || "");
    const product = getProduct(match[3]);

    if (!product || quantity <= 0) {
      continue;
    }

    let unit = spokenUnit || product.unit;

    if (unit === "g" && product.unit === "kg") {
      quantity = quantity / 1000;
      unit = "kg";
    }

    products.push({
      id: createId(),
      name: product.name,
      price: product.price,
      quantity,
      unit,
      total: product.price * quantity,
    });
  }

  return products;
};

/* =========================================================
   MERGE PRODUCTS
========================================================= */

const mergeProducts = (oldItems = [], newItems = []) => {
  const result = oldItems.map((item) => ({
    ...item,
  }));

  newItems.forEach((newItem) => {
    const index = result.findIndex(
      (item) =>
        item.name.toLowerCase() ===
        newItem.name.toLowerCase()
    );

    if (index >= 0) {
      const quantity =
        Number(result[index].quantity) +
        Number(newItem.quantity);

      result[index] = {
        ...result[index],
        quantity,
        total: Number(result[index].price) * quantity,
      };
    } else {
      result.push({
        ...newItem,
      });
    }
  });

  return result;
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const { language, setLanguage } = useLanguage();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // ONLY SAVED BILLS
  const [bills, setBills] = useState([]);

  // Visible working bills
  const [workingBills, setWorkingBills] = useState({});

  const [editingBillId, setEditingBillId] = useState(null);
  const [editingItems, setEditingItems] = useState({});
  const [listening, setListening] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(235);

  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const shopName =
    localStorage.getItem("shopName") ||
    "Shree Ganesh Grocery";

  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    "User";

  /* =========================================================
     LOAD CHAT + BILLS FROM LOCAL STORAGE
     Chat + generated bills survive page navigation/remount.
  ========================================================= */
  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const readArray = (key) => {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return [];
          }
        };

        const readObject = (key) => {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed)
              ? parsed
              : {};
          } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return {};
          }
        };

        const normalizeBills = (source) =>
          source
            .filter(
              (bill) =>
                bill &&
                bill.customer &&
                Array.isArray(bill.items) &&
                bill.items.length > 0
            )
            .map((bill) => ({
              ...bill,
              status: bill.status || "Saved",
            }));

        const retailBills = normalizeBills(readArray("retailBills"));
        const posBills = normalizeBills(readArray("posBills"));
        const savedWorking = readObject("retailWorkingBills");

        /* -----------------------------------------------
           Merge bills from both storage keys.
           Same customer = ONE bill.
        ----------------------------------------------- */
        const mergedByCustomer = new Map();

        [...retailBills, ...posBills].forEach((bill) => {
          const key = String(bill.customer).trim().toLowerCase();
          const oldBill = mergedByCustomer.get(key);

          if (!oldBill) {
            mergedByCustomer.set(key, bill);
            return;
          }

          const oldTime = new Date(
            oldBill.savedAt ||
            oldBill.updatedAt ||
            oldBill.createdAt ||
            0
          ).getTime();

          const newTime = new Date(
            bill.savedAt ||
            bill.updatedAt ||
            bill.createdAt ||
            0
          ).getTime();

          if (newTime >= oldTime) {
            mergedByCustomer.set(key, bill);
          }
        });

        const uniqueBills = Array.from(
          mergedByCustomer.values()
        );

        setBills(uniqueBills);
        setWorkingBills(savedWorking);

        /* -----------------------------------------------
           Restore complete chat.
           IMPORTANT:
           - User messages stay.
           - AI messages stay.
           - Existing bill messages stay in their position.
           - Bill message gets latest bill data.
        ----------------------------------------------- */
        let savedChat = [];
        try {
          const rawChat = localStorage.getItem("retailChatHistory");
          const parsedChat = rawChat ? JSON.parse(rawChat) : [];
          savedChat = Array.isArray(parsedChat) ? parsedChat : [];
        } catch (error) {
          console.error("Error reading chat history:", error);
        }

        const latestBillByCustomer = new Map();

        uniqueBills.forEach((bill) => {
          latestBillByCustomer.set(
            String(bill.customer).trim().toLowerCase(),
            bill
          );
        });

        Object.values(savedWorking).forEach((bill) => {
          if (
            bill &&
            bill.customer &&
            Array.isArray(bill.items) &&
            bill.items.length > 0
          ) {
            latestBillByCustomer.set(
              String(bill.customer).trim().toLowerCase(),
              bill
            );
          }
        });

        const restoredMessages = [];
        const shownBillCustomers = new Set();

        savedChat.forEach((message) => {
          if (!message) return;

          if (message.type === "bill" && message.bill?.customer) {
            const customerKey = String(
              message.bill.customer
            )
              .trim()
              .toLowerCase();

            const latestBill =
              latestBillByCustomer.get(customerKey);

            if (latestBill) {
              restoredMessages.push({
                ...message,
                bill: latestBill,
              });
              shownBillCustomers.add(customerKey);
            }

            return;
          }

          restoredMessages.push(message);
        });

        /* -----------------------------------------------
           If a generated bill exists but its bill message
           was not present in chat history, add it once.
        ----------------------------------------------- */
        latestBillByCustomer.forEach((bill, customerKey) => {
          if (!shownBillCustomers.has(customerKey)) {
            restoredMessages.push({
              id: `bill-message-${bill.id}`,
              type: "bill",
              bill,
            });
          }
        });

        if (restoredMessages.length > 0) {
          setMessages(restoredMessages);
        } else {
          setMessages([
            {
              id: createId(),
              type: "ai",
              text:
                language === "mr"
                  ? "Shree Ganesh Grocery Retail POS मध्ये आपले स्वागत आहे! 👋 ग्राहकाचे नाव आणि वस्तूंची माहिती खाली टाका आणि बिल लगेच तयार करा."
                  : language === "hi"
                    ? "Shree Ganesh Grocery Retail POS में आपका स्वागत है! 👋 ग्राहक का नाम और वस्तुओं की जानकारी नीचे दर्ज करें और बिल तुरंत बनाएं।"
                    : "Welcome to Shree Ganesh Grocery Retail POS! 👋 Enter customer details and items below to create a bill instantly.",
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading Dashboard data:", error);
      }
    };

    loadDashboardData();

    const handleStorageChange = (event) => {
      if (
        event.key === "retailBills" ||
        event.key === "posBills" ||
        event.key === "retailChatHistory" ||
        event.key === "retailWorkingBills"
      ) {
        loadDashboardData();
      }
    };

    const handleFocus = () => {
      loadDashboardData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
      window.removeEventListener(
        "focus",
        handleFocus
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /* =========================================================
     PERSIST CHAT + WORKING BILLS
  ========================================================= */
  useEffect(() => {
    // Do not save the temporary initial empty state.
    if (messages.length > 0) {
      localStorage.setItem(
        "retailChatHistory",
        JSON.stringify(messages)
      );
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      "retailWorkingBills",
      JSON.stringify(workingBills)
    );
  }, [workingBills]);

  /* =========================================================
     SIDEBAR WIDTH
  ========================================================= */

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 700) {
        setSidebarWidth(0);
        return;
      }

      const sidebar =
        document.querySelector("aside");

      if (sidebar) {
        setSidebarWidth(
          Math.round(
            sidebar.getBoundingClientRect().width
          )
        );
      } else {
        setSidebarWidth(235);
      }
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, []);

  /* =========================================================
     SAVE TO LOCAL STORAGE
  ========================================================= */

  const saveBillsToStorage = (updatedBills) => {
    const validBills = Array.isArray(updatedBills)
      ? updatedBills.filter(
        (bill) =>
          bill &&
          bill.customer &&
          Array.isArray(bill.items)
      )
      : [];

    localStorage.setItem(
      "retailBills",
      JSON.stringify(validBills)
    );

    localStorage.setItem(
      "posBills",
      JSON.stringify(validBills)
    );
  };

  /* =========================================================
     AI MESSAGE
  ========================================================= */

  const addAiMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        type: "ai",
        text,
      },
    ]);
  };

  /* =========================================================
     FIND BILL
  ========================================================= */

  const findBill = (customer) => {
    const name = String(customer || "")
      .trim()
      .toLowerCase();

    const working = Object.values(
      workingBills
    ).find(
      (bill) =>
        String(bill.customer || "")
          .trim()
          .toLowerCase() === name
    );

    if (working) {
      return working;
    }

    return bills.find(
      (bill) =>
        String(bill.customer || "")
          .trim()
          .toLowerCase() === name
    );
  };

  /* =========================================================
     UPDATE BILL MESSAGE
  ========================================================= */

  const updateBillMessage = (updatedBill) => {
    setMessages((prev) => {
      const index = prev.findIndex(
        (message) =>
          message.type === "bill" &&
          message.bill?.id === updatedBill.id
      );

      if (index === -1) {
        return [
          ...prev,
          {
            id: createId(),
            type: "bill",
            bill: updatedBill,
          },
        ];
      }

      return prev.map((message, i) =>
        i === index
          ? {
            ...message,
            bill: updatedBill,
          }
          : message
      );
    });
  };

  /* =========================================================
     PUT WORKING BILL
  ========================================================= */

  const putWorkingBill = (bill) => {
    // IMPORTANT: A generated bill is stored immediately.
    // This makes the bill survive navigation to Customers/Products/Bills
    // and coming back to Dashboard.
    const generatedBill = {
      ...bill,
      status: "Saved",
      updatedAt: new Date().toISOString(),
    };

    setWorkingBills((prev) => ({
      ...prev,
      [generatedBill.id]: generatedBill,
    }));

    setBills((prevBills) => {
      const customerKey = String(generatedBill.customer || "")
        .trim()
        .toLowerCase();

      const existingIndex = prevBills.findIndex(
        (item) =>
          String(item.customer || "")
            .trim()
            .toLowerCase() === customerKey ||
          item.id === generatedBill.id
      );

      let updatedBills;

      if (existingIndex >= 0) {
        updatedBills = prevBills.map((item, index) =>
          index === existingIndex
            ? generatedBill
            : item
        );
      } else {
        updatedBills = [...prevBills, generatedBill];
      }

      // Persist immediately, not only when the user clicks Save.
      saveBillsToStorage(updatedBills);

      return updatedBills;
    });

    updateBillMessage(generatedBill);
  };

  /* =========================================================
     CREATE / UPDATE BILL
  ========================================================= */

  const createOrUpdateBill = (
    customer,
    items
  ) => {
    if (!customer) {
      addAiMessage(
        language === "mr"
          ? "कृपया ग्राहकाचे नाव द्या."
          : language === "hi"
            ? "कृपया ग्राहक का नाम दें।"
            : "Please enter customer name."
      );
      return;
    }

    if (!items.length) {
      addAiMessage(
        language === "mr"
          ? "कृपया item आणि quantity द्या."
          : language === "hi"
            ? "कृपया item और quantity दें।"
            : "Please enter item and quantity."
      );
      return;
    }

    const existingWorking =
      Object.values(
        workingBills
      ).find(
        (bill) =>
          bill.customer.toLowerCase() ===
          customer.toLowerCase()
      );

    const existingSaved = bills.find(
      (bill) =>
        bill.customer.toLowerCase() ===
        customer.toLowerCase()
    );

    const existingBill =
      existingWorking || existingSaved;

    if (existingBill) {
      const updatedItems =
        mergeProducts(
          existingBill.items || [],
          items
        );

      const updatedBill = {
        ...existingBill,
        customer,
        items: updatedItems,
        status: "Unsaved",
      };

      putWorkingBill(updatedBill);
      return;
    }

    const newBill = {
      id: createId(),
      customer,
      items,
      status: "Unsaved",
      createdAt:
        new Date().toISOString(),
    };

    putWorkingBill(newBill);
  };

  /* =========================================================
     EDIT / CHANGE / UPDATE COMMAND
  ========================================================= */

  const handleEditCommand = (rawText) => {
    let text = normalizeText(rawText);

    text = text
      .replace(
        /\b(kilograms?|kilos?|kgs?)\b/gi,
        "kg"
      )
      .replace(
        /\b(grams?)\b/gi,
        "g"
      )
      .replace(
        /\b(packets?|pkt)\b/gi,
        "packet"
      )
      .replace(
        /\b(litres?|liters?)\b/gi,
        "litre"
      );

    const match = text.match(
      /^(.+?)\s+(change|update|edit|replace)\s+(.+)$/i
    );

    if (!match) return false;

    const customer = match[1].trim();
    const command = match[3].trim();

    const bill = findBill(customer);

    if (!bill) {
      addAiMessage(
        `Bill not found for ${customer}.`
      );
      return true;
    }

    let product = null;

    for (const p of PRODUCT_LIST) {
      const regex = new RegExp(
        `\\b${escapeRegExp(p.name)}\\b`,
        "i"
      );

      if (regex.test(command)) {
        product = p;
        break;
      }
    }

    if (!product) {
      addAiMessage(
        "Product not found."
      );
      return true;
    }

    const productRegex = new RegExp(
      `\\b${escapeRegExp(product.name)}\\b`,
      "i"
    );

    const productMatch =
      command.match(productRegex);

    let quantityText = command
      .substring(
        productMatch.index +
        productMatch[0].length
      )
      .trim();

    quantityText = quantityText
      .replace(
        /^(to|with|=)\s*/i,
        ""
      )
      .trim();

    const quantityMatch =
      quantityText.match(
        new RegExp(
          `^(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?`,
          "i"
        )
      );

    if (!quantityMatch) {
      addAiMessage(
        `Example: ${customer} edit ${product.name} to 5 kg`
      );
      return true;
    }

    let quantity = Number(
      quantityMatch[1]
    );

    let unit = normalizeUnit(
      quantityMatch[2] ||
      product.unit
    );

    if (
      unit === "g" &&
      product.unit === "kg"
    ) {
      quantity = quantity / 1000;
      unit = "kg";
    }

    if (quantity <= 0) {
      addAiMessage(
        "Quantity must be greater than 0."
      );
      return true;
    }

    const updatedItems = [
      ...(bill.items || []),
    ];

    const index =
      updatedItems.findIndex(
        (item) =>
          item.name.toLowerCase() ===
          product.name.toLowerCase()
      );

    const updatedItem = {
      id:
        index >= 0
          ? updatedItems[index].id
          : createId(),
      name: product.name,
      price: product.price,
      quantity,
      unit,
      total:
        product.price * quantity,
    };

    if (index >= 0) {
      updatedItems[index] =
        updatedItem;
    } else {
      updatedItems.push(
        updatedItem
      );
    }

    const updatedBill = {
      ...bill,
      items: updatedItems,
      status: "Unsaved",
    };

    putWorkingBill(updatedBill);

    addAiMessage(
      `${product.name} changed to ${formatQuantity(
        quantity
      )} ${unit}. Click Save to save the bill.`
    );

    return true;
  };

  /* =========================================================
     ADD COMMAND
  ========================================================= */

  const handleAddCommand = (rawText) => {
    const text = normalizeText(rawText);

    const match = text.match(
      /^(.+?)\s+(add|insert)\s+(.+)$/i
    );

    if (!match) return false;

    const customer =
      match[1].trim();

    const productText =
      match[3].trim();

    const bill =
      findBill(customer);

    if (!bill) {
      addAiMessage(
        `Bill not found for ${customer}.`
      );
      return true;
    }

    const items =
      parseProducts(productText);

    if (!items.length) {
      addAiMessage(
        "Product not found."
      );
      return true;
    }

    const updatedItems =
      mergeProducts(
        bill.items || [],
        items
      );

    const updatedBill = {
      ...bill,
      items: updatedItems,
      status: "Unsaved",
    };

    putWorkingBill(updatedBill);

    addAiMessage(
      "Item added successfully. Click Save to save the bill."
    );

    return true;
  };

  /* =========================================================
     REMOVE COMMAND
  ========================================================= */

  const handleRemoveCommand = (
    rawText
  ) => {
    const text =
      normalizeText(rawText);

    const match = text.match(
      /^(.+?)\s+(remove|delete)\s+(.+)$/i
    );

    if (!match) return false;

    const customer =
      match[1].trim();

    const productName =
      match[3].trim();

    const bill =
      findBill(customer);

    if (!bill) {
      addAiMessage(
        `Bill not found for ${customer}.`
      );
      return true;
    }

    const product =
      getProduct(productName);

    if (!product) {
      addAiMessage(
        "Product not found."
      );
      return true;
    }

    const updatedItems =
      (bill.items || []).filter(
        (item) =>
          item.name.toLowerCase() !==
          product.name.toLowerCase()
      );

    if (updatedItems.length === 0) {
      addAiMessage(
        "Bill must contain at least one item."
      );
      return true;
    }

    const updatedBill = {
      ...bill,
      items: updatedItems,
      status: "Unsaved",
    };

    putWorkingBill(updatedBill);

    addAiMessage(
      `${product.name} removed successfully. Click Save to save the bill.`
    );

    return true;
  };

  /* =========================================================
     PROCESS MESSAGE
     Now routed through the real AI backend.
     - If the AI calculated a bill -> build a bill card (same as before).
     - If the AI ran any other tool (add_product, delete_customer, etc.)
       or just replied normally -> show the AI's reply text.
  ========================================================= */

  const processMessage = async (text) => {
    if (handleEditCommand(text)) {
      return;
    }

    if (handleAddCommand(text)) {
      return;
    }

    if (handleRemoveCommand(text)) {
      return;
    }

    let data;
    try {
      data = await callBillingChat(text);
    } catch (error) {
      console.error("Billing chat error:", error);
      addAiMessage(
        "Sorry, I couldn't reach the server. Please make sure the backend is running."
      );
      return;
    }

    const results = data.results || {};

    // Case 1: AI calculated a bill
    if (results.calculate_bill) {
      const aiBill = results.calculate_bill;
      const customer = extractCustomerName(text);

      const notFound = (aiBill.items || []).filter((i) => i.error);
      if (notFound.length > 0) {
        addAiMessage(
          `Product(s) not found: ${notFound
            .map((i) => i.name)
            .join(", ")}`
        );
      }

      const validItems = (aiBill.items || [])
        .filter((i) => !i.error)
        .map((i) => ({
          id: createId(),
          name: i.name,
          price: i.unit_price,
          quantity: i.quantity,
          unit: "",
          total: i.total,
        }));

      if (validItems.length > 0) {
        createOrUpdateBill(customer, validItems);
      }
      return;
    }

    // Case 2: AI ran a different tool (product/customer CRUD), or no tool at all
    addAiMessage(data.reply || "Done.");
  };

  /* =========================================================
     SEND TEXT
  ========================================================= */

  const handleSendText = async (text) => {
    const cleanText =
      String(text || "").trim();

    if (!cleanText) return;

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        type: "user",
        text: cleanText,
      },
    ]);

    setInput("");

    await processMessage(cleanText);
  };

  const handleSend = () => {
    handleSendText(input);
  };

  /* =========================================================
     VOICE
  ========================================================= */

  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addAiMessage(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (
      listening &&
      recognitionRef.current
    ) {
      recognitionRef.current.stop();
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognitionRef.current =
      recognition;

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang =
      language === "mr"
        ? "mr-IN"
        : language === "hi"
          ? "hi-IN"
          : "en-IN";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0]
          .transcript;

      if (!transcript.trim()) {
        return;
      }

      setInput(transcript);

      setTimeout(() => {
        handleSendText(
          transcript
        );
      }, 100);
    };

    recognition.onerror = (
      event
    ) => {
      console.error(
        "Voice error:",
        event
      );

      setListening(false);

      addAiMessage(
        "Voice recognition error. Please try again."
      );
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current =
        null;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setListening(false);
    }
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageUpload = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    addAiMessage(
      `Image uploaded: ${file.name}`
    );

    event.target.value = "";
  };

  /* =========================================================
     EDIT BUTTON
  ========================================================= */

  const startEditingBill = (
    bill
  ) => {
    const copied = {};

    (bill.items || []).forEach(
      (item) => {
        copied[item.id] = {
          ...item,
        };
      }
    );

    setEditingItems(copied);
    setEditingBillId(bill.id);
  };

  /* =========================================================
     CHANGE EDITING QUANTITY
  ========================================================= */

  const changeEditingQuantity = (
    id,
    value
  ) => {
    setEditingItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity:
          value === ""
            ? ""
            : Number(value),
      },
    }));
  };

  /* =========================================================
     REMOVE WHILE EDITING
  ========================================================= */

  const removeEditingItem = (
    id
  ) => {
    setEditingItems((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[id];

      return updated;
    });
  };

  /* =========================================================
     SAVE BUTTON
  ========================================================= */

  const saveBill = async (bill) => {
    let updatedItems;

    if (editingBillId === bill.id) {
      updatedItems =
        Object.values(
          editingItems
        )
          .filter(
            (item) =>
              item.quantity !== "" &&
              Number(item.quantity) > 0
          )
          .map((item) => ({
            ...item,
            quantity:
              Number(item.quantity),
            total:
              Number(item.price) *
              Number(item.quantity),
          }));
    } else {
      updatedItems =
        (bill.items || []).map(
          (item) => ({
            ...item,
            quantity:
              Number(item.quantity),
            total:
              Number(item.price) *
              Number(item.quantity),
          })
        );
    }

    if (!updatedItems.length) {
      addAiMessage(
        "Please add at least one item before saving."
      );
      return;
    }

    const savedBill = {
      ...bill,
      items: updatedItems,
      status: "Saved",
      savedAt:
        new Date().toISOString(),
    };
    try {
      await fetch(`${API_BASE}/billing/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: savedBill.customer,
          items: updatedItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        }),
      });
    } catch (error) {
      console.error("Failed to save bill to database:", error);
      addAiMessage("Warning: bill saved locally but failed to save to the database.");
    }
    const existingIndex =
      bills.findIndex(
        (item) =>
          item.id ===
          savedBill.id ||
          item.customer
            .toLowerCase() ===
          savedBill.customer
            .toLowerCase()
      );

    let updatedBills;

    if (existingIndex >= 0) {
      updatedBills = bills.map(
        (item, index) =>
          index === existingIndex
            ? savedBill
            : item
      );
    } else {
      updatedBills = [
        ...bills,
        savedBill,
      ];
    }

    saveBillsToStorage(
      updatedBills
    );

    setBills(updatedBills);

    setWorkingBills((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[
        savedBill.id
      ];

      return updated;
    });

    updateBillMessage(
      savedBill
    );

    setEditingBillId(null);
    setEditingItems({});

    addAiMessage(
      `Bill for ${savedBill.customer} saved successfully.`
    );
  };

  /* =========================================================
     SHARE / SEND
  ========================================================= */

  const handleShare = async (
    bill
  ) => {
    let text =
      `${shopName}\n\n`;

    text += `BILL\n\n`;

    text += `Customer: ${bill.customer}\n\n`;

    (bill.items || []).forEach(
      (item) => {
        text += `${item.name} - ${formatQuantity(
          item.quantity
        )} ${item.unit} - ₹${(
          Number(item.price) *
          Number(item.quantity)
        ).toFixed(2)}\n`;
      }
    );

    text += `\nTotal: ₹${calculateTotal(
      bill.items
    ).toFixed(2)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shopName,
          text,
        });
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          text
        );

        addAiMessage(
          "Bill copied."
        );
      } else {
        addAiMessage(text);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  const handleClearChat = () => {
    const confirmed =
      window.confirm(
        language === "mr"
          ? "पूर्ण chat आणि सर्व bills clear करायचे आहेत का?"
          : language === "hi"
            ? "क्या आप पूरी chat और सभी bills clear करना चाहते हैं?"
            : "Do you want to clear the entire chat and all bills?"
      );

    if (!confirmed) return;

    localStorage.removeItem(
      "retailBills"
    );

    localStorage.removeItem(
      "posBills"
    );

    localStorage.removeItem(
      "retailChatHistory"
    );

    localStorage.removeItem(
      "retailWorkingBills"
    );

    setBills([]);
    setWorkingBills({});
    setEditingBillId(null);
    setEditingItems({});

    setMessages([
      {
        id: createId(),
        type: "ai",
        text:
          language === "mr"
            ? "Chat आणि सर्व bills clear झाले."
            : language === "hi"
              ? "Chat और सभी bills clear हो गए।"
              : "Chat and all bills have been cleared.",
      },
    ]);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("XYZ");
    localStorage.removeItem("XZ");
    window.location.href =
      "/login";
  };

  /* =========================================================
     BILL CARD
  ========================================================= */

  const BillCard = ({ bill }) => {
    const isEditing =
      editingBillId === bill.id;

    const items = isEditing
      ? Object.values(
        editingItems
      )
      : bill.items || [];

    const total =
      calculateTotal(items);

    const isSaved =
      bill.status === "Saved";

    return (
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          margin: "20px 0",
          background: "#ffffff",
          border:
            "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "28px",
          boxSizing: "border-box",
        }}
      >
        {/* SHOP NAME */}

        <div
          style={{
            textAlign: "center",
            paddingBottom: "18px",
            borderBottom:
              "2px solid #111827",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "900",
              color: "#111827",
              lineHeight: "1.2",
              marginBottom: "8px",
            }}
          >
            {shopName}
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              letterSpacing: "3px",
              color: "#374151",
              marginBottom: "12px",
            }}
          >
            BILL
          </div>

          {/* CUSTOMER */}

          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Customer: {bill.customer}
          </div>
        </div>

        {/* STATUS */}

        <div
          style={{
            textAlign: "right",
            marginTop: "12px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: "20px",
              background: isSaved
                ? "#dcfce7"
                : "#fef3c7",
              color: isSaved
                ? "#166534"
                : "#92400e",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
            {isSaved
              ? "Saved"
              : "Not Saved"}
          </span>
        </div>

        {/* TABLE HEADER */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 140px 120px",
            gap: "10px",
            padding: "12px 0",
            borderBottom:
              "2px solid #111827",
            fontWeight: "800",
            color: "#111827",
          }}
        >
          <div>Item</div>

          <div
            style={{
              textAlign: "center",
            }}
          >
            Quantity
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            Amount
          </div>
        </div>

        {/* ITEMS */}

        {items.map((item) => (
          <div key={item.id}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 140px 120px",
                gap: "10px",
                alignItems: "center",
                padding: "14px 0",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  textAlign: "center",
                }}
              >
                {isEditing ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "center",
                      alignItems:
                        "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        item.quantity
                      }
                      onChange={(e) =>
                        changeEditingQuantity(
                          item.id,
                          e.target.value
                        )
                      }
                      style={{
                        width: "65px",
                        padding: "7px",
                        border:
                          "1px solid #9ca3af",
                        borderRadius:
                          "6px",
                      }}
                    />

                    <span>
                      {item.unit}
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    {formatQuantity(
                      item.quantity
                    )}{" "}
                    {item.unit}
                  </span>
                )}
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontWeight: "800",
                }}
              >
                ₹
                {(
                  Number(item.price) *
                  Number(
                    item.quantity || 0
                  )
                ).toFixed(2)}
              </div>
            </div>

            {isEditing && (
              <div
                style={{
                  textAlign: "right",
                  padding: "6px 0",
                }}
              >
                <button
                  onClick={() =>
                    removeEditingItem(
                      item.id
                    )
                  }
                  style={{
                    border: "none",
                    background:
                      "#fee2e2",
                    color: "#dc2626",
                    padding:
                      "5px 10px",
                    borderRadius:
                      "6px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* TOTAL */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            paddingTop: "18px",
            marginTop: "5px",
            borderTop:
              "2px solid #111827",
            fontSize: "21px",
            fontWeight: "900",
          }}
        >
          <span>Total</span>

          <span>
            ₹{total.toFixed(2)}
          </span>
        </div>

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {/* EDIT */}

          <button
            onClick={() =>
              startEditingBill(
                bill
              )
            }
            style={{
              minWidth: "90px",
              padding:
                "10px 18px",
              border: "none",
              borderRadius: "7px",
              background:
                "#f59e0b",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Edit
          </button>

          {/* SAVE */}

          <button
            onClick={() =>
              saveBill(bill)
            }
            style={{
              minWidth: "90px",
              padding:
                "10px 18px",
              border: "none",
              borderRadius: "7px",
              background:
                "#16a34a",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Save
          </button>

          {/* SEND */}

          <button
            onClick={() =>
              handleShare(bill)
            }
            style={{
              minWidth: "90px",
              padding:
                "10px 18px",
              border: "none",
              borderRadius: "7px",
              background:
                "#2563eb",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          height: "70px",
          background: "#ffffff",
          borderBottom:
            "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* SHOP NAME */}

        <div
          style={{
            fontSize: "27px",
            fontWeight: "900",
            color: "#111827",
          }}
        >
          {shopName}
        </div>

        {/* RIGHT HEADER */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/* USER NAME */}

          <div
            style={{
              padding:
                "9px 14px",
              border:
                "1px solid #e5e7eb",
              borderRadius: "7px",
              background:
                "#f8fafc",
              color: "#111827",
              fontWeight: "800",
            }}
          >
            👤 {userName}
          </div>

          {/* LANGUAGE */}

          <select
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
            }
            style={{
              padding:
                "9px 12px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "7px",
              background: "#fff",
              fontWeight: "600",
            }}
          >
            <option value="en">
              English
            </option>

            <option value="mr">
              मराठी
            </option>

            <option value="hi">
              हिन्दी
            </option>
          </select>

          {/* CLEAR */}

          <button
            onClick={
              handleClearChat
            }
            style={{
              padding:
                "9px 13px",
              border: "none",
              borderRadius: "7px",
              background:
                "#fee2e2",
              color: "#dc2626",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🗑 Clear Chat
          </button>

          {/* LOGOUT */}

          <button
            onClick={
              handleLogout
            }
            style={{
              padding:
                "9px 13px",
              border: "none",
              borderRadius: "7px",
              background:
                "#111827",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CHAT AREA */}

      <main
        style={{
          marginLeft: `${sidebarWidth}px`,
          padding:
            "25px 0 140px 0",
          minHeight:
            "calc(100vh - 70px)",
          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0",
            display: "flex",
            flexDirection:
              "column",
            alignItems:
              "stretch",
            boxSizing:
              "border-box",
          }}
        >
          {messages.map(
            (message) => {
              /* BILL */

              if (
                message.type ===
                "bill"
              ) {
                return (
                  <div
                    key={
                      message.id
                    }
                    style={{
                      width: "100%",
                      display:
                        "flex",
                      justifyContent:
                        "flex-start",
                      alignItems:
                        "flex-start",
                      boxSizing:
                        "border-box",
                    }}
                  >
                    <BillCard
                      bill={
                        message.bill
                      }
                    />
                  </div>
                );
              }

              /* WELCOME / CHAT */

              const isWelcome =
                message.type ===
                "ai" &&
                messages.length ===
                1;

              return (
                <div
                  key={
                    message.id
                  }
                  style={{
                    width: "100%",
                    display:
                      "flex",
                    justifyContent:
                      message.type ===
                        "user"
                        ? "flex-end"
                        : "flex-start",
                    marginBottom:
                      "12px",
                  }}
                >
                  <div
                    style={{
                      maxWidth:
                        isWelcome
                          ? "650px"
                          : "75%",
                      padding:
                        isWelcome
                          ? "30px 40px"
                          : "12px 16px",
                      borderRadius:
                        "16px",
                      background:
                        message.type ===
                          "user"
                          ? "#2563eb"
                          : "#ffffff",
                      color:
                        message.type ===
                          "user"
                          ? "#ffffff"
                          : "#111827",
                      boxShadow:
                        isWelcome
                          ? "0 4px 20px rgba(0,0,0,0.08)"
                          : "0 2px 8px rgba(0,0,0,0.06)",
                      textAlign:
                        "left",
                      marginTop:
                        isWelcome
                          ? "20px"
                          : "0",
                    }}
                  >
                    {isWelcome ? (
                      <>
                        <div
                          style={{
                            fontSize:
                              "30px",
                            fontWeight:
                              "900",
                            marginBottom:
                              "12px",
                            color:
                              "#111827",
                          }}
                        >
                          {language ===
                            "mr"
                            ? "Shree Ganesh Grocery Retail POS मध्ये आपले स्वागत आहे! 👋"
                            : language ===
                              "hi"
                              ? "Shree Ganesh Grocery Retail POS में आपका स्वागत है! 👋"
                              : "Welcome to Shree Ganesh Grocery Retail POS! 👋"}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "16px",
                            lineHeight:
                              "1.7",
                            color:
                              "#64748b",
                            fontWeight:
                              "500",
                          }}
                        >
                          {language ===
                            "mr"
                            ? "ग्राहकाचे नाव आणि वस्तूंची माहिती खाली टाका आणि बिल लगेच तयार करा."
                            : language ===
                              "hi"
                              ? "ग्राहक का नाम और वस्तुओं की जानकारी नीचे दर्ज करें और बिल तुरंत बनाएं।"
                              : "Enter customer details and items below to create a bill instantly."}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "18px",
                            fontSize:
                              "14px",
                            color:
                              "#2563eb",
                            fontWeight:
                              "700",
                          }}
                        >
                          {language ===
                            "mr"
                            ? "उदा. Name Item Quantity"
                            : language ===
                              "hi"
                              ? "जैसे Name Item Quantity"
                              : "Example: Name Item Quantity"}
                        </div>
                      </>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </main>

      {/* IMAGE INPUT */}

      <input
        ref={
          imageInputRef
        }
        type="file"
        accept="image/*"
        onChange={
          handleImageUpload
        }
        style={{
          display: "none",
        }}
      />

      {/* BOTTOM INPUT */}

      <div
        style={{
          position: "fixed",
          left: `${sidebarWidth}px`,
          right: 0,
          bottom: 0,
          background:
            "#ffffff",
          borderTop:
            "1px solid #e5e7eb",
          padding:
            "12px 20px",
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth:
              "1000px",
            margin:
              "0 auto",
            display:
              "flex",
            gap: "8px",
            alignItems:
              "center",
          }}
        >
          {/* INPUT */}

          <input
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                handleSend();
              }
            }}
            placeholder={
              language ===
                "mr"
                ? "उदा. Rahul 2 kg Rice"
                : language ===
                  "hi"
                  ? "जैसे Rahul 2 kg Rice"
                  : "Example: Rahul 2 kg Rice"
            }
            style={{
              flex: 1,
              height: "44px",
              padding:
                "0 14px",
              border:
                "1px solid #cbd5e1",
              borderRadius:
                "8px",
              outline: "none",
              fontSize:
                "15px",
            }}
          />

          {/* CAMERA */}

          <button
            onClick={() =>
              imageInputRef.current?.click()
            }
            style={{
              width: "44px",
              height: "44px",
              border:
                "1px solid #cbd5e1",
              borderRadius:
                "8px",
              background:
                "#fff",
              cursor:
                "pointer",
              fontSize:
                "19px",
              flexShrink: 0,
            }}
            title="Upload image"
          >
            📷
          </button>

          {/* VOICE */}

          <button
            onClick={
              handleVoice
            }
            title={
              listening
                ? "Stop listening"
                : "Voice command"
            }
            style={{
              width: "44px",
              height: "44px",
              border: "none",
              borderRadius:
                "8px",
              background:
                listening
                  ? "#dc2626"
                  : "#f1f5f9",
              color:
                listening
                  ? "#fff"
                  : "#111827",
              cursor:
                "pointer",
              fontSize:
                "19px",
              flexShrink: 0,
            }}
          >
            🎤
          </button>

          {/* SEND */}

          <button
            onClick={
              handleSend
            }
            style={{
              height: "44px",
              padding:
                "0 20px",
              border: "none",
              borderRadius:
                "8px",
              background:
                "#2563eb",
              color: "#fff",
              fontWeight:
                "800",
              cursor:
                "pointer",
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>

        <div
          style={{
            maxWidth:
              "1000px",
            margin:
              "7px auto 0",
            fontSize:
              "12px",
            color:
              "#64748b",
          }}
        >
          Example:{" "}
          <b>
            Rahul 2 kg Rice
          </b>
          {"  |  "}
          <b>
            Rahul edit Rice to
            5 kg
          </b>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
