import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import avatar from "../assets/Avatar.png";
import settingsIcon from "../assets/SettingsIcon.png";
import { LanguageContext } from "../context/LanguageContext";
import { accessibilityPreferenceKeyMap, preferenceKeyMap, translateLabel } from "../i18n/labelKeys";

function Chip({ children, active, onClick, role, ariaChecked }) {
  return (
    <button
      type="button"
      role={role}
      onClick={onClick}
      aria-pressed={role ? undefined : active}
      aria-checked={role === "radio" ? ariaChecked : undefined}
      className={[
        "flex h-11.75 items-center rounded-full border px-4.5 text-[15px] font-medium md:h-11 md:px-4 md:text-[14px]",
        active ? "border-[#15A963] bg-[#E7F5EF] text-[#2F2F2F]" : "border-[#E5E3DC] bg-white text-[#2F2F2F]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const interestOptions = [
  "Street Art",
  "Hidden History",
  "Riverside",
  "Parks & Gardens",
  "Architecture",
  "Photo Spots",
  "Cafés Nearby",
];
const accessibilityOptions = ["Step-free", "Pram Friendly", "Fully Paved"];

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// One MVP demo user, no login yet — preferences persist in localStorage
// rather than a new DB table (see PROFILE_PREFERENCES_KEY below).
const PROFILE_PREFERENCES_KEY = "wayoProfilePreferences";

function loadStoredPreferences() {
  try {
    const raw = localStorage.getItem(PROFILE_PREFERENCES_KEY);
    if (!raw) return { interests: [], accessibility: [] };
    const parsed = JSON.parse(raw);
    return {
      interests: Array.isArray(parsed?.interests) ? parsed.interests : [],
      accessibility: Array.isArray(parsed?.accessibility) ? parsed.accessibility : [],
    };
  } catch {
    return { interests: [], accessibility: [] };
  }
}

// The app currently supports exactly these two languages — kept as a fixed
// fallback list here so the switcher still renders if /api/languages hasn't
// answered yet; LanguageProvider's availableLanguages (from the backend)
// takes over as soon as it's ready.
const fallbackLanguageOptions = [
  { code: "en", native_name: "English" },
  { code: "uk", native_name: "Українська" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useContext(LanguageContext);
  const [interests, setInterests] = useState(() => loadStoredPreferences().interests);
  const [accessibility, setAccessibility] = useState(() => loadStoredPreferences().accessibility);

  useEffect(() => {
    localStorage.setItem(PROFILE_PREFERENCES_KEY, JSON.stringify({ interests, accessibility }));
  }, [interests, accessibility]);

  const languageOptions = availableLanguages?.length > 0 ? availableLanguages : fallbackLanguageOptions;

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5.5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden md:px-5">
      <div className="flex items-start justify-between pt-2">
        <img src={avatar} alt={t("profile.avatarAlt", "Profile avatar")} className="h-30 w-30 rounded-full object-cover md:h-28 md:w-28" />
        <button
          type="button"
          onClick={() => navigate("/profile/settings")}
          aria-label={t("profile.settings", "Settings")}
          className="flex h-11.75 w-11.75 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(47,47,47,0.08)] md:h-11 md:w-11"
        >
          <img src={settingsIcon} alt="" className="h-5.5 w-5.5 md:h-5 md:w-5" />
        </button>
      </div>

      <h1 className="mt-4 text-[28px] font-bold leading-tight md:text-[26px]">Irena Sahajdaczna</h1>
      <p className="mt-1 text-[16px] text-[#8A857D] md:text-[15px]">{t("profile.location", "London, UK")}</p>

      <h2 className="mt-6 text-[19px] font-bold md:text-[18px]">{t("profile.interests", "Interests")}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {interestOptions.map((i) => (
          <Chip key={i} active={interests.includes(i)} onClick={() => setInterests((prev) => toggle(prev, i))}>
            {translateLabel(t, preferenceKeyMap, i)}
          </Chip>
        ))}
      </div>

      <h2 className="mt-6 text-[19px] font-bold md:text-[18px]">
        {t("profile.accessibilityPreferences", "Accessibility preferences")}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {accessibilityOptions.map((o) => (
          <Chip key={o} active={accessibility.includes(o)} onClick={() => setAccessibility((prev) => toggle(prev, o))}>
            {translateLabel(t, accessibilityPreferenceKeyMap, o)}
          </Chip>
        ))}
      </div>

      <h2 className="mt-6 text-[19px] font-bold md:text-[18px]">{t("profile.language", "Language")}</h2>
      <div role="radiogroup" aria-label={t("profile.language", "Language")} className="mt-3 flex flex-wrap gap-2">
        {languageOptions.map((lang) => (
          <Chip
            key={lang.code}
            active={currentLanguage === lang.code}
            onClick={() => changeLanguage(lang.code)}
            role="radio"
            ariaChecked={currentLanguage === lang.code}
          >
            {lang.native_name}
          </Chip>
        ))}
      </div>
    </main>
  );
}
