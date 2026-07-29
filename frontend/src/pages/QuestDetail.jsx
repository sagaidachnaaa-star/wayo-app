import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SavedContext } from "../context/SavedContext";
import { LanguageContext } from "../context/LanguageContext";
import { difficultyKeyMap, discoverKeyMap, questAccessibilityKeyMap, tagKeyMap, translateLabel } from "../i18n/labelKeys";
import { getCompletedQuests } from "../utils/questProgress";
import { API_BASE_URL } from "../config/api";
import { trackEvent } from "../analytics/amplitude";


import distanceIcon from "../assets/DistanceIcon.png";
import timeIcon from "../assets/TimeIcon.png";
import difficultyIcon from "../assets/DifficultyIcon.png";
import accessibilityIcon from "../assets/AccessibilityIcon.png";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const LOCKED_BADGE_IMAGE = "/assets/Lockedbadge.png";

// ── Backend response → the flat shape this page's JSX expects ───────────────
function formatDuration(minutes) {
  if (minutes == null) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest} min`;
}
function formatDistance(km) {
  if (km == null) return "";
  return `${Number(km).toFixed(1)} km`;
}
// Safe numeric coercion for analytics — never sends NaN to Amplitude.
function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
// quest_stops rows are one flat, ordered list with a stop_type of
// "start" | "checkpoint" | "viewpoint" — split that into the
// start / middle stops / end shape the route timeline renders.
function buildRoute(stops) {
  if (!stops || stops.length === 0) return null;
  const start = stops.find((s) => s.stop_type === "start") ?? stops[0];
  const end = [...stops].reverse().find((s) => s.stop_type === "viewpoint") ?? stops[stops.length - 1];
  const middle = stops.filter((s) => s !== start && s !== end);
  return {
    start: { title: start.title },
    stops: middle.map((s) => ({ title: s.title })),
    end: { title: end.title },
  };
}
function normalizeQuestDetail(api) {
  return {
    id: api.id,
    title: api.title,
    location: api.location,
    description: api.description,
    longDescription: api.overview,
    difficulty: api.difficulty,
    duration: formatDuration(api.duration_min),
    durationMin: toNullableNumber(api.duration_min),
    distance: formatDistance(api.distance_km),
    distanceKm: toNullableNumber(api.distance_km),
    accessibility: api.accessibility,
    image: api.image_url,
    isDaily: Boolean(api.is_daily),
    lat: Number(api.latitude),
    lng: Number(api.longitude),
    tags: api.tags ?? [],
    route: buildRoute(api.stops),
    safety: (api.accessibility_notes ?? []).map((n) => ({ title: n.title, text: n.text })),
    badge: api.badge
      ? { image: api.badge.image_url, name: api.badge.title, desc: api.badge.description }
      : null,
  };
}

// The backend doesn't return gallery photos yet — this is visual supporting
// content only, keyed by quest id, using the images already placed in
// frontend/public/assets. Core quest content (title/description/etc.) still
// comes entirely from the API above. `name` is translated via discoverKeyMap
// (see i18n/labelKeys.js) since it's presentational-only, not DB content.
const discoverImagesByQuestId = {
  "greenwich-stroll": [
    { name: "Cutty Sark", image: "/assets/GreenwichCuttySurk.png" },
    { name: "Old Royal College", image: "/assets/GreenwichOldRoyal.png" },
    { name: "Greenwich Park", image: "/assets/GreenwichGreenwichPark.png" },
    { name: "Greenwich Viewpoint", image: "/assets/GreenwichGreenwichViewPoint.png" },
  ],
  "kyoto-garden-escape": [
    { name: "Garden Walkway", image: "/assets/Kyoto1.png" },
    { name: "Kyoto Pavilion", image: "/assets/Kyoto2.png" },
    { name: "Garden Bridge", image: "/assets/Kyoto3.png" },
    { name: "Stone Lantern", image: "/assets/Kyoto4.png" },
  ],
  "thames-time-trail": [
    { name: "Tower Bridge", image: "/assets/Thames1.png" },
    { name: "Borough Market", image: "/assets/Thames2.png" },
    { name: "Market Stalls", image: "/assets/Thames3.png" },
    { name: "City Skyline", image: "/assets/Thames4.png" },
  ],
  "quiet-corners-southbank": [
    { name: "London Eye", image: "/assets/Southbank1.png" },
    { name: "Riverside Skyline", image: "/assets/Southbank2.png" },
    { name: "Millennium Bridge", image: "/assets/Southbank3.png" },
    { name: "Riverside at Dusk", image: "/assets/Southbank4.png" },
  ],
  "green-escape-city": [
    { name: "The Lake", image: "/assets/JamesPark1.png" },
    { name: "Queen's Guard", image: "/assets/JamesPark2.png" },
    { name: "Buckingham Palace", image: "/assets/JamesPark3.png" },
    { name: "Victoria Memorial", image: "/assets/JamesPark4.png" },
  ],
};

// The backend doesn't return category tags yet — small frontend-only
// mapping for the emotional/category line under the title (not derived
// from difficulty/duration/distance, those already have their own stat boxes).
const categoryTagsByQuestId = {
  "greenwich-stroll": ["Walking", "Riverside", "Parks & Gardens", "Hidden history"],
  "kyoto-garden-escape": ["Walking", "Garden", "Peaceful", "Nature"],
  "thames-time-trail": ["Walking", "Riverside", "History", "Landmarks"],
  "quiet-corners-southbank": ["Walking", "Hidden spots", "Riverside", "Independent places"],
  "green-escape-city": ["Walking", "Parks & Gardens", "Royal park", "Relaxed"],
};

// The backend's badge.image_url points at files that don't exist yet for
// most quests — where real badge art already exists in public/assets,
// use it instead of falling back to the generic Locked placeholder.
// This is the colour artwork shown once a quest is completed — before
// that, LOCKED_BADGE_IMAGE (a dedicated locked-badge graphic) is shown instead.
const badgeImageOverrides = {
  "greenwich-stroll": "/assets/GreenwichStrollReward.png",
  "kyoto-garden-escape": "/assets/badge1.png",
  "thames-time-trail": "/assets/thames-trail-badge.png",
  "quiet-corners-southbank": "/assets/Southbank-badge.png",
  "green-escape-city": "/assets/GreenEscapeintheCity.png",
};

// The API only returns title/text for accessibility notes, no icon — pick a
// sensible one from the note's title, falling back to a generic checkmark.
// Matches against the English DB title regardless of active language, since
// quest_accessibility_notes.title (not the translated version) is stable.
function getSafetyIcon(title) {
  const lower = title.toLowerCase();
  if (lower.includes("step-free") || lower.includes("paved") || lower.includes("flat")) return accessibilityIcon;
  if (lower.includes("rest stop")) return "/assets/StopsIcon.png";
  if (lower.includes("busy") || lower.includes("aware") || lower.includes("uphill")) return "/assets/UphillIcon.png";
  return null; // → generic checkmark
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function BackArrowIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon({ filled }) {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill={filled ? "white" : "none"}>
      <path
        d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg className="h-5 w-5 md:h-4.5 md:w-4.5" viewBox="0 0 24 24" fill="none">
      <path d="M5 21V4" stroke="#15A963" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 5c2-1.5 4-1.5 6 0s4 1.5 6 0v9c-2 1.5-4 1.5-6 0s-4-1.5-6 0V5Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ size = 18 }) {
  return (
    <svg width={Math.round(size * 1.08)} height={Math.round(size * 1.08)} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#15A963" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5 md:h-3.25 md:w-3.25" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#6F6A62" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#6F6A62" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WeatherIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke="#15A963" strokeWidth="1.8" />
      <path
        d="M12.5 17h5a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.6-1.4"
        stroke="#15A963"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Stat box (Distance / Time / Difficulty / Accessibility) ──────────────────
function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4.5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] md:p-4">
      <img src={icon} alt="" className="h-9.5 w-9.5 shrink-0 md:h-9 md:w-9" />
      <div>
        <p className="text-[14px] text-[#8A857D] md:text-[13px]">{label}</p>
        <p className="text-[17px] font-bold text-[#2F2F2F] md:text-[16px]">{value}</p>
      </div>
    </div>
  );
}

// ── Route timeline row ────────────────────────────────────────────────────────
function TimelineRow({ marker, kicker, label, last }) {
  return (
    <div className={["relative flex gap-4", last ? "" : "pb-6"].join(" ")}>
      <div className="z-10 flex h-11.75 w-11.75 shrink-0 items-center justify-center md:h-11 md:w-11">{marker}</div>
      <div className="pt-2">
        <p className="text-[14px] text-[#8A857D] md:text-[13px]">{kicker}</p>
        <p className="text-[16px] font-bold text-[#2F2F2F] md:text-[15px]">{label}</p>
      </div>
    </div>
  );
}

// The app's status bar (see App.jsx) overlays the top of this page and is 52px
// tall — the sticky header buttons sit just below it, not below the scroll.
const HEADER_TOP_OFFSET = 68;
const SWIPE_THRESHOLD = 50;
const ACCESSIBILITY_VISIBILITY_THRESHOLD = 0.45;

// Shared property shape for the quest-level analytics events fired from this
// page (Viewed / Started / Repeated / Saved / Unsaved) — keeps property
// names consistent without repeating the same object four times.
function getQuestAnalyticsProperties(quest, extra) {
  return {
    quest_id: quest.id,
    quest_name: quest.title,
    location: quest.location,
    difficulty: quest.difficulty,
    distance_km: quest.distanceKm,
    duration_min: quest.durationMin,
    accessibility: quest.accessibility,
    source: "Quest Detail",
    ...extra,
  };
}

export default function QuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedMap, toggleSaved } = useContext(SavedContext);
  const { t, currentLanguage } = useContext(LanguageContext);
  const [activeImg, setActiveImg] = useState(0);
  const pointerStartX = useRef(null);
  const trackedQuestViewRef = useRef(null);

  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/quests/${id}?lang=${currentLanguage}`)
      .then((res) => {
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setQuest(normalizeQuestDetail(data));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Something went wrong loading this quest.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryCount, currentLanguage]);

  useEffect(() => {
    if (!quest) return;

    if (trackedQuestViewRef.current === quest.id) {
      return;
    }

    trackedQuestViewRef.current = quest.id;

    trackEvent("Quest Viewed", getQuestAnalyticsProperties(quest, { is_daily: quest.isDaily }));
  }, [quest]);

  // Small weather block, driven by the quest's own coordinates. Never blocks
  // or breaks the page — no key, no coordinates, or a failed request all
  // just fall back to a plain "unavailable" message.
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("idle"); // idle | loading | ready | error

  useEffect(() => {
    if (!quest || !Number.isFinite(quest.lat) || !Number.isFinite(quest.lng)) return;

    let cancelled = false;

    if (!WEATHER_API_KEY) {
      const timeoutId = setTimeout(() => setWeatherStatus("error"), 0);
      return () => clearTimeout(timeoutId);
    }

    // Deferred a tick so the state updates below happen outside the effect's
    // own synchronous body (avoids a cascading-render warning), same trick
    // used for the geolocation fallback elsewhere in this app.
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setWeatherStatus("loading");

      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${quest.lat}&lon=${quest.lng}&appid=${WEATHER_API_KEY}&units=metric&lang=${currentLanguage}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Weather request failed");
          return res.json();
        })
        .then((data) => {
          if (cancelled) return;
          setWeather({
            temp: Math.round(data?.main?.temp),
            description: data?.weather?.[0]?.description ?? "",
          });
          setWeatherStatus("ready");
        })
        .catch(() => {
          if (!cancelled) setWeatherStatus("error");
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest?.lat, quest?.lng, currentLanguage]);

  const saved = Boolean(savedMap[id]);
  // Top carousel = the real backend photo first, then the same photos used
  // in "What you'll discover" below, so it's actually scrollable/swipeable.
  const heroImages = [quest?.image, ...(discoverImagesByQuestId[quest?.id]?.map((d) => d.image) ?? [])].filter(
    Boolean
  );

  // A quest stays repeatable after completion — it just never locks the
  // badge again. The backend is the source of truth; localStorage is only
  // used while that request is in flight or if it fails.
  const [completedFromApi, setCompletedFromApi] = useState(null); // null | boolean

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompletedFromApi(null);

    fetch(`${API_BASE_URL}/api/completed/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCompletedFromApi(Boolean(data?.completed));
      })
      .catch(() => {
        // Leave completedFromApi as null — the localStorage fallback below takes over.
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // "Accessibility Section Reached" — the section is always rendered further
  // down the page (when the quest has safety content), so this can't just
  // fire on load; it needs to fire only once the section is actually
  // scrolled into view. trackedAccessibilityQuestRef stores the quest id
  // it already fired for, which both dedupes repeated scrolling within the
  // same quest and correctly re-arms when the user opens a different quest.
  const accessibilitySectionRef = useRef(null);
  const trackedAccessibilityQuestRef = useRef(null);

  useEffect(() => {
    if (!quest) return;
    if (typeof IntersectionObserver === "undefined") return; // fail safely
    const node = accessibilitySectionRef.current;
    if (!node) return; // no accessibility/safety content rendered for this quest

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (trackedAccessibilityQuestRef.current === quest.id) return;
        trackedAccessibilityQuestRef.current = quest.id;

        trackEvent("Accessibility Section Reached", {
          quest_id: quest.id,
          quest_name: quest.title,
          difficulty: quest.difficulty,
          accessibility: quest.accessibility,
          accessibility_notes_count: quest.safety?.length ?? 0,
          source: "Quest Detail",
        });
        observer.disconnect();
      },
      { threshold: ACCESSIBILITY_VISIBILITY_THRESHOLD }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [quest]);

  const completedQuestIds = getCompletedQuests();
  const isCompleted = completedFromApi !== null ? completedFromApi : completedQuestIds.includes(id);

  function handlePointerDown(e) {
    pointerStartX.current = e.clientX;
  }
  function handlePointerUp(e) {
    if (pointerStartX.current === null) return;
    const deltaX = pointerStartX.current - e.clientX;
    pointerStartX.current = null;

    if (deltaX > SWIPE_THRESHOLD) {
      setActiveImg((i) => Math.min(i + 1, heroImages.length - 1));
    } else if (deltaX < -SWIPE_THRESHOLD) {
      setActiveImg((i) => Math.max(i - 1, 0));
    }
  }

  function handleStartQuest() {
    trackEvent(
      isCompleted ? "Quest Repeated" : "Quest Started",
      getQuestAnalyticsProperties(quest, { is_daily: quest.isDaily })
    );
    navigate(`/quest/${quest.id}/active`);
  }

  // toggleSaved (SavedContext, see App.jsx) updates state optimistically and
  // syncs to the backend in the background — it doesn't return a promise, so
  // there's nothing to await here. The event describes the toggle direction
  // the user just triggered, mirroring how the heart icon updates instantly.
  function handleSaveQuest() {
    trackEvent(saved ? "Quest Unsaved" : "Quest Saved", getQuestAnalyticsProperties(quest));
    toggleSaved(quest.id);
  }

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>{t("quest.loading", "Loading quest…")}</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>{t("quest.notFound", "Quest not found.")}</p>
      </main>
    );
  }

  if (error || !quest) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-3 bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p className="text-[14px] text-[#8A857D]">{t("quest.loadError", "Couldn't load this quest.")} {error}</p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setError(null);
            setRetryCount((c) => c + 1);
          }}
          className="rounded-full bg-[#15A963] px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          {t("common.retry", "Try again")}
        </button>
      </main>
    );
  }

  const detail = quest; // same normalized object carries both the "basic" and "extended" fields

  // Prefer real tags from the backend; fall back to the frontend-only map
  // only while a quest doesn't have backend tags yet.
  const tags = quest.tags?.length > 0 ? quest.tags : categoryTagsByQuestId[quest.id] ?? [];
  const discover = discoverImagesByQuestId[quest.id];

  return (
    <main className="relative h-full overflow-hidden bg-[#F8F7F4]">
      {/* Scrollable page content — the header/footer buttons below float above this */}
      <div className="h-full overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden">
        {/* Hero image carousel */}
        <div
          className="relative h-[clamp(430px,56dvh,620px)] touch-pan-y overflow-hidden md:h-96"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeImg * 100}%)` }}
          >
            {heroImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={quest.title}
                draggable={false}
                decoding="async"
                className="block h-full w-full shrink-0 object-cover object-center"
              />
            ))}
          </div>

          {heroImages.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${t("quest.goToPhoto", "Go to photo")} ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={["h-2 w-2 rounded-full transition-colors", i === activeImg ? "bg-white" : "bg-white/40"].join(" ")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-5.5 pt-5 text-[#2F2F2F] md:px-5">
          <h1 className="text-[28px] font-bold leading-tight md:text-[26px]">{quest.title}</h1>
          <p className="mt-1.5 text-[16px] text-[#2F2F2F] md:text-[15px]">{quest.description}</p>

          {tags.length > 0 && (
            <p className="mt-2 text-[14px] font-medium text-[#6F6A62] md:text-[13px]">
              {tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && <span className="text-[#15A963]"> · </span>}
                  {translateLabel(t, tagKeyMap, tag)}
                </span>
              ))}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatBox icon={distanceIcon} label={t("quest.distance", "Distance")} value={quest.distance} />
            <StatBox icon={timeIcon} label={t("quest.duration", "Time")} value={quest.duration} />
            <StatBox
              icon={difficultyIcon}
              label={t("quest.difficulty", "Difficulty")}
              value={translateLabel(t, difficultyKeyMap, quest.difficulty)}
            />
            <StatBox
              icon={accessibilityIcon}
              label={t("quest.accessibility", "Accessibility")}
              value={translateLabel(t, questAccessibilityKeyMap, quest.accessibility)}
            />
          </div>

          {detail?.longDescription && (
            <p className="mt-5 text-[16px] leading-normal text-[#2F2F2F] md:text-[15px]">{detail.longDescription}</p>
          )}

          {/* What you'll discover */}
          {discover && discover.length > 0 && (
            <>
              <h2 className="mt-7 text-[20px] font-bold md:text-[19px]">{t("quest.whatYoullDiscover", "What you'll discover")}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {discover.map((d) => (
                  <div key={d.name}>
                    <img src={d.image} alt={translateLabel(t, discoverKeyMap, d.name)} className="h-26 w-full rounded-2xl object-cover md:h-24" />
                    <p className="mt-1.5 text-center text-[15px] font-semibold md:text-[14px]">{translateLabel(t, discoverKeyMap, d.name)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Route details */}
          {detail?.route && (
            <>
              <h2 className="mt-7 text-[20px] font-bold md:text-[19px]">{t("quest.routeDetails", "Route details")}</h2>
              <div className="relative mt-4">
                <div className="absolute left-5.25 top-11 bottom-11 w-0.5 bg-[#15A963]" />
                <TimelineRow
                  marker={<div className="flex h-11.75 w-11.75 items-center justify-center rounded-full border-2 border-[#15A963] bg-white md:h-11 md:w-11">{<FlagIcon />}</div>}
                  kicker={t("quest.startPoint", "Start point")}
                  label={detail.route.start.title}
                />
                {detail.route.stops.map((stop, i) => (
                  <TimelineRow
                    key={stop.title}
                    marker={<span className="h-3.25 w-3.25 rounded-full bg-[#15A963] md:h-3 md:w-3" />}
                    kicker={`${t("quest.stop", "Stop")} ${i + 1}`}
                    label={stop.title}
                  />
                ))}
                <TimelineRow
                  last
                  marker={<div className="flex h-11.75 w-11.75 items-center justify-center rounded-full border-2 border-[#15A963] bg-white md:h-11 md:w-11">{<CheckIcon />}</div>}
                  kicker={t("quest.endPoint", "End point")}
                  label={detail.route.end.title}
                />
              </div>
            </>
          )}

          {/* Accessibility & safety — ref used only for the "Accessibility
              Section Reached" IntersectionObserver (see effect above); a
              plain unstyled div in normal flow, so it doesn't affect layout. */}
          {detail?.safety && detail.safety.length > 0 && (
            <div ref={accessibilitySectionRef}>
              <h2 className="mt-7 text-[20px] font-bold md:text-[19px]">{t("quest.accessibilitySafety", "Accessibility & safety")}</h2>
              <p className="mt-1 text-[14px] text-[#8A857D] md:text-[13px]">{t("quest.accessibilitySafetySubtitle", "Important route notes before you start")}</p>
              <div className="mt-4 space-y-4">
                {detail.safety.map((item) => {
                  const icon = getSafetyIcon(item.title);
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-11.75 w-11.75 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#15A963] md:h-11 md:w-11">
                        {icon ? <img src={icon} alt="" className="h-5.5 w-5.5 md:h-5 md:w-5" /> : <CheckIcon size={18} />}
                      </div>
                      <div>
                        <p className="text-[16px] font-bold text-[#2F2F2F] md:text-[15px]">{item.title}</p>
                        <p className="mt-0.5 text-[14px] leading-[1.4] text-[#8A857D] md:text-[13px]">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weather */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4.5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] md:p-4">
            <div className="flex h-11.75 w-11.75 shrink-0 items-center justify-center rounded-full bg-[#E7F5EF] md:h-11 md:w-11">
              <WeatherIcon />
            </div>
            <div>
              {weatherStatus === "ready" && weather && Number.isFinite(weather.temp) ? (
                <>
                  <p className="text-[16px] font-bold text-[#2F2F2F] md:text-[15px]">
                    {weather.temp}°C{weather.description ? ` · ${weather.description}` : ""}
                  </p>
                  <p className="text-[14px] text-[#8A857D] md:text-[13px]">{t("quest.weatherCheck", "Check the weather before starting this outdoor quest.")}</p>
                </>
              ) : weatherStatus === "loading" ? (
                <p className="text-[14px] text-[#8A857D] md:text-[13px]">{t("quest.weatherLoading", "Loading weather…")}</p>
              ) : (
                <p className="text-[14px] text-[#8A857D] md:text-[13px]">{t("quest.weatherUnavailable", "Weather information is currently unavailable.")}</p>
              )}
            </div>
          </div>

          {/* Quest reward */}
          {detail?.badge && (
            <>
              <h2 className="mt-7 text-[20px] font-bold md:text-[19px]">{t("quest.questReward", "Quest reward")}</h2>
              <div className="mt-3 flex gap-4 rounded-2xl bg-white p-4.5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] md:p-4">
                <div className="flex h-30 w-26 shrink-0 items-center justify-center md:h-28 md:w-24">
                  <img
                    src={isCompleted ? (badgeImageOverrides[quest.id] ?? detail.badge.image) : LOCKED_BADGE_IMAGE}
                    alt={detail.badge.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = LOCKED_BADGE_IMAGE;
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[16px] font-bold text-[#2F2F2F] md:text-[15px]">{detail.badge.name}</p>
                  <p className="mt-1 text-[14px] leading-[1.4] text-[#8A857D] md:text-[13px]">{detail.badge.desc}</p>
                  {isCompleted ? (
                    <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-[#E7F5EF] px-3.25 py-1.75 text-[13px] font-medium text-[#15A963] md:px-3 md:py-1.5 md:text-[12px]">
                      <CheckIcon size={13} /> {t("passport.badges", "Collected")}
                    </span>
                  ) : (
                    <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-[#F0EEE9] px-3.25 py-1.75 text-[13px] font-medium text-[#6F6A62] md:px-3 md:py-1.5 md:text-[12px]">
                      <LockIcon /> {t("passport.locked", "Locked")}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky header buttons — fixed over the top of the screen, independent of scroll */}
      <div
        className="absolute inset-x-0 z-30 flex items-center justify-between px-5.5 md:px-5"
        style={{ top: HEADER_TOP_OFFSET }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t("common.back", "Back")}
          className="flex h-11.75 w-11.75 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md md:h-11 md:w-11"
        >
          <BackArrowIcon />
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveQuest}
            aria-label={saved ? t("quest.unsaveQuest", "Unsave quest") : t("quest.saveQuest", "Save quest")}
            className="flex h-11.75 w-11.75 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md md:h-11 md:w-11"
          >
            <HeartIcon filled={saved} />
          </button>
        </div>
      </div>

      {/* Sticky "Start/Repeat quest" button — fixed over the bottom of the screen, independent of scroll */}
      <div className="absolute inset-x-5.5 bottom-5.5 z-30 md:inset-x-5 md:bottom-5">
        {isCompleted && (
          <p className="mb-2 rounded-full bg-[#E7F5EF] px-4.5 py-2.25 text-center text-[14px] font-medium text-[#15A963] shadow-[0_4px_14px_rgba(47,47,47,0.08)] md:px-4 md:py-2 md:text-[13px]">
            {t("quest.badgeUnlockedNotice", "Badge already unlocked in your Passport.")}
          </p>
        )}
       <button
        type="button"
        onClick={handleStartQuest}
        className="flex h-15 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-bold text-white shadow-[0_8px_24px_rgba(21,169,99,0.35)] md:h-14 md:text-[16px]"
>
        {isCompleted ? t("quest.repeatQuest", "Repeat quest") : t("quest.startQuest", "Start quest")}
       </button>
      </div>
    </main>
  );
}
