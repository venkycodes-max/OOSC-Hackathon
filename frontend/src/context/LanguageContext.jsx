import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
];

const STORAGE_KEY = "trailhead_language";

function setGoogleCookie(code) {
  // Google Translate reads this cookie when the widget is initialized.
  const value = code === "en" ? "/en/en" : `/en/${code}`;
  document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax`;
}

function hideGoogleBanner() {
  // CSS handles this globally. This function is intentionally finite:
  // there is NO MutationObserver or polling loop here.
  document.documentElement.classList.add("trailhead-translation-active");
  document.body.style.top = "0px";
  document.body.classList.remove("goog-te-banner-open");
}

function getCombo() {
  return document.querySelector("select.goog-te-combo");
}

function applyGoogleLanguage(code) {
  setGoogleCookie(code);
  hideGoogleBanner();

  const combo = getCombo();
  if (!combo) return false;

  if (combo.value !== code) combo.value = code;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function loadGoogleTranslate() {
  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit?.();
    return;
  }

  if (document.querySelector('script[data-trailhead-google-translate="true"]')) return;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;

    const host = document.getElementById("google_translate_element");
    if (!host || host.dataset.ready === "true") return;

    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi,de,es,fr,ru,ja",
        autoDisplay: false,
      },
      "google_translate_element"
    );

    host.dataset.ready = "true";
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.dataset.trailheadGoogleTranslate = "true";
  document.body.appendChild(script);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en"
  );
  const firstApply = useRef(true);

  // Load Google Translate ONCE for the lifetime of the application.
  // The previous implementation recreated observers/timers whenever the
  // language changed, which could create a DOM mutation feedback loop and
  // freeze the browser. This effect deliberately has an empty dependency list.
  useEffect(() => {
    setGoogleCookie(language);
    hideGoogleBanner();
    loadGoogleTranslate();

    return () => {
      // Do not remove the Google script or widget during route changes.
      // Nothing is observed or polled, so there is no background work to clean up.
    };
  }, []);

  // Apply the selected language with a small, bounded number of attempts.
  // There is deliberately no MutationObserver and no setInterval.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    setGoogleCookie(language);

    const apply = () => {
      hideGoogleBanner();
      applyGoogleLanguage(language);
    };

    // The first render may happen before Google's combo exists.
    const firstTimer = window.setTimeout(apply, firstApply.current ? 250 : 0);
    const secondTimer = window.setTimeout(apply, 900);
    firstApply.current = false;

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
    };
  }, [language]);

  function changeLanguage(code) {
    if (!LANGUAGES.some((item) => item.code === code)) return;
    if (code === language) return;

    localStorage.setItem(STORAGE_KEY, code);
    setLanguage(code);
  }

  return (
    <LanguageContext.Provider value={{ language, languages: LANGUAGES, changeLanguage }}>
      {children}
      <div
        id="google_translate_element"
        className="google-translate-host"
        aria-hidden="true"
      />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
