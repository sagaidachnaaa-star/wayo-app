import { useContext, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { quests } from "../data/quests";
import { questDetails } from "../data/questDetails";
import { SavedContext } from "../context/SavedContext";
import { getCompletedQuests } from "../utils/questProgress";

import distanceIcon from "../assets/DistanceIcon.png";
import timeIcon from "../assets/TimeIcon.png";
import difficultyIcon from "../assets/DifficultyIcon.png";
import accessibilityIcon from "../assets/AccessibilityIcon.png";

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
  const quest = quests.find((q) => q.id === id);
  const { savedMap, toggleSaved } = useContext(SavedContext);
  const [activeImg, setActiveImg] = useState(0);
  const pointerStartX = useRef(null);

  if (!quest) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>Quest not found.</p>
      </main>
    );
  }

  const detail = questDetails[quest.id];
  const saved = Boolean(savedMap[quest.id]);
  const heroImages = detail?.heroImages ?? [quest.image];

  // A quest stays repeatable after completion — it just never locks the
  // badge again. completedQuestIds comes from localStorage (no backend yet).
  const completedQuestIds = getCompletedQuests();
  const isCompleted = quest.completed || completedQuestIds.includes(quest.id);

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

          {detail?.tags && (
            <p className="mt-2 text-[13px] font-medium text-[#15A963]">
              {detail.tags.join("  ·  ")}
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
          {detail?.discover && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">What you&apos;ll discover</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {detail.discover.map((d) => (
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
          {detail?.safety && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">Accessibility &amp; safety</h2>
              <p className="mt-1 text-[13px] text-[#8A857D]">Important route notes before you start</p>
              <div className="mt-4 space-y-4">
                {detail.safety.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#15A963]">
                      <img src={item.icon} alt="" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#2F2F2F]">{item.title}</p>
                      <p className="mt-0.5 text-[13px] leading-[1.4] text-[#8A857D]">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {detail.weatherNote && (
                <p className="mt-4 text-[13px] leading-[1.4] text-[#8A857D]">{detail.weatherNote}</p>
              )}
            </>
          )}

          {/* Quest reward */}
          {detail?.badge && (
            <>
              <h2 className="mt-7 text-[19px] font-bold">Quest reward</h2>
              <div className="mt-3 flex gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
                <div className="flex h-28 w-24 shrink-0 items-center justify-center">
                  <img src={detail.badge.image} alt={detail.badge.name} className="h-full w-full object-contain" />
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
