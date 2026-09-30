import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { useLocalizedNames } from "../hooks/useLocalizedNames";
import { authFetch } from "../api";

const callBillingChat = async (message, language) => {
  const response = await authFetch("/billing/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
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

const localeByLanguage = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  te: "te-IN",
};

const formatMoney = (value, language) =>
  new Intl.NumberFormat(localeByLanguage[language] || "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatBillDate = (value, language) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(localeByLanguage[language] || "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAssistantText = (text) =>
  String(text || "")
    .replace(/\s*\*\*\s*(Bill\s+\d+\s+\([^)]+\):)\s*\*\*/gi, "\n\n$1")
    .replace(/\s+\*\s+(?=[^*])/g, "\n")
    .replace(/\s+\*(?=\s*\*\*)/g, "")
    .replace(/\s*\*\*\s*(Grand Total:[^*]+)\*\*/gi, "\n$1")
    .replace(/\s*\*\*\s*(Total spent[^*]+)\*\*/gi, "\n\n$1")
    .replace(/\*\*/g, "")
    .trim();

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceNumberWords = (text) => {
  let result = text || "";

  Object.entries(NUMBER_WORDS).forEach(([word, number]) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, "gi"), String(number));
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

  if (["kg", "kgs", "kilo", "kilos", "kilogram", "kilograms"].includes(value)) {
    return "kg";
  }
  if (["g", "gram", "grams"].includes(value)) {
    return "g";
  }
  if (["packet", "packets", "pkt"].includes(value)) {
    return "packet";
  }
  if (["litre", "litres", "liter", "liters", "l"].includes(value)) {
    return "litre";
  }
  return value;
};

const getProduct = (name, products) => {
  return products.find(
    (product) => product.name.toLowerCase() === String(name || "").trim().toLowerCase()
  );
};

const calculateTotal = (items = []) => {
  return items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
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

const parseProducts = (text, products) => {
  const input = normalizeText(text);
  if (!input) return [];

  const productNames = products.map((product) => escapeRegExp(product.name))
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?\\s*(${productNames})\\b`,
    "gi"
  );

  const parsedItems = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    let quantity = Number(match[1]);
    const spokenUnit = normalizeUnit(match[2] || "");
    const product = getProduct(match[3], products);

    if (!product || quantity <= 0) {
      continue;
    }

    let unit = spokenUnit || product.unit;

    if (unit === "g" && product.unit === "kg") {
      quantity = quantity / 1000;
      unit = "kg";
    }

    parsedItems.push({
      id: createId(),
      name: product.name,
      price: product.price,
      quantity,
      unit,
      total: product.price * quantity,
    });
  }

  return parsedItems;
};

/* =========================================================
   MERGE PRODUCTS
========================================================= */

const mergeProducts = (oldItems = [], newItems = []) => {
  const result = oldItems.map((item) => ({ ...item }));

  newItems.forEach((newItem) => {
    const index = result.findIndex(
      (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
    );

    if (index >= 0) {
      const quantity = Number(result[index].quantity) + Number(newItem.quantity);
      result[index] = {
        ...result[index],
        displayName: newItem.displayName || result[index].displayName,
        quantity,
        total: Number(result[index].price) * quantity,
      };
    } else {
      result.push({ ...newItem });
    }
  });

  return result;
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ sidebarExpanded }) {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const localizedProductNames = useLocalizedNames(
    products.map((product) => product.name),
    "product"
  );

  const [bills, setBills] = useState([]);
  const [workingBills, setWorkingBills] = useState({});
  const localizedCustomerNames = useLocalizedNames(
    [...bills, ...Object.values(workingBills)].map((bill) => bill.customer),
    "person"
  );

  const [editingBillId, setEditingBillId] = useState(null);
  const [editingItems, setEditingItems] = useState({});
  const [listening, setListening] = useState(false);

  // Pending image attached but not yet sent
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState(null);

  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const shopName = localStorage.getItem("shopName") || "Shree Ganesh Grocery";
  const localizedShopNames = useLocalizedNames([shopName], "shop");
  const displayShopName = localizedShopNames[shopName] || shopName;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await authFetch("/products");
        if (!response.ok) {
          throw new Error(`Product request failed: ${response.status}`);
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load dashboard products:", error);
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  /* =========================================================
     LOAD CHAT HISTORY + BILLS
  ========================================================= */
  useEffect(() => {
    const loadDashboardData = async () => {
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
                bill && bill.customer && Array.isArray(bill.items) && bill.items.length > 0
            )
            .map((bill) => ({ ...bill, status: bill.status || "Saved" }));

        const retailBills = normalizeBills(readArray("retailBills"));
        const posBills = normalizeBills(readArray("posBills"));
        const savedWorking = readObject("retailWorkingBills");

        const mergedById = new Map();

        [...retailBills, ...posBills].forEach((bill) => {
          const key = String(
            bill.id || `${bill.customer}-${bill.savedAt || bill.updatedAt || bill.createdAt || "legacy"}`
          );
          const oldBill = mergedById.get(key);

          if (!oldBill) {
            mergedById.set(key, bill);
            return;
          }

          const oldTime = new Date(
            oldBill.savedAt || oldBill.updatedAt || oldBill.createdAt || 0
          ).getTime();

          const newTime = new Date(
            bill.savedAt || bill.updatedAt || bill.createdAt || 0
          ).getTime();

          if (newTime >= oldTime) {
            mergedById.set(key, bill);
          }
        });

        const uniqueBills = Array.from(mergedById.values());

        setBills(uniqueBills);
        setWorkingBills(savedWorking);

        let savedChat = [];
        try {
          const response = await authFetch("/billing/agent/history");
          if (!response.ok) {
            throw new Error(`Chat history request failed: ${response.status}`);
          }
          const data = await response.json();
          savedChat = (Array.isArray(data.history) ? data.history : []).map(
            (message) => ({
              id: createId(),
              type: message.role === "user" ? "user" : "ai",
              text: message.content,
            })
          );
        } catch (error) {
          console.error("Error reading chat history:", error);
        }

        const chatClearedAt = new Date(
          localStorage.getItem("retailChatClearedAt") || 0
        ).getTime();

        const restoredMessages = savedChat.filter(Boolean);
        Object.values(savedWorking).forEach((bill) => {
          if (bill && bill.customer && Array.isArray(bill.items) && bill.items.length > 0) {
            const billUpdatedAt = new Date(
              bill.updatedAt || bill.createdAt || 0
            ).getTime();
            if (billUpdatedAt > chatClearedAt) {
              restoredMessages.push({
                id: `bill-message-${bill.id}`,
                type: "bill",
                bill,
              });
            }
          }
        });

        if (restoredMessages.length > 0) {
          setMessages(restoredMessages);
        } else {
          setMessages([
            {
              id: createId(),
              type: "ai",
              text: t("dashboard.welcome", { shopName: displayShopName }),
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
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [displayShopName, language, shopName, t]);

  /* =========================================================
     PERSIST WORKING BILLS
  ========================================================= */
  useEffect(() => {
    localStorage.setItem("retailWorkingBills", JSON.stringify(workingBills));
  }, [workingBills]);

  /* =========================================================
     SAVE TO LOCAL STORAGE
  ========================================================= */
  const saveBillsToStorage = (updatedBills) => {
    const validBills = Array.isArray(updatedBills)
      ? updatedBills.filter((bill) => bill && bill.customer && Array.isArray(bill.items))
      : [];

    localStorage.setItem("retailBills", JSON.stringify(validBills));
    localStorage.setItem("posBills", JSON.stringify(validBills));
  };

  /* =========================================================
     AI MESSAGE
  ========================================================= */
  const addAiMessage = (text) => {
    setMessages((prev) => [...prev, { id: createId(), type: "ai", text }]);
  };

  const addBillingHistoryMessage = (history) => {
    setMessages((prev) => [...prev, { id: createId(), type: "history", history }]);
  };

  const addSalesMessage = (sales) => {
    setMessages((prev) => [...prev, { id: createId(), type: "sales", sales }]);
  };

  /* =========================================================
     FIND BILL
  ========================================================= */
  const findBill = (customer) => {
    const name = String(customer || "").trim().toLowerCase();

    const working = Object.values(workingBills).find(
      (bill) => String(bill.customer || "").trim().toLowerCase() === name
    );

    if (working) {
      return working;
    }

    return bills.find((bill) => String(bill.customer || "").trim().toLowerCase() === name);
  };

  /* =========================================================
     UPDATE BILL MESSAGE
  ========================================================= */
  const updateBillMessage = (updatedBill) => {
    setMessages((prev) => {
      const index = prev.findIndex(
        (message) => message.type === "bill" && message.bill?.id === updatedBill.id
      );

      if (index === -1) {
        return [...prev, { id: createId(), type: "bill", bill: updatedBill }];
      }

      return prev.map((message, i) => (i === index ? { ...message, bill: updatedBill } : message));
    });
  };

  /* =========================================================
     PUT WORKING BILL
  ========================================================= */
  const putWorkingBill = (bill) => {
    const generatedBill = {
      ...bill,
      status: "Saved",
      updatedAt: new Date().toISOString(),
    };

    setWorkingBills((prev) => ({ ...prev, [generatedBill.id]: generatedBill }));

    setBills((prevBills) => {
      const existingIndex = prevBills.findIndex((item) => item.id === generatedBill.id);

      let updatedBills;

      if (existingIndex >= 0) {
        updatedBills = prevBills.map((item, index) =>
          index === existingIndex ? generatedBill : item
        );
      } else {
        updatedBills = [...prevBills, generatedBill];
      }

      saveBillsToStorage(updatedBills);
      return updatedBills;
    });

    updateBillMessage(generatedBill);
  };

  /* =========================================================
     CREATE / UPDATE BILL
  ========================================================= */
  const createOrUpdateBill = (customer, items) => {
    if (!customer) {
      addAiMessage(t("dashboard.customerRequired"));
      return;
    }

    if (!items.length) {
      addAiMessage(t("dashboard.itemQuantityRequired"));
      return;
    }

    const newBill = {
      id: createId(),
      customer,
      items,
      status: "Unsaved",
      createdAt: new Date().toISOString(),
    };

    putWorkingBill(newBill);
  };

  /* =========================================================
     EDIT / CHANGE / UPDATE COMMAND
  ========================================================= */
  const handleEditCommand = (rawText) => {
    let text = normalizeText(rawText);

    text = text
      .replace(/\b(kilograms?|kilos?|kgs?)\b/gi, "kg")
      .replace(/\b(grams?)\b/gi, "g")
      .replace(/\b(packets?|pkt)\b/gi, "packet")
      .replace(/\b(litres?|liters?)\b/gi, "litre");

    const match = text.match(/^(.+?)\s+(change|update|edit|replace)\s+(.+)$/i);

    if (!match) return false;

    const customer = match[1].trim();
    const command = match[3].trim();

    const bill = findBill(customer);

    if (!bill) {
      return false;
    }

    let product = null;

    for (const p of products) {
      const regex = new RegExp(`\\b${escapeRegExp(p.name)}\\b`, "i");
      if (regex.test(command)) {
        product = p;
        break;
      }
    }

    if (!product) {
      addAiMessage(t("dashboard.itemNotFound"));
      return true;
    }

    const productRegex = new RegExp(`\\b${escapeRegExp(product.name)}\\b`, "i");
    const productMatch = command.match(productRegex);

    let quantityText = command
      .substring(productMatch.index + productMatch[0].length)
      .trim();

    quantityText = quantityText.replace(/^(to|with|=)\s*/i, "").trim();

    const quantityMatch = quantityText.match(
      new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})?`, "i")
    );

    if (!quantityMatch) {
      addAiMessage(t("dashboard.example", {
        name: customer,
        edit: t("dashboard.editExample", { name: customer }),
      }));
      return true;
    }

    let quantity = Number(quantityMatch[1]);
    let unit = normalizeUnit(quantityMatch[2] || product.unit);

    if (unit === "g" && product.unit === "kg") {
      quantity = quantity / 1000;
      unit = "kg";
    }

    if (quantity <= 0) {
      addAiMessage(t("dashboard.quantityPositive"));
      return true;
    }

    const updatedItems = [...(bill.items || [])];

    const index = updatedItems.findIndex(
      (item) => item.name.toLowerCase() === product.name.toLowerCase()
    );

    const updatedItem = {
      id: index >= 0 ? updatedItems[index].id : createId(),
      name: product.name,
      price: product.price,
      quantity,
      unit,
      total: product.price * quantity,
    };

    if (index >= 0) {
      updatedItems[index] = updatedItem;
    } else {
      updatedItems.push(updatedItem);
    }

    const updatedBill = { ...bill, items: updatedItems, status: "Unsaved" };

    putWorkingBill(updatedBill);

    addAiMessage(
      t("dashboard.productChanged", {
        product: localizedProductNames[product.name] || product.name,
        quantity: `${formatQuantity(quantity)} ${unit}`,
      })
    );

    return true;
  };

  /* =========================================================
     ADD COMMAND
  ========================================================= */
  const handleAddCommand = (rawText) => {
    const text = normalizeText(rawText);

    const match = text.match(/^(.+?)\s+(add|insert)\s+(.+)$/i);

    if (!match) return false;

    const customer = match[1].trim();
    const productText = match[3].trim();

    const bill = findBill(customer);

    if (!bill) {
      return false;
    }

    const items = parseProducts(productText, products);

    if (!items.length) {
      addAiMessage(t("dashboard.itemNotFound"));
      return true;
    }

    const updatedItems = mergeProducts(bill.items || [], items);

    const updatedBill = { ...bill, items: updatedItems, status: "Unsaved" };

    putWorkingBill(updatedBill);

    addAiMessage(t("dashboard.itemAdded"));

    return true;
  };

  /* =========================================================
     REMOVE COMMAND
  ========================================================= */
  const handleRemoveCommand = (rawText) => {
    const text = normalizeText(rawText);

    const match = text.match(/^(.+?)\s+(remove|delete)\s+(.+)$/i);

    if (!match) return false;

    const customer = match[1].trim();
    const productName = match[3].trim();

    const bill = findBill(customer);

    if (!bill) {
      return false;
    }

    const product = getProduct(productName, products);

    if (!product) {
      addAiMessage(t("dashboard.itemNotFound"));
      return true;
    }

    const updatedItems = (bill.items || []).filter(
      (item) => item.name.toLowerCase() !== product.name.toLowerCase()
    );

    if (updatedItems.length === 0) {
      addAiMessage(t("dashboard.billNeedsItem"));
      return true;
    }

    const updatedBill = { ...bill, items: updatedItems, status: "Unsaved" };

    putWorkingBill(updatedBill);

    addAiMessage(t("dashboard.itemRemoved", {
      product: localizedProductNames[product.name] || product.name,
    }));

    return true;
  };

  /* =========================================================
     PROCESS MESSAGE
    Routed through the real AI backend; LangGraph owns conversation memory.
  ========================================================= */
  const processMessage = async (text, { displayNames = {}, unitsByName = {} } = {}) => {
    if (handleEditCommand(text)) return;
    if (handleAddCommand(text)) return;
    if (handleRemoveCommand(text)) return;

    try {
      const data = await callBillingChat(text, language);

      const results = data.results || {};

      if (results.calculate_bill) {
        const aiBill = results.calculate_bill;
        const customer = aiBill.customer_name || "Walk-in Customer";

        const notFound = (aiBill.items || []).filter((i) => i.error);
        if (notFound.length > 0) {
          addAiMessage(t("dashboard.productsNotFound", {
            products: notFound.map((i) =>
              localizedProductNames[i.name] || displayNames[i.name?.toLowerCase()] || i.name
            ).join(", "),
          }));
        }

        const validItems = (aiBill.items || [])
          .filter((i) => !i.error)
          .map((i) => ({
            id: createId(),
            name: i.name,
            displayName: localizedProductNames[i.name] || displayNames[i.name?.toLowerCase()] || i.name,
            price: i.unit_price,
            quantity: i.quantity,
            unit: unitsByName[i.name?.toLowerCase()] || "",
            total: i.total,
          }));

        if (validItems.length > 0) {
          createOrUpdateBill(customer, validItems);
        }
        return;
      }

      if (results.get_customer_billing_history) {
        const history = results.get_customer_billing_history;
        if (history.error) {
          addAiMessage(history.error);
        } else {
          addBillingHistoryMessage(history);
        }
        return;
      }

      if (results.get_shop_sales) {
        const sales = results.get_shop_sales;
        if (sales.error) {
          addAiMessage(sales.error);
        } else {
          addSalesMessage(sales);
        }
        return;
      }

      addAiMessage(data.reply || "Done.");
    } catch (error) {
      console.error("processMessage error:", error);
      addAiMessage(t("dashboard.processingError"));
    }
  };

  /* =========================================================
     SEND TEXT
  ========================================================= */
  const handleSendText = async (text) => {
    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    setMessages((prev) => [...prev, { id: createId(), type: "user", text: cleanText }]);
    setInput("");

    await processMessage(cleanText);
  };

  /* =========================================================
     SEND (handles typed text and/or a pending image together)
  ========================================================= */
  const handleSend = async () => {
    const typedText = input.trim();

    if (!pendingImage && !typedText) return;

    if (pendingImage) {
      const userLabel = typedText || "Uploaded image";
      setMessages((prev) => [
        ...prev,
        { id: createId(), type: "user", text: `📷 ${userLabel}` },
      ]);
      setInput("");

      addAiMessage(t("dashboard.readImage"));

      const formData = new FormData();
      formData.append("file", pendingImage);
      formData.append("language", language);
      removePendingImage();

      let ocrData;
      try {
        const response = await authFetch("/ocr/extract", {
          method: "POST",
          body: formData,
        });
        ocrData = await response.json();
      } catch (error) {
        console.error("OCR error:", error);
        addAiMessage(t("dashboard.imageReadFailed"));
        return;
      }

      const items = ocrData.items || [];

      if (items.length === 0) {
        addAiMessage(t("dashboard.noImageItems"));
        return;
      }

      const itemsText = items.map((i) => `${i.quantity} ${i.name}`).join(", ");
      const displayNames = Object.fromEntries(
        items.map((item) => [
          String(item.name || "").trim().toLowerCase(),
          item.display_name || item.name,
        ])
      );
      const unitsByName = Object.fromEntries(
        items.map((item) => [
          String(item.name || "").trim().toLowerCase(),
          item.unit || "",
        ])
      );
      const combinedMessage = typedText ? `${typedText}: ${itemsText}` : `Create a bill for ${itemsText}`;

      await processMessage(combinedMessage, { displayNames, unitsByName });
      return;
    }

    await handleSendText(typedText);
  };

  /* =========================================================
     VOICE
  ========================================================= */
  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addAiMessage(t("dashboard.voiceUnsupported"));
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = localeByLanguage[language] || "en-IN";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript.trim()) return;

      setInput(transcript);
      setTimeout(() => handleSendText(transcript), 100);
    };

    recognition.onerror = (event) => {
      console.error("Voice error:", event);
      setListening(false);
      addAiMessage(t("dashboard.voiceError"));
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setListening(false);
    }
  };

  /* =========================================================
     IMAGE — attach only, sending happens in handleSend
  ========================================================= */
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
  };

  const removePendingImage = () => {
    setPendingImage(null);
    setPendingImagePreview(null);
  };

  /* =========================================================
     EDIT BUTTON
  ========================================================= */
  const startEditingBill = (bill) => {
    const copied = {};

    (bill.items || []).forEach((item) => {
      copied[item.id] = { ...item };
    });

    setEditingItems(copied);
    setEditingBillId(bill.id);
  };

  /* =========================================================
     CHANGE EDITING QUANTITY
  ========================================================= */
  const changeEditingQuantity = (id, value) => {
    setEditingItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: value === "" ? "" : Number(value) },
    }));
  };

  /* =========================================================
     REMOVE WHILE EDITING
  ========================================================= */
  const removeEditingItem = (id) => {
    setEditingItems((prev) => {
      const updated = { ...prev };
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
      updatedItems = Object.values(editingItems)
        .filter((item) => item.quantity !== "" && Number(item.quantity) > 0)
        .map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          total: Number(item.price) * Number(item.quantity),
        }));
    } else {
      updatedItems = (bill.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
      }));
    }

    if (!updatedItems.length) {
      addAiMessage(t("dashboard.pleaseAddItem"));
      return;
    }

    const savedBill = {
      ...bill,
      items: updatedItems,
      status: "Saved",
      savedAt: new Date().toISOString(),
    };

    try {
      await authFetch("/billing/create", {
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
      addAiMessage(t("dashboard.savedLocally"));
    }

    const existingIndex = bills.findIndex((item) => item.id === savedBill.id);

    let updatedBills;

    if (existingIndex >= 0) {
      updatedBills = bills.map((item, index) => (index === existingIndex ? savedBill : item));
    } else {
      updatedBills = [...bills, savedBill];
    }

    saveBillsToStorage(updatedBills);
    setBills(updatedBills);

    setWorkingBills((prev) => {
      const updated = { ...prev };
      delete updated[savedBill.id];
      return updated;
    });

    updateBillMessage(savedBill);

    setEditingBillId(null);
    setEditingItems({});

    addAiMessage(t("dashboard.billSaved", { customer: savedBill.customer }));
  };

  /* =========================================================
     SHARE / SEND
  ========================================================= */
  const handleShare = async (bill) => {
    let text = `${displayShopName}\n\n`;
    text += `${t("dashboard.bill")}\n\n`;
    text += `${t("common.customer")}: ${bill.customer}\n\n`;

    (bill.items || []).forEach((item) => {
      text += `${localizedProductNames[item.name] || item.displayName || item.name} - ${formatQuantity(item.quantity)} ${item.unit} - ₹${(
        Number(item.price) * Number(item.quantity)
      ).toFixed(2)}\n`;
    });

    text += `\n${t("common.total")}: ${formatMoney(calculateTotal(bill.items), language)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: displayShopName, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        addAiMessage(t("dashboard.billCopied"));
      } else {
        addAiMessage(text);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================================
     BILL CARD
  ========================================================= */
  const BillCard = ({ bill }) => {
    const isEditing = editingBillId === bill.id;
    const items = isEditing ? Object.values(editingItems) : bill.items || [];
    const total = calculateTotal(items);
    const isSaved = bill.status === "Saved";

    return (
      <div
        className="retail-pos-bill my-3 w-full max-w-[720px] box-border overflow-hidden rounded-xl border border-gray-300 bg-white p-7 max-[600px]:my-3 max-[600px]:rounded-[10px] max-[600px]:p-4"
      >
        <div className="border-b-2 border-gray-900 pb-[18px] text-center">
          <div className="retail-pos-bill-shop-name mb-2 text-[32px] font-black leading-tight text-gray-900 max-[600px]:text-2xl">
            {displayShopName}
          </div>

          <div className="mb-3 text-base font-extrabold tracking-[3px] text-gray-700">
            {t("dashboard.bill")}
          </div>

          <div className="retail-pos-bill-customer text-xl font-extrabold text-gray-900 max-[600px]:text-base">
            {t("common.customer")}: {localizedCustomerNames[bill.customer] || bill.customer}
          </div>
        </div>

        <div className="mt-3 text-right">
          <span
            className={`inline-block rounded-full px-3 py-[5px] text-xs font-extrabold ${
              isSaved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {isSaved ? t("common.saved") : t("common.notSaved")}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_140px_120px] gap-2 border-b-2 border-gray-900 py-3 font-extrabold text-gray-900 max-[600px]:grid-cols-[minmax(0,1fr)_90px_85px] max-[600px]:gap-1.5 max-[420px]:grid-cols-[minmax(0,1fr)_72px_72px] max-[420px]:text-[13px]">
          <div>{t("common.item")}</div>
          <div className="text-center">{t("common.quantity")}</div>
          <div className="text-right">{t("common.amount")}</div>
        </div>

        {items.map((item) => (
          <div key={item.id}>
            <div className="retail-pos-bill-grid grid min-w-0 grid-cols-[minmax(0,1fr)_140px_120px] items-center gap-2 border-b border-gray-200 py-3.5 max-[600px]:grid-cols-[minmax(0,1fr)_90px_85px] max-[600px]:gap-1.5 max-[420px]:grid-cols-[minmax(0,1fr)_72px_72px] max-[420px]:text-[13px]">
              <div className="retail-pos-bill-item-name text-base font-bold text-gray-900 max-[600px]:break-words max-[600px]:text-sm">
                {localizedProductNames[item.name] || item.displayName || item.name}
              </div>

              <div className="text-center">
                {isEditing ? (
                  <div className="flex items-center justify-center gap-[5px]">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => changeEditingQuantity(item.id, e.target.value)}
                      className="w-[65px] rounded-md border border-gray-400 p-[7px]"
                    />
                    <span>{item.unit}</span>
                  </div>
                ) : (
                  <span className="font-bold">
                    {formatQuantity(item.quantity)} {item.unit}
                  </span>
                )}
              </div>

              <div className="text-right font-extrabold">
                ₹{(Number(item.price) * Number(item.quantity || 0)).toFixed(2)}
              </div>
            </div>

            {isEditing && (
              <div className="py-1.5 text-right">
                <button
                  onClick={() => removeEditingItem(item.id)}
                  className="cursor-pointer rounded-md border-0 bg-red-100 px-2.5 py-[5px] text-red-600"
                >
                  {t("common.delete")}
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="retail-pos-bill-total mt-[5px] flex items-center justify-between border-t-2 border-gray-900 pt-[18px] text-[21px] font-black max-[420px]:text-lg">
          <span>{t("common.total")}</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <div className="retail-pos-bill-actions mt-5 flex justify-center gap-2.5 max-[600px]:w-full max-[600px]:flex-wrap">
          <button
            onClick={() => startEditingBill(bill)}
            className="min-w-[90px] cursor-pointer rounded-[7px] border-0 bg-amber-500 px-[18px] py-2.5 font-extrabold text-white max-[600px]:min-w-0 max-[600px]:flex-[1_1_80px] max-[600px]:px-2.5 max-[600px]:py-[9px]"
          >
            {t("common.edit")}
          </button>

          <button
            onClick={() => saveBill(bill)}
            className="min-w-[90px] cursor-pointer rounded-[7px] border-0 bg-green-600 px-[18px] py-2.5 font-extrabold text-white max-[600px]:min-w-0 max-[600px]:flex-[1_1_80px] max-[600px]:px-2.5 max-[600px]:py-[9px]"
          >
            {t("dashboard.saveBill")}
          </button>

          <button
            onClick={() => handleShare(bill)}
            className="min-w-[90px] cursor-pointer rounded-[7px] border-0 bg-blue-600 px-[18px] py-2.5 font-extrabold text-white max-[600px]:min-w-0 max-[600px]:flex-[1_1_80px] max-[600px]:px-2.5 max-[600px]:py-[9px]"
          >
            {t("dashboard.send")}
          </button>
        </div>
      </div>
    );
  };

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="retail-pos-page min-h-screen bg-slate-50">
      <main className="retail-pos-main box-border min-h-[calc(100vh-70px)] px-6 pb-[140px] pt-[25px] max-[900px]:px-4 max-[900px]:pb-[155px] max-[600px]:px-2.5 max-[600px]:pb-[170px]">
        <div className="box-border flex w-full max-w-full flex-col items-stretch">
          {messages.map((message) => {
            if (message.type === "bill") {
              return (
                <div
                  key={message.id}
                  className="retail-pos-bill-wrapper box-border flex w-full items-start justify-start"
                >
                  <BillCard bill={message.bill} />
                </div>
              );
            }

            if (message.type === "history") {
              const history = message.history;
              const bills = Array.isArray(history.bills) ? history.bills : [];

              return (
                <div key={message.id} className="mb-3 flex w-full justify-start">
                  <section className="w-full max-w-[760px] rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm max-[600px]:px-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t("dashboard.purchaseHistory")}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {localizedCustomerNames[history.customer] || history.customer}
                        </h3>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                        {history.period}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-y border-slate-200 py-3">
                      <div>
                        <p className="text-xs text-slate-500">{t("dashboard.bills")}</p>
                        <p className="mt-0.5 font-semibold text-slate-900">{history.bill_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{t("dashboard.totalSpent")}</p>
                        <p className="mt-0.5 font-semibold text-slate-900">
                          {formatMoney(history.total_spent)}
                        </p>
                      </div>
                    </div>

                    {bills.length === 0 ? (
                      <p className="pt-4 text-sm text-slate-500">{t("dashboard.noPurchases")}</p>
                    ) : (
                      <ol className="divide-y divide-slate-100">
                        {bills.map((bill, index) => (
                          <li key={bill._id || index} className="py-3 first:pb-3 last:pb-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                              <p className="font-semibold text-slate-800">{t("dashboard.bill")} {index + 1}</p>
                              <time className="text-xs text-slate-500">
                                {formatBillDate(bill.created_at, language) || t("dashboard.dateUnavailable")}
                              </time>
                            </div>
                            <ul className="mt-2 space-y-1.5">
                              {(bill.items || []).map((item, itemIndex) => {
                                const quantity = Number(item.quantity || 0);
                                const itemTotal = item.total ?? item.subtotal ??
                                  Number(item.unit_price || 0) * quantity;
                                return (
                                  <li
                                    key={`${item.name}-${itemIndex}`}
                                    className="flex justify-between gap-4 text-sm text-slate-600"
                                  >
                                    <span>{localizedProductNames[item.name] || item.name} × {quantity}</span>
                                    <span className="shrink-0">{formatMoney(itemTotal, language)}</span>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
                              <span>{t("dashboard.billTotal")}</span>
                              <span>{formatMoney(bill.grand_total ?? bill.total, language)}</span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                </div>
              );
            }

            if (message.type === "sales") {
              const sales = message.sales;
              return (
                <div key={message.id} className="mb-3 flex w-full justify-start">
                  <section className="w-full max-w-[560px] rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm max-[600px]:px-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("dashboard.shopSales")}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{sales.period}</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3 max-[420px]:grid-cols-1">
                      <div>
                        <p className="text-xs text-slate-500">{t("dashboard.bills")}</p>
                        <p className="mt-1 font-semibold text-slate-900">{sales.bill_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{t("dashboard.totalSales")}</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatMoney(sales.total_sales, language)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{t("dashboard.averageBill")}</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatMoney(sales.average_bill, language)}</p>
                      </div>
                    </div>
                  </section>
                </div>
              );
            }

            const isWelcome = message.type === "ai" && messages.length === 1;

            return (
              <div
                key={message.id}
                className={`mb-3 flex w-full ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`retail-pos-message-bubble break-words text-left ${
                    isWelcome
                      ? "mt-5 max-w-[650px] rounded-2xl bg-white px-10 py-[30px] text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-[900px]:max-w-[88%] max-[600px]:max-w-[92%] max-[600px]:px-[13px] max-[600px]:py-2.5"
                      : "max-w-[75%] rounded-2xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] max-[900px]:max-w-[88%] max-[600px]:max-w-[92%] max-[600px]:px-[13px] max-[600px]:py-2.5"
                  } ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  {isWelcome ? (
                    <div className="retail-pos-welcome text-[30px] font-black text-gray-900 max-[600px]:text-[22px]">
                        {t("dashboard.welcome", { shopName: displayShopName })}
                    </div>
                  ) : (
                    <span className={message.type === "ai" ? "whitespace-pre-line" : ""}>
                      {message.type === "ai" ? formatAssistantText(message.text) : message.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* BOTTOM INPUT BAR — image preview chip lives INSIDE this fixed bar now */}
      <div
        className={`retail-pos-bottom-bar fixed bottom-0 right-0 z-[100] border-t border-gray-200 bg-white ${
          sidebarExpanded ? "left-0 md:left-64" : "left-0"
        }`}
      >
        {pendingImagePreview && (
          <div className="retail-pos-bottom-preview flex items-center gap-2.5 border-b border-gray-200 bg-slate-100 px-5 py-2.5 max-[600px]:px-2.5 max-[600px]:py-2">
            <img
              src={pendingImagePreview}
              alt={t("dashboard.imagePreview")}
              className="h-10 w-10 rounded-md object-cover"
            />
            <span className="text-[13px] text-slate-600">
              {t("dashboard.imageAttached")}
            </span>
            <button
              onClick={removePendingImage}
              className="ml-auto cursor-pointer border-0 bg-transparent text-base"
            >
              ✕
            </button>
          </div>
        )}

        <div className="retail-pos-bottom-content px-5 py-3 max-[600px]:px-2.5 max-[600px]:py-[9px]">
          <div className="retail-pos-input-row mx-auto flex w-full max-w-[1000px] items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              className="retail-pos-input h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3.5 text-[15px] outline-none max-[600px]:text-sm"
              placeholder={
                t("dashboard.placeholder")
              }
            />

            <button
              className="retail-pos-icon-button h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white text-[19px] max-[600px]:h-10 max-[600px]:w-10"
              onClick={() => imageInputRef.current?.click()}
              title={t("dashboard.uploadImage")}
            >
              📷
            </button>

            <button
              className={`retail-pos-icon-button h-11 w-11 shrink-0 cursor-pointer rounded-lg border-0 text-[19px] max-[600px]:h-10 max-[600px]:w-10 ${
                listening ? "bg-red-600 text-white" : "bg-slate-100 text-gray-900"
              }`}
              onClick={handleVoice}
              title={listening ? t("dashboard.stopListening") : t("dashboard.voiceCommand")}
            >
              🎤
            </button>

            <button
              className="retail-pos-send-button h-11 shrink-0 cursor-pointer rounded-lg border-0 bg-blue-600 px-5 font-extrabold text-white max-[600px]:h-10 max-[600px]:px-[13px]"
              onClick={handleSend}
            >
              {t("dashboard.send")}
            </button>
          </div>

          <div className="retail-pos-helper mx-auto mt-[7px] max-w-[1000px] break-words text-xs text-slate-500 max-[600px]:text-[11px] max-[600px]:leading-[1.4]">
            {t("dashboard.example", {
              name: "Rahul",
              edit: t("dashboard.editExample", { name: "Rahul" }),
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
