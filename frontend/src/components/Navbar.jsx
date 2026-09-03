import React from "react";
import { useLanguage } from "../context/LanguageContext";

function Navbar() {
  const { language, setLanguage } = useLanguage();

  const text = {
    en: {
      admin: "Admin",
      logout: "Logout",
    },

    mr: {
      admin: "अॅडमिन",
      logout: "बाहेर पडा",
    },

    hi: {
      admin: "एडमिन",
      logout: "लॉग आउट",
    },
  };

  const t = text[language || "en"];

  const handleLogout = () => {
    localStorage.removeItem("posLoggedIn");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex min-h-[82px] items-center justify-between px-6">

        {/* SHOP NAME */}

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Shree Ganesh Grocery
          </h1>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4">

          {/* LANGUAGE */}

          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>

            <select
              value={language || "en"}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* ADMIN */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {t.admin}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              A
            </div>

          </div>

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
          >
            → {t.logout}
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;