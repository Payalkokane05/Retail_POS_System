import React, { createContext, useContext, useEffect, useState } from "react";
import i18n, { supportedLanguages } from "../i18n";

const LanguageContext = createContext(null);

const getSupportedLanguage = (value) =>
  supportedLanguages.some(({ code }) => code === value) ? value : "en";

const localeTags = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  te: "te-IN",
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() =>
    getSupportedLanguage(localStorage.getItem("posLanguage"))
  );

  useEffect(() => {
    document.documentElement.lang = localeTags[language];
    i18n.changeLanguage(language);
  }, [language]);

  const setLanguage = (value) => {
    const nextLanguage = getSupportedLanguage(value);
    localStorage.setItem("posLanguage", nextLanguage);
    setLanguageState(nextLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}