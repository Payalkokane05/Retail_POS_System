import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../api";

const pendingRequests = new Map();

const fetchNameTranslations = async (language, kind, names) => {
  const translations = {};
  for (let offset = 0; offset < names.length; offset += 100) {
    const response = await authFetch("/localization/names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, kind, names: names.slice(offset, offset + 100) }),
    });
    if (!response.ok) throw new Error("Name localization failed.");
    const data = await response.json();
    Object.assign(translations, data.translations || {});
  }
  return translations;
};

export function useLocalizedNames(names, kind) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || "en";
  const uniqueNames = [...new Set(names.filter(Boolean))];
  const namesKey = JSON.stringify(uniqueNames);
  const cacheKey = `${language}:${kind}:${namesKey}`;
  const [result, setResult] = useState({ key: "", translations: {} });

  useEffect(() => {
    let active = true;
    const requestedNames = JSON.parse(namesKey);
    const fallback = Object.fromEntries(requestedNames.map((name) => [name, name]));

    if (language === "en" || requestedNames.length === 0) {
      return () => {
        active = false;
      };
    }

    const requestKey = `${language}:${kind}:${namesKey}`;
    let request = pendingRequests.get(requestKey);
    if (!request) {
      request = fetchNameTranslations(language, kind, requestedNames)
        .catch((error) => {
          console.error("Failed to localize names:", error);
          return {};
        })
        .finally(() => pendingRequests.delete(requestKey));
      pendingRequests.set(requestKey, request);
    }

    request.then((translations) => {
      if (active) {
        setResult({ key: cacheKey, translations: { ...fallback, ...translations } });
      }
    });

    return () => {
      active = false;
    };
  }, [cacheKey, kind, language, namesKey]);

  if (result.key !== cacheKey) {
    return Object.fromEntries(uniqueNames.map((name) => [name, name]));
  }
  return result.translations;
}