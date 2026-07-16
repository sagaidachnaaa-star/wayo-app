import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SavedContext } from "../context/SavedContext";
import { getCompletedQuests } from "../utils/questProgress";

import distanceIcon from "../assets/DistanceIcon.png";
import timeIcon from "../assets/TimeIcon.png";
import difficultyIcon from "../assets/DifficultyIcon.png";
import accessibilityIcon from "../assets/AccessibilityIcon.png";

const API_URL = "http://localhost:5050";
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
    distance: formatDistance(api.distance_km),
    accessibility: api.accessibility,
    image: api.image_url,
    isDaily: Boolean(api.is_daily),
    lat: Number(api.latitude),
    lng: Number(api.longitude),
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
// comes entirely from the API above.
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
function getSafetyIcon(title) {
  const t = title.toLowerCase();
  if (t.includes("step-free") || t.includes("paved") || t.includes("flat")) return accessibilityIcon;
  if (t.includes("rest stop")) return "/assets/StopsIcon.png";
  if (t.includes("busy") || t.includes("aware") || t.includes("uphill")) return "/assets/UphillIcon.png";
  return null; // → generic checkmark
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "white" : "none"}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 21V4" stroke="#15A963" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 5c2-1.5 4-1.5 6 0s4 1.5 6 0v9c-2 1.5-4 1.5-6 0s-4-1.5-6 0V5Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#15A963" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#6F6A62" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#6F6A62" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WeatherIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
      <img src={icon} alt="" className="h-9 w-9 shrink-0" />
      <div>
        <p className="text-[13px] text-[#8A857D]">{label}</p>
        <p className="text-[16px] font-bold text-[#2F2F2F]">{value}</p>
      </div>
    </div>
  );
}

// ── Route timeline row ────────────────────────────────────────────────────────
function TimelineRow({ marker, kicker, label, last }) {
  return (
    <div className={["relative flex gap-4", last ? "" : "pb-6"].join(" ")}>
      <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center">{marker}</div>
      <div className="pt-2">
        <p className="text-[13px] text-[#8A857D]">{kicker}</p>
        <p className="text-[15px] font-bold text-[#2F2F2F]">{label}</p>
      </div>
    </div>
  );
}

// The app's status bar (see App.jsx) overlays the top of this page and is 52px
// tall — the sticky header buttons sit just below it, not below the scroll.
const HEADER_TOP_OFFSET = 68;
const SWIPE_THRESHOLD = 50;

export default function QuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedMap, toggleSaved } = useContext(SavedContext);
  const [activeImg, setActiveImg] = useState(0);
  const pointerStartX = useRef(null);

  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/quests/${id}`)
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
  }, [id, retryCount]);

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
        `https://api.openweathermap.org/data/2.5/weather?lat=${quest.lat}&lon=${quest.lng}&appid=${WEATHER_API_KEY}&units=metric`
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
  }, [quest?.lat, quest?.lng]);

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
    setCompletedFromApi(null);

    fetch(`${API_URL}/api/completed/${id}`)
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

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>Loading quest…</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>Quest not found.</p>
      </main>
    );
  }

  if (error || !quest) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-3 bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p className="text-[14px] text-[#8A857D]">Couldn't load this quest. {error}</p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setError(null);
            setRetryCount((c) => c + 1);
          }}
          className="rounded-full bg-[#15A963] px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Try again
        </button>
      </main>
    );
  }

  const detail = quest; // same normalized object carries both the "basic" and "extended" fields

  const tags = categoryTagsByQuestId[quest.id] ?? [];
  const discover = discoverImagesByQuestId[quest.id];

  return (
    <main className="relative h-full overflow-hidden bg-[#F8F7F4]">
      {/* Scrollable page content — the header/footer buttons below float above this */}
      <div className="h-full overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden">
        {/* Hero image carousel */}
        <div
          className="relative h-96 w-full touch-pan-y overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeImg * 100}%)` }}
          >
            {heroImages.map((src, i) => (
              <img key={i} src={src} alt={quest.title} draggable={false} className="h-full w-full shrink-0 object-cover" />
            ))}
          </div>

          {heroImages.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={["h-2 w-2 rounded-full transition-colors", i === activeImg ? "bg-white" : "bg-white/40"].join(" ")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pt-5 text-[#2F2F2F]">
          <h1 className="text-[26px] font-bold leading-tight">{quest.title}</h1>
          <p className="mt-1.5 text-[15px] text-[#2F2F2F]">{quest.description}</p>

          {tags.length > 0 && (
            <p className="mt-2 text-[13px] font-medium text-[#6F6A62]">
              {tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && <span className="text-[#15A963]"> · </span>}
                  {tag}
                </span>
              ))}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatBox icon={distanceIcon} label="Distance" value={quest.distance} />
            <StatBox icon={timeIcon} label="Time" value={quest.duration} />
            <StatBox icon={difficultyIcon} label="Difficulty" value={quest.difficulty} />
            <StatBox icon={accessibilityIcon} label="Accessibility" value={quest.accessibility} />
          </div>

          {detail?.longDescription && (
            <p className="mt-5 text-[15px] leading-normal text-[#2F2F2F]">{detail.longDescription}</p>
          )}

          {/* What you'll discover */}
          {discover && discover.length > 0 && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">What you&apos;ll discover</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {discover.map((d) => (
                  <div key={d.name}>
                    <img src={d.image} alt={d.name} className="h-24 w-full rounded-2xl object-cover" />
                    <p className="mt-1.5 text-center text-[14px] font-semibold">{d.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Route details */}
          {detail?.route && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">Route details</h2>
              <div className="relative mt-4">
                <div className="absolute left-5.25 top-11 bottom-11 w-0.5 bg-[#15A963]" />
                <TimelineRow
                  marker={<div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#15A963] bg-white">{<FlagIcon />}</div>}
                  kicker="Start point"
                  label={detail.route.start.title}
                />
                {detail.route.stops.map((stop, i) => (
                  <TimelineRow
                    key={stop.title}
                    marker={<span className="h-3 w-3 rounded-full bg-[#15A963]" />}
                    kicker={`Stop ${i + 1}`}
                    label={stop.title}
                  />
                ))}
                <TimelineRow
                  last
                  marker={<div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#15A963] bg-white">{<CheckIcon />}</div>}
                  kicker="End point"
                  label={detail.route.end.title}
                />
              </div>
            </>
          )}

          {/* Accessibility & safety */}
          {detail?.safety && detail.safety.length > 0 && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">Accessibility &amp; safety</h2>
              <p className="mt-1 text-[13px] text-[#8A857D]">Important route notes before you start</p>
              <div className="mt-4 space-y-4">
                {detail.safety.map((item) => {
                  const icon = getSafetyIcon(item.title);
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#15A963]">
                        {icon ? <img src={icon} alt="" className="h-5 w-5" /> : <CheckIcon size={18} />}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#2F2F2F]">{item.title}</p>
                        <p className="mt-0.5 text-[13px] leading-[1.4] text-[#8A857D]">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Weather */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F5EF]">
              <WeatherIcon />
            </div>
            <div>
              {weatherStatus === "ready" && weather && Number.isFinite(weather.temp) ? (
                <>
                  <p className="text-[15px] font-bold text-[#2F2F2F]">
                    {weather.temp}°C{weather.description ? ` · ${weather.description}` : ""}
                  </p>
                  <p className="text-[13px] text-[#8A857D]">Check the weather before starting this outdoor quest.</p>
                </>
              ) : weatherStatus === "loading" ? (
                <p className="text-[13px] text-[#8A857D]">Loading weather…</p>
              ) : (
                <p className="text-[13px] text-[#8A857D]">Weather information is currently unavailable.</p>
              )}
            </div>
          </div>

          {/* Quest reward */}
          {detail?.badge && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">Quest reward</h2>
              <div className="mt-3 flex gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
                <div className="flex h-28 w-24 shrink-0 items-center justify-center">
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
                  <p className="text-[15px] font-bold text-[#2F2F2F]">{detail.badge.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.4] text-[#8A857D]">{detail.badge.desc}</p>
                  {isCompleted ? (
                    <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-[#E7F5EF] px-3 py-1.5 text-[12px] font-medium text-[#15A963]">
                      <CheckIcon size={13} /> Collected
                    </span>
                  ) : (
                    <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-[#F0EEE9] px-3 py-1.5 text-[12px] font-medium text-[#6F6A62]">
                      <LockIcon /> Locked
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
        className="absolute inset-x-0 z-30 flex items-center justify-between px-5"
        style={{ top: HEADER_TOP_OFFSET }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md"
        >
          <BackArrowIcon />
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toggleSaved(quest.id)}
            aria-label="Save quest"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md"
          >
            <HeartIcon filled={saved} />
          </button>
        </div>
      </div>

      {/* Sticky "Start/Repeat quest" button — fixed over the bottom of the screen, independent of scroll */}
      <div className="absolute inset-x-5 bottom-5 z-30">
        {isCompleted && (
          <p className="mb-2 rounded-full bg-[#E7F5EF] px-4 py-2 text-center text-[13px] font-medium text-[#15A963] shadow-[0_4px_14px_rgba(47,47,47,0.08)]">
            Badge already unlocked in your Passport.
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate(`/quest/${quest.id}/active`)}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(21,169,99,0.35)]"
        >
          {isCompleted ? "Repeat quest" : "Start quest"}
        </button>
      </div>
    </main>
  );
}
