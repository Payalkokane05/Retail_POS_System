import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

function Customers() {
  const { language } = useLanguage();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const text = {
    en: {
      title: "Customers",
      subtitle:
        "Customer records created from your billing conversations",
      search: "Search customer...",
      noCustomers: "No customer records found",
      noCustomersDesc:
        "Generate a bill from the Dashboard to automatically save customer data here.",
      purchases: "Purchases",
      totalSpent: "Total Spent",
      bills: "Bills",
      lastPurchase: "Last Purchase",
      view: "View Details",
      close: "Close",
      customerDetails: "Customer Details",
      purchaseHistory: "Purchase History",
      invoice: "Invoice",
      noHistory: "No purchase history.",
    },

    mr: {
      title: "ग्राहक",
      subtitle:
        "तुमच्या बिलिंग संभाषणातून तयार झालेली ग्राहक माहिती",
      search: "ग्राहक शोधा...",
      noCustomers: "ग्राहकांची माहिती उपलब्ध नाही",
      noCustomersDesc:
        "Dashboard मधून बिल तयार करा. ग्राहकाची माहिती आपोआप येथे सेव्ह होईल.",
      purchases: "खरेदी",
      totalSpent: "एकूण खर्च",
      bills: "बिले",
      lastPurchase: "शेवटची खरेदी",
      view: "माहिती पहा",
      close: "बंद करा",
      customerDetails: "ग्राहकाची माहिती",
      purchaseHistory: "खरेदी इतिहास",
      invoice: "बिल क्रमांक",
      noHistory: "खरेदी इतिहास उपलब्ध नाही.",
    },

    hi: {
      title: "ग्राहक",
      subtitle:
        "आपकी बिलिंग बातचीत से बनाई गई ग्राहक जानकारी",
      search: "ग्राहक खोजें...",
      noCustomers: "ग्राहक रिकॉर्ड उपलब्ध नहीं है",
      noCustomersDesc:
        "Dashboard से बिल बनाएं। ग्राहक की जानकारी अपने आप यहां सेव हो जाएगी।",
      purchases: "खरीदारी",
      totalSpent: "कुल खर्च",
      bills: "बिल",
      lastPurchase: "आखिरी खरीदारी",
      view: "विवरण देखें",
      close: "बंद करें",
      customerDetails: "ग्राहक की जानकारी",
      purchaseHistory: "खरीदारी इतिहास",
      invoice: "बिल नंबर",
      noHistory: "खरीदारी इतिहास उपलब्ध नहीं है।",
    },
  };

  const t = text[language || "en"];

  // =========================
  // LOAD CUSTOMERS
  // =========================

  const loadCustomers = () => {
    try {
      const saved =
        localStorage.getItem("posCustomers");

      if (!saved) {
        setCustomers([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setCustomers(parsed);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error(
        "Customer data loading error:",
        error
      );

      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers();

    const handleStorage = () => {
      loadCustomers();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // =========================
  // INITIAL LETTER
  // =========================

  const getInitial = (name) => {
    if (!name) return "?";

    const cleanName = String(name).trim();

    if (!cleanName) return "?";

    return cleanName
      .charAt(0)
      .toUpperCase();
  };

  // =========================
  // SEARCH
  // =========================

  const filteredCustomers =
    customers.filter((customer) =>
      String(customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString(
      language === "mr"
        ? "mr-IN"
        : language === "hi"
        ? "hi-IN"
        : "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // SAFE NUMBER
  // =========================

  const safeNumber = (value) => {
    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">

      {/* =========================
          PAGE CONTENT
      ========================== */}

      <div className="w-full px-4 pb-10 pt-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Smart Retail POS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {t.title}
          </h1>

          <p className="mt-2 text-slate-500">
            {t.subtitle}
          </p>

        </div>

        {/* SEARCH */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder={t.search}
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                py-3
                pl-12
                pr-4
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

        </div>

        {/* CUSTOMER LIST */}

        {filteredCustomers.length === 0 ? (

          <div className="
            flex
            min-h-[420px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          ">

            <div className="
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-4xl
            ">
              👥
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              {t.noCustomers}
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              {t.noCustomersDesc}
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredCustomers.map(
              (customer) => (

                <div
                  key={
                    customer.id ||
                    customer.name
                  }
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                  "
                >

                  <div className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  ">

                    {/* CUSTOMER */}

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-100
                        text-xl
                        font-bold
                        text-blue-700
                      ">
                        {getInitial(
                          customer.name
                        )}
                      </div>

                      <div className="min-w-0">

                        <h2 className="
                          truncate
                          text-lg
                          font-bold
                          text-slate-900
                        ">
                          {customer.name ||
                            "Unknown Customer"}
                        </h2>

                        {customer.phone && (
                          <p className="mt-1 text-sm text-slate-500">
                            📞 {customer.phone}
                          </p>
                        )}

                        {customer.email && (
                          <p className="mt-1 text-sm text-slate-500">
                            ✉️ {customer.email}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* STATS */}

                    <div className="
                      grid
                      grid-cols-2
                      gap-3
                      sm:grid-cols-4
                    ">

                      <InfoBox
                        label={t.purchases}
                        value={safeNumber(
                          customer.purchases
                        )}
                      />

                      <InfoBox
                        label={t.bills}
                        value={safeNumber(
                          customer.bills
                        )}
                      />

                      <InfoBox
                        label={t.totalSpent}
                        value={`₹${safeNumber(
                          customer.totalSpent
                        )}`}
                      />

                      <InfoBox
                        label={t.lastPurchase}
                        value={formatDate(
                          customer.lastPurchase
                        )}
                      />

                    </div>

                    {/* VIEW */}

                    <button
                      onClick={() =>
                        setSelectedCustomer(
                          customer
                        )
                      }
                      className="
                        rounded-xl
                        bg-blue-600
                        px-5
                        py-3
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        active:scale-95
                      "
                    >
                      {t.view}
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =========================
          CUSTOMER MODAL
      ========================== */}

      {selectedCustomer && (

        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-slate-950/50
          p-4
        ">

          <div className="
            flex
            max-h-[90vh]
            w-full
            max-w-3xl
            flex-col
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            {/* MODAL HEADER */}

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-200
              p-6
            ">

              <div className="flex items-center gap-4">

                <div className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  text-lg
                  font-bold
                  text-blue-700
                ">
                  {getInitial(
                    selectedCustomer.name
                  )}
                </div>

                <div>

                  <p className="text-sm font-semibold text-blue-600">
                    {t.customerDetails}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedCustomer.name}
                  </h2>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-2
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                ✕
              </button>

            </div>

            {/* SUMMARY */}

            <div className="
              grid
              shrink-0
              gap-4
              border-b
              bg-slate-50
              p-6
              sm:grid-cols-3
            ">

              <InfoBox
                label={t.bills}
                value={safeNumber(
                  selectedCustomer.bills
                )}
              />

              <InfoBox
                label={t.purchases}
                value={safeNumber(
                  selectedCustomer.purchases
                )}
              />

              <InfoBox
                label={t.totalSpent}
                value={`₹${safeNumber(
                  selectedCustomer.totalSpent
                )}`}
              />

            </div>

            {/* HISTORY */}

            <div className="overflow-y-auto p-6">

              <h3 className="mb-4 text-lg font-bold text-slate-900">
                {t.purchaseHistory}
              </h3>

              {!selectedCustomer.history ||
              selectedCustomer.history.length === 0 ? (

                <div className="
                  rounded-xl
                  border
                  border-dashed
                  border-slate-300
                  p-8
                  text-center
                  text-sm
                  text-slate-500
                ">
                  {t.noHistory}
                </div>

              ) : (

                <div className="space-y-4">

                  {selectedCustomer.history
                    .slice()
                    .reverse()
                    .map(
                      (bill, index) => (

                        <div
                          key={
                            bill.id ||
                            index
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            p-4
                          "
                        >

                          <div className="
                            mb-4
                            flex
                            flex-col
                            justify-between
                            gap-2
                            sm:flex-row
                            sm:items-center
                          ">

                            <div>

                              <p className="font-bold text-slate-900">
                                {t.invoice}:{" "}
                                {bill.invoice ||
                                  `INV-${index + 1}`}
                              </p>

                              <p className="text-sm text-slate-500">
                                {formatDate(
                                  bill.date
                                )}
                              </p>

                            </div>

                            <p className="text-lg font-bold text-blue-600">
                              ₹
                              {safeNumber(
                                bill.total
                              )}
                            </p>

                          </div>

                          <div className="space-y-2">

                            {(bill.items || []).map(
                              (
                                item,
                                itemIndex
                              ) => {

                                const quantity =
                                  safeNumber(
                                    item.quantity
                                  );

                                const price =
                                  safeNumber(
                                    item.price
                                  );

                                return (
                                  <div
                                    key={
                                      item.id ||
                                      itemIndex
                                    }
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      rounded-lg
                                      bg-slate-50
                                      px-3
                                      py-3
                                    "
                                  >

                                    <div>

                                      <p className="font-medium text-slate-800">
                                        {item.name}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {quantity} × ₹
                                        {price}
                                      </p>

                                    </div>

                                    <p className="font-semibold text-slate-800">
                                      ₹
                                      {quantity *
                                        price}
                                    </p>

                                  </div>
                                );
                              }
                            )}

                          </div>

                        </div>

                      )
                    )}

                </div>

              )}

            </div>

            {/* CLOSE */}

            <div className="
              shrink-0
              border-t
              border-slate-200
              p-5
              text-right
            ">

              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-5
                  py-2.5
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                {t.close}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="
      min-w-[100px]
      rounded-xl
      border
      border-slate-200
      bg-white
      px-4
      py-3
    ">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

export default Customers;