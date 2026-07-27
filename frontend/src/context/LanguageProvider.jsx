import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LanguageContext } from "./LanguageContext";
import { API_URL } from "../config/api";

// MVP has a single demo user — no login/auth yet (see backend/routes/users.js).
const DEMO_USER_ID = 1;

const LANGUAGE_STORAGE_KEY = "wayoPreferredLanguage";
const DEFAULT_LANGUAGE = "en";
const DEFAULT_FONT_FAMILY = "Inter";

// Used until /api/languages answers, and if it never does — same two
// languages the migration seeds, so the Profile switcher still works offline.
const FALLBACK_LANGUAGES = [
  { code: "en", name: "English", native_name: "English", font_family: DEFAULT_FONT_FAMILY },
  { code: "uk", name: "Ukrainian", native_name: "Українська", font_family: DEFAULT_FONT_FAMILY },
];

function loadStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export default function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => loadStoredLanguage() || DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILY);
  const [availableLanguages, setAvailableLanguages] = useState(FALLBACK_LANGUAGES);
  const [isLoading, setIsLoading] = useState(true);
  const appliedUserLanguage = useRef(false);

  // MySQL is the source of truth for the demo user's language. On first
  // load, ask the backend for it; if that succeeds it overrides whatever
  // localStorage/default gave the initial state above. If the backend isn't
  // reachable, we just keep going with localStorage/English.
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/users/${DEMO_USER_ID}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || appliedUserLanguage.current) return;
        appliedUserLanguage.current = true;
        if (data?.preferred_language) {
          setCurrentLanguage(data.preferred_language);
        }
      })
      .catch(() => {
        // Backend not reachable — localStorage/default value already applied.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Best-effort list of active languages, used to render the Profile switcher.
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/languages`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setAvailableLanguages(data);
      })
      .catch(() => {
        // Keep the hardcoded fallback list above.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch translations whenever the active language changes. Only one
  // request per language change (not per component/render), since every
  // consumer shares this one provider instance.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    fetch(`${API_URL}/api/translations/${currentLanguage}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTranslations(data.translations || {});
        setFontFamily(data.fontFamily || DEFAULT_FONT_FAMILY);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load translations:", err);
        // Fall back to English rather than leaving the page blank or stuck
        // on raw keys. If English itself just failed, clear translations so
        // every t() call falls through to its own hardcoded fallback text.
        if (currentLanguage !== DEFAULT_LANGUAGE) {
          setCurrentLanguage(DEFAULT_LANGUAGE);
        } else {
          setTranslations({});
          setFontFamily(DEFAULT_FONT_FAMILY);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  // Keep localStorage and <html lang> in sync with the active language.
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch {
      // localStorage unavailable — MySQL (via changeLanguage below) stays
      // the main persistent value regardless.
    }
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Inter stays the font for both languages — this just keeps the root
  // element in sync with whatever the backend reports for the active language.
  // Inter itself is never actually loaded as a web font in this project (no
  // @font-face/Google Fonts link), so it must never be set alone: setting an
  // inline style with just "Inter" replaces Tailwind's default sans-serif
  // fallback stack outright, and the browser falls back to ITS default
  // (serif on most systems) instead. Appending the same fallback stack
  // Tailwind's preflight uses keeps the rendered font unchanged.
  useEffect(() => {
    document.documentElement.style.fontFamily = `${fontFamily}, ui-sans-serif, system-ui, sans-serif`;
  }, [fontFamily]);

  const changeLanguage = useCallback((languageCode) => {
    // Update immediately so the UI reflects the choice without a refresh —
    // localStorage (effect above) and the translations fetch both follow
    // from this state change.
    setCurrentLanguage(languageCode);

    fetch(`${API_URL}/api/users/${DEMO_USER_ID}/language`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageCode }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
      })
      .catch((err) => {
        // MySQL write failed — the choice still applies locally via
        // localStorage, so nothing is lost. Log it, no browser alert.
        console.error("Failed to save preferred language to the backend:", err);
      });
  }, []);

  const t = useCallback((key, fallback = "") => translations[key] ?? fallback, [translations]);

  const value = useMemo(
    () => ({
      currentLanguage,
      translations,
      fontFamily,
      changeLanguage,
      t,
      isLoading,
      availableLanguages,
    }),
    [currentLanguage, translations, fontFamily, changeLanguage, t, isLoading, availableLanguages]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
