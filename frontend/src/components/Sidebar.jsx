import React from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Sidebar() {
  const { language } = useLanguage();

  const text = {
    en: {
      dashboard: "Dashboard",
      products: "Products",
      customers: "Customers",
      operations: "Retail Operations",
      retailPOS: "Retail POS",
    },

    mr: {
      dashboard: "डॅशबोर्ड",
      products: "उत्पादने",
      customers: "ग्राहक",
      operations: "रिटेल ऑपरेशन्स",
      retailPOS: "रिटेल POS",
    },

    hi: {
      dashboard: "डैशबोर्ड",
      products: "उत्पाद",
      customers: "ग्राहक",
      operations: "रिटेल ऑपरेशन्स",
      retailPOS: "रिटेल POS",
    },
  };

  const t = text[language || "en"];

  const shopName =
    localStorage.getItem("shopName") ||
    "Shree Ganesh Grocery";

  const items = [
    {
      path: "/dashboard",
      label: t.dashboard,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },

    {
      path: "/products",
      label: t.products,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      ),
    },

    {
      path: "/customers",
      label: t.customers,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      path: "/bills",
      label: "Bills",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2h9l5 5v15H6z" />
          <path d="M15 2v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      ),
    },

  ];

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-40
        hidden
        h-screen
        w-64
        flex-col
        bg-slate-950
        text-white
        md:flex
      "
    >
      {/* =========================
          SHOP HEADER
      ========================== */}

      <div
        className="
          flex
          h-[120px]
          shrink-0
          items-center
          border-b
          border-slate-800
          px-5
        "
      >
        <div className="min-w-0 w-full">

          {/* SHOP NAME FIRST */}

          <h2
            className="
              break-words
              text-2xl
              font-extrabold
              leading-tight
              text-white
            "
            title={shopName}
          >
            {shopName}
          </h2>

          {/* RETAIL POS SECOND */}

          <p
            className="
              mt-2
              text-xl
              font-extrabold
              uppercase
              tracking-wider
              leading-tight
              text-blue-400
            "
          >
            {t.retailPOS}
          </p>

        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}

      <div className="flex-1 overflow-y-auto px-3 py-7">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t.operations}
        </p>

        <nav className="space-y-2">

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3.5
                text-sm
                font-semibold
                transition-all

                ${isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }
                `
              }
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}

        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;