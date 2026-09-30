import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { supportedLanguages } from "../i18n";

function LanguagePicker({ className = "" }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <label>
      <span className="sr-only">{t("nav.chooseLanguage")}</span>
      <select
        aria-label={t("nav.chooseLanguage")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className={`h-10 max-w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
      >
        {supportedLanguages.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export default LanguagePicker;