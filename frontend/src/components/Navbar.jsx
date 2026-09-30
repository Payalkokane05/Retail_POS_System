import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { supportedLanguages } from "../i18n";
import { useLocalizedNames } from "../hooks/useLocalizedNames";
import { authFetch } from "../api";

function Navbar({ shopName, userName, onOpenMenu, sidebarExpanded }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const localizedShopNames = useLocalizedNames([shopName], "shop");
  const localizedUserNames = useLocalizedNames([userName], "person");
  const displayShopName = localizedShopNames[shopName] || shopName;
  const displayUserName = localizedUserNames[userName] || userName;
  const [accountOpen, setAccountOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const accountRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
      if (!languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setLanguageOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("posLoggedIn");
    window.location.href = "/login";
  };

  const handleClearChat = async () => {
    if (!window.confirm(t("nav.clearChatConfirm"))) return;

    setClearingChat(true);
    try {
      const response = await authFetch("/billing/agent/history", { method: "DELETE" });
      if (!response.ok) throw new Error("Chat history could not be cleared.");

      localStorage.removeItem("retailChatHistory");
      localStorage.setItem("retailChatClearedAt", new Date().toISOString());
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      window.alert(t("nav.clearChatFailed"));
    } finally {
      setClearingChat(false);
    }
  };

  return (
    <header className={`fixed right-0 top-0 z-[50] flex min-h-[68px] items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-2.5 transition-[left] duration-300 max-[900px]:px-4 max-[600px]:min-h-[60px] max-[600px]:gap-2 max-[600px]:px-3 ${sidebarExpanded ? "left-0 md:left-64" : "left-0"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t("nav.openMenu")}
          title={t("nav.openMenu")}
          className={`h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-slate-100 max-[600px]:h-9 max-[600px]:w-9 ${sidebarExpanded ? "flex md:hidden" : "flex"}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="min-w-0 truncate text-[24px] font-black text-gray-900 max-[600px]:text-lg" title={displayShopName}>
          {displayShopName}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 max-[600px]:gap-1.5">
        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => {
              setAccountOpen((open) => !open);
              setLanguageOpen(false);
            }}
            aria-label={t("nav.account")}
            aria-expanded={accountOpen}
            title={t("nav.account")}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-800 hover:bg-slate-100 max-[600px]:h-9 max-[600px]:w-9 max-[600px]:justify-center max-[600px]:p-0"
          >
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4.5 21a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span className="max-w-28 truncate max-[600px]:hidden">{displayUserName}</span>
          </button>
          {accountOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-60 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="text-xs text-slate-500">{t("nav.signedInAs")}</p>
                <p className="truncate font-semibold text-gray-900">{displayUserName}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={languageRef}>
          <button
            type="button"
            onClick={() => {
              setLanguageOpen((open) => !open);
              setAccountOpen(false);
            }}
            aria-label={t("nav.chooseLanguage")}
            aria-expanded={languageOpen}
            title={t("nav.chooseLanguage")}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-800 hover:bg-slate-100 max-[600px]:h-9 max-[600px]:w-9 max-[600px]:justify-center max-[600px]:p-0"
          >
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <span className="max-[600px]:hidden">{supportedLanguages.find(({ code }) => code === language)?.label}</span>
          </button>
          {languageOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-40 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl">
              {supportedLanguages.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLanguage(code);
                    setLanguageOpen(false);
                  }}
                  className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm ${language === code ? "bg-blue-50 font-bold text-blue-700" : "text-gray-700 hover:bg-slate-100"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          disabled={clearingChat}
          aria-label={t("nav.clearChat")}
          title={t("nav.clearChat")}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 max-[600px]:h-9 max-[600px]:w-9 max-[600px]:justify-center max-[600px]:p-0"
        >
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
          </svg>
          <span className="max-[600px]:hidden">{clearingChat ? t("common.loading") : t("nav.clearChat")}</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;