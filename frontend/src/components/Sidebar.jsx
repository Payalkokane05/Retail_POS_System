import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedNames } from "../hooks/useLocalizedNames";

function Sidebar({ desktopOpen, mobileOpen, onToggleDesktop, onCloseMobile }) {
  const { t } = useTranslation();

  const shopName =
    localStorage.getItem("shopName") ||
    "Shree Ganesh Grocery";
  const localizedShopNames = useLocalizedNames([shopName], "shop");
  const displayShopName = localizedShopNames[shopName] || shopName;

  const items = [
    {
      path: "/dashboard",
      label: t("nav.dashboard"),
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
      label: t("nav.products"),
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
      label: t("nav.customers"),
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
      label: t("nav.bills"),
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 2h9l5 5v15H6z" />
          <path d="M15 2v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* =========================
          MOBILE OVERLAY
      ========================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      <aside
        className={`
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
          transition-transform
          duration-300
          ${desktopOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* SHOP HEADER */}
        <div
          className="
            relative
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
            <h2
              className="
                break-words
                text-2xl
                font-extrabold
                leading-tight
                text-white
              "
              title={displayShopName}
            >
              {displayShopName}
            </h2>

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
              {t("nav.retailPos")}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleDesktop}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("nav.operations")}
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
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }
                  `
                }
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* =========================
          MOBILE SIDEBAR
      ========================== */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-[80]
          h-screen
          w-[280px]
          max-w-[85vw]
          flex-col
          bg-slate-950
          text-white
          shadow-2xl
          transition-transform
          duration-300
          md:hidden
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE SHOP HEADER */}
        <div
          className="
            flex
            h-[120px]
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-800
            px-5
          "
        >
          <div className="min-w-0 pr-3">
            <h2
              className="
                break-words
                text-xl
                font-extrabold
                leading-tight
                text-white
              "
              title={displayShopName}
            >
              {displayShopName}
            </h2>

            <p
              className="
                mt-2
                text-lg
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

          {/* CLOSE BUTTON */}
          <button
            onClick={onCloseMobile}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-300
              hover:bg-slate-800
              hover:text-white
            "
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.operations}
          </p>

          <nav className="space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
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
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }
                  `
                }
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;