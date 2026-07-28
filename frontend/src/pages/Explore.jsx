import { useContext, useEffect, useMemo, useRef, useState } from "react";
import QuestCard from "../components/QuestCard";
import QuestMapView from "../components/QuestMapView";
import { getCompletedQuests } from "../utils/questProgress";
import { haversineDistanceKm } from "../utils/geo";
import { API_BASE_URL } from "../config/api";
import { LanguageContext } from "../context/LanguageContext";
import {
  activityKeyMap,
  difficultyKeyMap,
  myQuestsKeyMap,
  preferenceKeyMap,
  questAccessibilityKeyMap,
  sortKeyMap,
  translateLabel,
} from "../i18n/labelKeys";

// Used for "Closest" sorting if the user denies/lacks geolocation.
const DEFAULT_LOCATION = { lat: 51.4826, lng: -0.0077 }; // Greenwich, London

// Fallback only — used if a quest has no tags from the backend yet.
// Mirrors the tag line shown on Quest Detail.
const tagsByQuestId = {
  "greenwich-stroll": ["Walking", "Riverside", "Parks & Gardens", "Hidden History"],
  "kyoto-garden-escape": ["Walking", "Garden", "Peaceful", "Nature"],
  "thames-time-trail": ["Walking", "Riverside", "History", "Landmarks"],
  "quiet-corners-southbank": ["Walking", "Hidden spots", "Riverside", "Independent places"],
  "green-escape-city": ["Walking", "Parks & Gardens", "Royal park", "Relaxed"],
};

// The backend returns snake_case DB columns — map them to the shape
// QuestCard/QuestMapView already expect, so those components don't need to change.
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
function normalizeQuest(apiQuest) {
  return {
    id: String(apiQuest.id),
    title: apiQuest.title,
    location: apiQuest.location,
    description: apiQuest.description,
    difficulty: apiQuest.difficulty,
    duration: formatDuration(apiQuest.duration_min),
    durationMin: apiQuest.duration_min,
    distance: formatDistance(apiQuest.distance_km),
    // MySQL DECIMAL columns come back as strings via mysql2 — coerce to
    // numbers so Leaflet and the distance math get real numbers, not "1.5".
    distanceKm: Number(apiQuest.distance_km),
    routeKm: Number(apiQuest.distance_km),
    coordinates: { lat: Number(apiQuest.latitude), lng: Number(apiQuest.longitude) },
    accessibility: apiQuest.accessibility,
    image: apiQuest.image_url,
    isDaily: Boolean(apiQuest.is_daily),
    tags: apiQuest.tags ?? [],
    // Real completion state comes from localStorage (see questProgress.js),
    // not the API yet — the backend doesn't track that per-user field.
    completed: false,
  };
}

// ── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#15A963" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="#15A963" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#15A963" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg className="h-4.5 w-4.5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg className="h-3.5 w-3.5 md:h-3.25 md:w-3.25" viewBox="0 0 24 24" fill="none">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MapFabIcon() {
  return (
    <svg className="h-6 w-6 md:h-5.5 md:w-5.5" viewBox="0 0 24 24" fill="none">
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 3v15M15 6v15" stroke="white" strokeWidth="2" />
    </svg>
  );
}
function LocationArrow() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L19 21L12 17L5 21L12 2Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── Difficulty badge shapes ───────────────────────────────────────────────────
function EasyDot()     { return <span className="h-3.5 w-3.5 rounded-full bg-[#15A963] shrink-0 md:h-3.25 md:w-3.25" />; }
function ModerateDot() { return <span className="h-3 w-3 rounded-xs bg-[#F6CA5D] shrink-0 md:h-2.75 md:w-2.75" />; }
function ToughDot()    {
  return (
    <span className="shrink-0 h-0 w-0" style={{ borderLeft:"7.5px solid transparent", borderRight:"7.5px solid transparent", borderBottom:"14px solid #D44A08" }} />
  );
}
function DifficultyIcon({ label }) {
  if (label === "Easy")     return <EasyDot />;
  if (label === "Moderate") return <ModerateDot />;
  if (label === "Tough")    return <ToughDot />;
  return null;
}

// ── Drag-to-scroll (lets mouse users pan the chip row, not just touch) ────────
function useDragScroll() {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  function onMouseDown(e) {
    const el = ref.current;
    drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
  }
  function onMouseMove(e) {
    if (!drag.current.active) return;
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.scrollLeft - dx;
  }
  function endDrag() {
    drag.current.active = false;
  }
  function onClickCapture(e) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return { ref, onMouseDown, onMouseMove, onMouseUp: endDrag, onMouseLeave: endDrag, onClickCapture };
}

// ── Sheet wrapper ─────────────────────────────────────────────────────────────
function Sheet({ onClose, children }) {
  const { t } = useContext(LanguageContext);
  return (
    <>
      <button type="button" aria-label={t("common.close", "Close")} onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>
        {children}
      </div>
    </>
  );
}

// ── FilterPill ────────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-11.25 shrink-0 items-center gap-2 rounded-full border px-4.5 text-[15px] font-medium transition-colors md:h-10.5 md:px-4 md:text-[14px]",
        active ? "border-[#15A963] bg-[#E7F5EF] text-[#2F2F2F]" : "border-[#E5E3DC] bg-white text-[#2F2F2F]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Range slider ──────────────────────────────────────────────────────────────
function RangeSlider({ label, min, max, unit, value, onChange, step = 1 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-semibold text-[#2F2F2F] md:text-[15px]">{label}</p>
        <p className="text-[14px] text-[#8A857D] md:text-[13px]">{min}-{value} {unit}</p>
      </div>
      <div className="relative mt-3 h-1 rounded-full bg-[#E5E3DC]">
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#15A963]" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          style={{ height: 20, top: -8 }}
        />
        {/* thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] md:h-6.5 md:w-6.5"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Difficulty sheet ──────────────────────────────────────────────────────────
function DifficultySheet({ selected, onChange, onClose, count }) {
  const { t } = useContext(LanguageContext);
  const options = ["Easy", "Moderate", "Tough"];
  return (
    <Sheet onClose={onClose}>
      <div className="px-5.5 pb-6 md:px-5">
        <h2 className="text-[22px] font-bold text-[#2F2F2F] md:text-[20px]">{t("explore.difficulty", "Difficulty")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((d) => (
            <FilterPill key={d} active={selected === d} onClick={() => onChange(d === selected ? "All" : d)}>
              <DifficultyIcon label={d} />
              {translateLabel(t, difficultyKeyMap, d)}
            </FilterPill>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex h-14.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-semibold text-white md:h-13.5 md:text-[16px]"
        >
          {t("explore.seeResults", "See")} {count} {count !== 1 ? t("explore.questPlural", "quests") : t("explore.questSingular", "quest")}
        </button>
      </div>
    </Sheet>
  );
}

// ── Duration sheet ────────────────────────────────────────────────────────────
function DurationSheet({ value, onChange, onClose, count }) {
  const { t } = useContext(LanguageContext);
  return (
    <Sheet onClose={onClose}>
      <div className="px-5.5 pb-6 md:px-5">
        <h2 className="text-[22px] font-bold text-[#2F2F2F] md:text-[20px]">{t("explore.duration", "Duration")}</h2>
        <RangeSlider label="" min={0} max={120} unit={t("common.min", "min")} value={value} onChange={onChange} />
        <button type="button" onClick={onClose} className="mt-6 flex h-14.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-semibold text-white md:h-13.5 md:text-[16px]">
          {t("explore.seeResults", "See")} {count} {count !== 1 ? t("explore.questPlural", "quests") : t("explore.questSingular", "quest")}
        </button>
      </div>
    </Sheet>
  );
}

// ── Distance sheet ────────────────────────────────────────────────────────────
function DistanceSheet({ value, onChange, onClose, count }) {
  const { t } = useContext(LanguageContext);
  return (
    <Sheet onClose={onClose}>
      <div className="px-5.5 pb-6 md:px-5">
        <h2 className="text-[22px] font-bold text-[#2F2F2F] md:text-[20px]">{t("explore.distance", "Distance")}</h2>
        <RangeSlider label="" min={0} max={15} step={0.1} unit={t("common.km", "km")} value={value} onChange={onChange} />
        <button type="button" onClick={onClose} className="mt-6 flex h-14.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-semibold text-white md:h-13.5 md:text-[16px]">
          {t("explore.seeResults", "See")} {count} {count !== 1 ? t("explore.questPlural", "quests") : t("explore.questSingular", "quest")}
        </button>
      </div>
    </Sheet>
  );
}

// ── Sort sheet ────────────────────────────────────────────────────────────────
const sortOptions = [
  { label: "Most relevant" },
  { label: "Most popular" },
  { label: "Closest" },
  { label: "Newly added" },
];
function SortSheet({ selected, onChange, onClose }) {
  const { t } = useContext(LanguageContext);
  return (
    <Sheet onClose={onClose}>
      <div className="px-5.5 pb-6 md:px-5">
        <h2 className="text-[22px] font-bold text-[#2F2F2F] md:text-[20px]">{t("explore.sort", "Sort")}</h2>
        <div className="mt-4 space-y-2">
          {sortOptions.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => { onChange(o.label); onClose(); }}
              className={[
                "flex h-14 w-full items-center rounded-full px-5.5 text-[16px] font-medium md:h-13 md:px-5 md:text-[15px]",
                selected === o.label ? "bg-[#E7F5EF] text-[#2F2F2F]" : "bg-[#F4F2EE] text-[#2F2F2F]",
              ].join(" ")}
            >
              {translateLabel(t, sortKeyMap, o.label)}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// ── Full filters sheet ────────────────────────────────────────────────────────
const accessibilityOpts = ["Step-free", "Pram Friendly", "Fully Paved"];
const activityOpts      = ["Walking", "Cycling", "Public transport"];
const featureOpts       = ["Street Art", "Hidden History", "Riverside", "Parks & Gardens", "Architecture", "Photo Spots", "Cafés Nearby"];

function FiltersSheet({
  onClose,
  filteredCount,
  myQ,
  setMyQ,
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  distance,
  setDistance,
  accessibility,
  setAccessibility,
  activity,
  setActivity,
  features,
  setFeatures,
}) {
  const { t } = useContext(LanguageContext);

  function toggle(arr, setArr, val) {
    setArr((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
  }

  function clearAll() {
    setDifficulty("All");
    setDuration(120);
    setDistance(15);
    setAccessibility([]);
    setActivity([]);
    setFeatures([]);
    setMyQ("All");
    onClose();
  }

  return (
    <>
      <button type="button" aria-label={t("common.close", "Close")} onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[88%] flex-col rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>
        <div className="flex-1 overflow-y-auto px-5.5 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden md:px-5">
          <h2 className="mt-1 text-[24px] font-bold text-[#2F2F2F] md:text-[22px]">{t("explore.filters", "Filters")}</h2>

          {/* Difficulty — same single-select value as the Difficulty chip, so both stay in sync */}
          <p className="mt-5 text-[16px] font-semibold md:text-[15px]">{t("explore.difficulty", "Difficulty")}</p>
          <div className="mt-3 flex gap-2">
            {["Easy", "Moderate", "Tough"].map((d) => (
              <FilterPill key={d} active={difficulty === d} onClick={() => setDifficulty(d === difficulty ? "All" : d)}>
                <DifficultyIcon label={d} />{translateLabel(t, difficultyKeyMap, d)}
              </FilterPill>
            ))}
          </div>

          {/* Duration */}
          <RangeSlider label={t("explore.duration", "Duration")} min={0} max={120} unit={t("common.min", "min")} value={duration} onChange={setDuration} />

          {/* Distance */}
          <RangeSlider label={t("explore.distance", "Distance")} min={0} max={15} step={0.1} unit={t("common.km", "km")} value={distance} onChange={setDistance} />

          {/* Accessibility */}
          <p className="mt-5 text-[16px] font-semibold md:text-[15px]">{t("quest.accessibility", "Accessibility")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {accessibilityOpts.map((a) => (
              <FilterPill key={a} active={accessibility.includes(a)} onClick={() => toggle(accessibility, setAccessibility, a)}>{translateLabel(t, questAccessibilityKeyMap, a)}</FilterPill>
            ))}
          </div>

          {/* Activity */}
          <p className="mt-5 text-[16px] font-semibold md:text-[15px]">{t("explore.activity", "Activity")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activityOpts.map((a) => (
              <FilterPill key={a} active={activity.includes(a)} onClick={() => toggle(activity, setActivity, a)}>{translateLabel(t, activityKeyMap, a)}</FilterPill>
            ))}
          </div>

          {/* Features */}
          <p className="mt-5 text-[16px] font-semibold md:text-[15px]">{t("explore.features", "Features")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {featureOpts.map((f) => (
              <FilterPill key={f} active={features.includes(f)} onClick={() => toggle(features, setFeatures, f)}>{translateLabel(t, preferenceKeyMap, f)}</FilterPill>
            ))}
          </div>

          {/* My Quests */}
          <p className="mt-5 text-[16px] font-semibold md:text-[15px]">{t("explore.myQuests", "My Quests")}</p>
          <div className="mt-3 flex overflow-hidden rounded-full border border-[#E5E3DC]">
            {["All", "Completed", "Not completed"].map((q) => (
              <button key={q} type="button" onClick={() => setMyQ(q)}
                className={["flex-1 py-2.5 text-[14px] font-medium md:py-2 md:text-[13px]", myQ === q ? "bg-[#F8F7F4]" : "bg-white text-[#8A857D]"].join(" ")}
              >{translateLabel(t, myQuestsKeyMap, q)}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#EDECE6] px-5.5 py-4 shrink-0 md:px-5">
          <button
            type="button"
            onClick={clearAll}
            className="flex h-14.5 flex-1 items-center justify-center rounded-full border border-[#E5E3DC] text-[16px] font-semibold text-[#2F2F2F] md:h-13.5 md:text-[15px]"
          >
            {t("explore.clearAll", "Clear all")}
          </button>
          <button type="button" onClick={onClose} className="flex h-14.5 flex-2 items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white md:h-13.5 md:text-[15px]">
            {t("explore.seeResults", "See")} {filteredCount} {filteredCount !== 1 ? t("explore.questPlural", "quests") : t("explore.questSingular", "quest")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Search expanded ───────────────────────────────────────────────────────────
function SearchExpanded({ query, setQuery, results, onNearby, onClose }) {
  const { t } = useContext(LanguageContext);
  const hasQuery = query.trim() !== "";

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#F8F7F4] px-4.5 pt-4 md:px-4">
      <div className="flex h-14.5 shrink-0 items-center gap-3 rounded-full bg-white px-4.5 shadow-[0_4px_16px_rgba(47,47,47,0.07)] md:h-13.5 md:px-4">
        <button type="button" onClick={onClose}><BackIcon /></button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("explore.searchPlaceholder", "Where will you explore next?")}
          className="flex-1 bg-transparent text-[17px] font-medium text-[#2F2F2F] outline-none placeholder:text-[#A7A39D] md:text-[16px]"
        />
      </div>

      <button
        type="button"
        onClick={onNearby}
        className="mt-3 flex shrink-0 items-center gap-4 rounded-2xl bg-white p-4.5 text-left shadow-[0_4px_14px_rgba(47,47,47,0.06)] md:p-4"
      >
        <div className="flex h-11.75 w-11.75 shrink-0 items-center justify-center rounded-xl bg-[#F0FBF5] md:h-11 md:w-11">
          <LocationArrow />
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#2F2F2F] md:text-[15px]">{t("explore.nearbyQuest", "Nearby quest")}</p>
          <p className="text-[14px] text-[#8A857D] md:text-[13px]">{t("explore.useMyLocation", "Use my current location")}</p>
        </div>
      </button>

      {hasQuery && (
        <div className="mt-4 flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden">
          <p className="mb-3 text-[14px] font-medium text-[#8A857D] md:text-[13px]">
            {results.length} {t("explore.questsFound", "quests found")}
          </p>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((quest) => (
                <QuestCard key={quest.id} quest={quest} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-[15px] text-[#8A857D] md:text-[14px]">{t("explore.noQuestsMatch", "No quests match")} "{query}".</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Peek-map drag sheet (the whole Explore body IS the sheet; dragging or
// tapping it down reveals a persistent map behind it — one shared quest list,
// not a separate map screen) ──────────────────────────────────────────────────
const PEEK_RATIO = 0.45; // fraction of the page height the map takes up when peeking
const DRAG_TAP_THRESHOLD_PX = 4;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Explore() {
  const { t, currentLanguage } = useContext(LanguageContext);
  const [query, setQuery]           = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort]             = useState("Most relevant");
  const [duration, setDuration]     = useState(120);
  const [distance, setDistance]     = useState(15);
  const [accessibility, setAccessibility] = useState([]);
  const [activity, setActivity]     = useState([]);
  const [features, setFeatures]     = useState([]);
  const [myQ, setMyQ]               = useState("All");

  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/quests?lang=${currentLanguage}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setQuests(data.map(normalizeQuest));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Something went wrong loading quests.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount, currentLanguage]);

  // Only requested once the user actually picks "Closest", so we don't
  // prompt for location permission before it's needed.
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const locationRequested = useRef(false);

  useEffect(() => {
    if (sort !== "Closest" || locationRequested.current) return;
    locationRequested.current = true;

    if (!("geolocation" in navigator)) {
      const timeoutId = setTimeout(() => setLocationDenied(true), 0);
      return () => clearTimeout(timeoutId);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationDenied(true),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [sort]);

  const [isSearchOpen, setIsSearchOpen]     = useState(false);
  const [isFiltersOpen, setIsFiltersOpen]   = useState(false);
  const [isDiffOpen, setIsDiffOpen]         = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isDistanceOpen, setIsDistanceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen]         = useState(false);

  function handleNearby() {
    setQuery("");
    setSort("Closest");
    setIsSearchOpen(false);
  }

  // Peek-map sheet: sheetTop is the distance (px) the sheet's top edge sits
  // from the top of the page. 0 = full list, covering the map entirely.
  const containerRef = useRef(null);
  const [sheetTop, setSheetTopState] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mapActivated, setMapActivated] = useState(false);
  const sheetTopRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const dragMoved = useRef(false);

  function setSheetTop(px) {
    sheetTopRef.current = px;
    setSheetTopState(px);
  }
  function getPeekTop() {
    return (containerRef.current?.clientHeight ?? 700) * PEEK_RATIO;
  }
  function openMap() {
    setMapActivated(true);
    setSheetTop(getPeekTop());
  }

  function handleHandlePointerDown(e) {
    draggingRef.current = true;
    setDragging(true);
    dragMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartTop.current = sheetTopRef.current;
    setMapActivated(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function handleHandlePointerMove(e) {
    if (!draggingRef.current) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > DRAG_TAP_THRESHOLD_PX) dragMoved.current = true;
    setSheetTop(Math.min(getPeekTop(), Math.max(0, dragStartTop.current + delta)));
  }
  function handleHandlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const peekTop = getPeekTop();
    if (!dragMoved.current) {
      setSheetTop(sheetTopRef.current > peekTop / 2 ? 0 : peekTop);
      return;
    }
    setSheetTop(sheetTopRef.current > peekTop / 2 ? peekTop : 0);
  }

  const filtered = useMemo(() => {
    const completedIds = getCompletedQuests();
    const matches = quests.filter((q) => {
      const matchDiff = difficulty === "All" || q.difficulty === difficulty;
      const text = `${q.title} ${q.location} ${q.description}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase());

      // durationMin/distanceKm are the numeric values from the backend
      // (duration_min/distance_km) — q.duration/q.distance are formatted
      // display strings ("1h 30 min", "4.0 km") and aren't comparable.
      const matchDuration = (q.durationMin ?? 0) <= duration;
      const matchDistance = (q.distanceKm ?? 0) <= distance;

      const matchAccessibility =
        accessibility.length === 0 || accessibility.includes(q.accessibility);

      // Activity/Features match against the quest's real backend tags where
      // available, falling back to the frontend-only map otherwise —
      // case-insensitive since the tag data and the sheet's option labels
      // don't always agree on capitalization (e.g. "Hidden history").
      const questTags = q.tags?.length > 0 ? q.tags : tagsByQuestId[q.id] ?? [];
      const tags = questTags.map((tag) => tag.toLowerCase());
      const matchActivity =
        activity.length === 0 || activity.some((a) => tags.includes(a.toLowerCase()));
      const matchFeatures =
        features.length === 0 || features.some((f) => tags.includes(f.toLowerCase()));

      const isCompleted = q.completed || completedIds.includes(q.id);
      const matchMyQ =
        myQ === "All" || (myQ === "Completed" && isCompleted) || (myQ === "Not completed" && !isCompleted);

      return (
        matchDiff &&
        matchesText &&
        matchDuration &&
        matchDistance &&
        matchAccessibility &&
        matchActivity &&
        matchFeatures &&
        matchMyQ
      );
    });

    let sorted = matches;
    if (sort === "Most popular") {
      sorted = [...matches].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    } else if (sort === "Newly added") {
      sorted = [...matches].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    } else if (sort === "Closest") {
      const from = userLocation ?? (locationDenied ? DEFAULT_LOCATION : null);
      if (from) {
        sorted = [...matches].sort(
          (a, b) =>
            haversineDistanceKm(from.lat, from.lng, a.coordinates.lat, a.coordinates.lng) -
            haversineDistanceKm(from.lat, from.lng, b.coordinates.lat, b.coordinates.lng)
        );
      }
    }
    // "Most relevant" (default), or "Closest" while location is still loading,
    // both fall through with sorted === matches.

    // Daily Quest leads the list for every sort except "Closest" — there,
    // actual distance should win even if that's not today's daily quest.
    if (sort === "Closest") return sorted;

    const daily = sorted.filter((q) => q.isDaily);
    const rest = sorted.filter((q) => !q.isDaily);
    return [...daily, ...rest];
  }, [
    quests,
    query,
    difficulty,
    duration,
    distance,
    accessibility,
    activity,
    features,
    myQ,
    sort,
    userLocation,
    locationDenied,
  ]);

  const anySheetOpen = isFiltersOpen || isDiffOpen || isDurationOpen || isDistanceOpen || isSortOpen;
  const mapButtonVisible = !anySheetOpen && !isSearchOpen && !dragging && sheetTop < 1;

  const { ref: chipRef, onMouseDown: onChipMouseDown, onMouseMove: onChipMouseMove, onMouseUp: onChipMouseUp, onMouseLeave: onChipMouseLeave, onClickCapture: onChipClickCapture } = useDragScroll();

  return (
    <main ref={containerRef} className="relative h-full overflow-hidden bg-[#F8F7F4] text-[#2F2F2F]">

      {/* Persistent map background, revealed as the sheet below is dragged down */}
      <div className="absolute inset-0 z-0">
        {mapActivated && <QuestMapView quests={filtered} active={mapActivated} />}
      </div>

      {/* Draggable sheet — this IS the Explore list; there's no separate map screen */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden bg-[#F8F7F4]"
        style={{
          top: sheetTop,
          borderTopLeftRadius: Math.min(28, sheetTop),
          borderTopRightRadius: Math.min(28, sheetTop),
          boxShadow: sheetTop > 0 ? "0 -8px 28px rgba(47,47,47,0.16)" : "none",
          transition: dragging ? "none" : "top 260ms cubic-bezier(0.32,0.72,0,1), border-radius 260ms ease",
        }}
      >
        {/* Drag handle — swipe or tap to reveal/hide the map behind */}
        <div
          role="button"
          aria-label={t("explore.toggleMap", "Toggle map")}
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
          className="flex shrink-0 touch-none cursor-grab justify-center bg-[#F8F7F4] pb-1.5 pt-2.5 active:cursor-grabbing"
        >
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>

      <div
        className={[
          "flex-1 overflow-y-auto px-4.5 [&::-webkit-scrollbar]:hidden md:px-4",
          // Extra bottom room while the floating Map button is showing, so the
          // last card can scroll clear of it instead of staying hidden behind
          // it — plain padding, not a visible section (no background here).
          mapButtonVisible ? "pb-40" : "pb-6",
        ].join(" ")}
      >

        {/* Search bar */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-14 w-full items-center gap-3 rounded-full bg-white px-5.5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] text-left md:h-13 md:px-5"
        >
          <SearchIcon />
          <span className="text-[16px] font-medium text-[#A7A39D] md:text-[15px]">
            {t("explore.searchPlaceholder", "Where will you explore next?")}
          </span>
        </button>

        {/* Chips — extend edge to edge so scroll works */}
        <div className="-mx-4.5 mt-4 md:-mx-4">
        <div
          ref={chipRef}
          onMouseDown={onChipMouseDown}
          onMouseMove={onChipMouseMove}
          onMouseUp={onChipMouseUp}
          onMouseLeave={onChipMouseLeave}
          onClickCapture={onChipClickCapture}
          className="flex cursor-grab gap-2 overflow-x-auto px-4.5 pb-1 scrollbar-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden md:px-4"
        >
          {/* All */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="flex h-11.25 shrink-0 items-center gap-2 rounded-full bg-[#15A963] px-4.5 text-[15px] font-semibold text-white md:h-10.5 md:px-4 md:text-[14px]"
          >
            <FilterIcon />{t("explore.allQuests", "All")}
          </button>

          {/* Difficulty */}
          <button
            type="button"
            onClick={() => setIsDiffOpen(true)}
            className={["flex h-11.25 shrink-0 items-center gap-2 rounded-full px-4.5 text-[15px] font-medium md:h-10.5 md:px-4 md:text-[14px]",
              difficulty !== "All" ? "bg-[#E7F5EF] text-[#2F2F2F]" : "bg-[#F4F2EE] text-[#2F2F2F]"].join(" ")}
          >
            {difficulty !== "All" && <DifficultyIcon label={difficulty} />}
            {difficulty !== "All" ? translateLabel(t, difficultyKeyMap, difficulty) : t("explore.difficulty", "Difficulty")}
            <ChevronDown />
          </button>

          {/* Duration */}
          <button
            type="button"
            onClick={() => setIsDurationOpen(true)}
            className={["flex h-11.25 shrink-0 items-center gap-2 rounded-full px-4.5 text-[15px] font-medium md:h-10.5 md:px-4 md:text-[14px]",
              duration < 120 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {duration < 120 ? `0-${duration} ${t("common.min", "min")}` : t("explore.duration", "Duration")}
            <ChevronDown />
          </button>

          {/* Distance */}
          <button
            type="button"
            onClick={() => setIsDistanceOpen(true)}
            className={["flex h-11.25 shrink-0 items-center gap-2 rounded-full px-4.5 text-[15px] font-medium md:h-10.5 md:px-4 md:text-[14px]",
              distance < 15 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {distance < 15 ? `0-${distance} ${t("common.km", "km")}` : t("explore.distance", "Distance")}
            <ChevronDown />
          </button>
        </div>
        </div>

        {/* Count + sort */}
        <div className="mt-5 flex items-center justify-between">
          <h1 className="text-[18px] font-bold md:text-[17px]">
            {isLoading ? t("explore.loading", "Loading quests…") : `${filtered.length} ${t("explore.questsFound", "quests found")}`}
          </h1>
          <button type="button" onClick={() => setIsSortOpen(true)} className="flex items-center gap-1 text-[15px] font-medium text-[#8A857D] md:text-[14px]">
            {translateLabel(t, sortKeyMap, sort)} <ChevronDown />
          </button>
        </div>

        {/* Cards */}
        {isLoading && (
          <p className="mt-8 text-center text-[15px] md:text-[14px] text-[#8A857D]">{t("explore.loading", "Loading quests…")}</p>
        )}

        {!isLoading && error && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-[15px] md:text-[14px] text-[#8A857D]">{t("explore.loadError", "Couldn't load quests.")} {error}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setRetryCount((c) => c + 1);
              }}
              className="rounded-full bg-[#15A963] px-5.5 py-3 text-[15px] font-semibold text-white md:px-5 md:py-2.5 md:text-[14px]"
            >
              {t("common.retry", "Try again")}
            </button>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="mt-8 text-center text-[15px] md:text-[14px] text-[#8A857D]">{t("explore.noResults", "No quests found.")}</p>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <section className="mt-4 space-y-4">
            {filtered.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                variant={i === 0 && difficulty === "All" && query === "" ? "featured" : "compact"}
              />
            ))}
          </section>
        )}
      </div>

      {/* Map button — a floating overlay above the bottom nav, not part of
          normal document flow (no wrapper background/height/padding), so
          quest cards keep scrolling visibly underneath it. Fixed positioning
          matches the real device viewport on mobile; on the md: desktop
          mockup (a bounded, non-fullscreen box) fixed would escape the
          phone frame entirely, so it switches to absolute there instead —
          same visual position, just contained to the mockup like everything
          else on this page. Only shown while the sheet fully covers the map. */}
      {mapButtonVisible && (
        <div className="fixed md:absolute left-1/2 z-40 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom)+16px)] md:bottom-[12px]">
          <button
            type="button"
            onClick={openMap}
            aria-label={t("explore.showMapView", "Show map view")}
            className="flex h-13.5 w-35 items-center justify-center gap-2 rounded-full bg-[#15A963] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(21,169,99,0.35)] md:text-[15px]"
          >
            <MapFabIcon />
            {t("explore.map", "Map")}
          </button>
        </div>
      )}
      </div>

      {/* Search */}
      {isSearchOpen && (
        <SearchExpanded
          query={query}
          setQuery={setQuery}
          results={filtered}
          onNearby={handleNearby}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Sheets */}
      {isFiltersOpen   && (
        <FiltersSheet
          onClose={() => setIsFiltersOpen(false)}
          filteredCount={filtered.length}
          myQ={myQ}
          setMyQ={setMyQ}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          duration={duration}
          setDuration={setDuration}
          distance={distance}
          setDistance={setDistance}
          accessibility={accessibility}
          setAccessibility={setAccessibility}
          activity={activity}
          setActivity={setActivity}
          features={features}
          setFeatures={setFeatures}
        />
      )}
      {isDiffOpen      && <DifficultySheet selected={difficulty} onChange={setDifficulty} onClose={() => setIsDiffOpen(false)} count={filtered.length} />}
      {isDurationOpen  && <DurationSheet value={duration} onChange={setDuration} onClose={() => setIsDurationOpen(false)} count={filtered.length} />}
      {isDistanceOpen  && <DistanceSheet value={distance} onChange={setDistance} onClose={() => setIsDistanceOpen(false)} count={filtered.length} />}
      {isSortOpen      && <SortSheet selected={sort} onChange={setSort} onClose={() => setIsSortOpen(false)} />}
    </main>
  );
}
