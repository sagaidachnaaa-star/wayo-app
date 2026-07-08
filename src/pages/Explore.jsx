import { useEffect, useMemo, useRef, useState } from "react";
import QuestCard from "../components/QuestCard";
import QuestMapView from "../components/QuestMapView";
import { quests } from "../data/quests";
import { getCompletedQuests } from "../utils/questProgress";
import { haversineDistanceKm } from "../utils/geo";

// Used for "Closest" sorting if the user denies/lacks geolocation.
const DEFAULT_LOCATION = { lat: 51.4826, lng: -0.0077 }; // Greenwich, London

// ── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#15A963" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="#15A963" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#15A963" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MapFabIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 3v15M15 6v15" stroke="white" strokeWidth="2" />
    </svg>
  );
}
function LocationArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L19 21L12 17L5 21L12 2Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── Difficulty badge shapes ───────────────────────────────────────────────────
function EasyDot()     { return <span className="h-3.25 w-3.25 rounded-full bg-[#15A963] shrink-0" />; }
function ModerateDot() { return <span className="h-2.75 w-2.75 rounded-xs bg-[#F6CA5D] shrink-0" />; }
function ToughDot()    {
  return (
    <span className="shrink-0 h-0 w-0" style={{ borderLeft:"7px solid transparent", borderRight:"7px solid transparent", borderBottom:"13px solid #D44A08" }} />
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
  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
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
        "flex h-10.5 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors",
        active ? "border-[#15A963] bg-[#E7F5EF] text-[#2F2F2F]" : "border-[#E5E3DC] bg-white text-[#2F2F2F]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Range slider ──────────────────────────────────────────────────────────────
function RangeSlider({ label, min, max, unit, value, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#2F2F2F]">{label}</p>
        <p className="text-[13px] text-[#8A857D]">{min}-{value} {unit}</p>
      </div>
      <div className="relative mt-3 h-1 rounded-full bg-[#E5E3DC]">
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#15A963]" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          style={{ height: 20, top: -8 }}
        />
        {/* thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-6.5 w-6.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Difficulty sheet ──────────────────────────────────────────────────────────
function DifficultySheet({ selected, onChange, onClose, count }) {
  const options = ["Easy", "Moderate", "Tough"];
  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-6">
        <h2 className="text-[20px] font-bold text-[#2F2F2F]">Difficulty</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((d) => (
            <FilterPill key={d} active={selected === d} onClick={() => onChange(d === selected ? "All" : d)}>
              <DifficultyIcon label={d} />
              {d}
            </FilterPill>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white"
        >
          See {count} quest{count !== 1 ? "s" : ""}
        </button>
      </div>
    </Sheet>
  );
}

// ── Duration sheet ────────────────────────────────────────────────────────────
function DurationSheet({ value, onChange, onClose, count }) {
  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-6">
        <h2 className="text-[20px] font-bold text-[#2F2F2F]">Duration</h2>
        <RangeSlider label="" min={0} max={120} unit="min" value={value} onChange={onChange} />
        <button type="button" onClick={onClose} className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white">
          See {count} quest{count !== 1 ? "s" : ""}
        </button>
      </div>
    </Sheet>
  );
}

// ── Distance sheet ────────────────────────────────────────────────────────────
function DistanceSheet({ value, onChange, onClose, count }) {
  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-6">
        <h2 className="text-[20px] font-bold text-[#2F2F2F]">Distance</h2>
        <RangeSlider label="" min={0} max={15} unit="km" value={value} onChange={onChange} />
        <button type="button" onClick={onClose} className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white">
          See {count} quest{count !== 1 ? "s" : ""}
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
  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pb-6">
        <h2 className="text-[20px] font-bold text-[#2F2F2F]">Sort</h2>
        <div className="mt-4 space-y-2">
          {sortOptions.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => { onChange(o.label); onClose(); }}
              className={[
                "flex h-13 w-full items-center rounded-full px-5 text-[15px] font-medium",
                selected === o.label ? "bg-[#E7F5EF] text-[#2F2F2F]" : "bg-[#F4F2EE] text-[#2F2F2F]",
              ].join(" ")}
            >
              {o.label}
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

function FiltersSheet({ onClose, filteredCount, myQ, setMyQ }) {
  const [diff, setDiff]     = useState([]);
  const [duration, setDuration] = useState(90);
  const [distance, setDistance] = useState(15);
  const [acc, setAcc]       = useState([]);
  const [act, setAct]       = useState([]);
  const [feat, setFeat]     = useState([]);

  function toggle(arr, setArr, val) {
    setArr((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
  }

  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[88%] flex-col rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <h2 className="mt-1 text-[22px] font-bold text-[#2F2F2F]">Filters</h2>

          {/* Difficulty */}
          <p className="mt-5 text-[15px] font-semibold">Difficulty</p>
          <div className="mt-3 flex gap-2">
            {["Easy", "Moderate", "Tough"].map((d) => (
              <FilterPill key={d} active={diff.includes(d)} onClick={() => toggle(diff, setDiff, d)}>
                <DifficultyIcon label={d} />{d}
              </FilterPill>
            ))}
          </div>

          {/* Duration */}
          <RangeSlider label="Duration" min={0} max={120} unit="min" value={duration} onChange={setDuration} />

          {/* Distance */}
          <RangeSlider label="Distance" min={0} max={15} unit="km" value={distance} onChange={setDistance} />

          {/* Accessibility */}
          <p className="mt-5 text-[15px] font-semibold">Accessibility</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {accessibilityOpts.map((a) => (
              <FilterPill key={a} active={acc.includes(a)} onClick={() => toggle(acc, setAcc, a)}>{a}</FilterPill>
            ))}
          </div>

          {/* Activity */}
          <p className="mt-5 text-[15px] font-semibold">Activity</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activityOpts.map((a) => (
              <FilterPill key={a} active={act.includes(a)} onClick={() => toggle(act, setAct, a)}>{a}</FilterPill>
            ))}
          </div>

          {/* Features */}
          <p className="mt-5 text-[15px] font-semibold">Features</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {featureOpts.map((f) => (
              <FilterPill key={f} active={feat.includes(f)} onClick={() => toggle(feat, setFeat, f)}>{f}</FilterPill>
            ))}
          </div>

          {/* My Quests */}
          <p className="mt-5 text-[15px] font-semibold">My Quests</p>
          <div className="mt-3 flex overflow-hidden rounded-full border border-[#E5E3DC]">
            {["All", "Completed", "Not completed"].map((q) => (
              <button key={q} type="button" onClick={() => setMyQ(q)}
                className={["flex-1 py-2 text-[13px] font-medium", myQ === q ? "bg-[#F8F7F4]" : "bg-white text-[#8A857D]"].join(" ")}
              >{q}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#EDECE6] px-5 py-4 shrink-0">
          <button
            type="button"
            onClick={() => { setMyQ("All"); onClose(); }}
            className="flex h-13.5 flex-1 items-center justify-center rounded-full border border-[#E5E3DC] text-[15px] font-semibold text-[#2F2F2F]"
          >
            Clear all
          </button>
          <button type="button" onClick={onClose} className="flex h-13.5 flex-2 items-center justify-center rounded-full bg-[#15A963] text-[15px] font-semibold text-white">
            See {filteredCount} quest{filteredCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Search expanded ───────────────────────────────────────────────────────────
function SearchExpanded({ query, setQuery, results, onNearby, onClose }) {
  const hasQuery = query.trim() !== "";

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#F8F7F4] px-4 pt-4">
      <div className="flex h-13.5 shrink-0 items-center gap-3 rounded-full bg-white px-4 shadow-[0_4px_16px_rgba(47,47,47,0.07)]">
        <button type="button" onClick={onClose}><BackIcon /></button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where will you explore next?"
          className="flex-1 bg-transparent text-[16px] font-medium text-[#2F2F2F] outline-none placeholder:text-[#A7A39D]"
        />
      </div>

      <button
        type="button"
        onClick={onNearby}
        className="mt-3 flex shrink-0 items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-[0_4px_14px_rgba(47,47,47,0.06)]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FBF5]">
          <LocationArrow />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#2F2F2F]">Nearby quest</p>
          <p className="text-[13px] text-[#8A857D]">Use my current location</p>
        </div>
      </button>

      {hasQuery && (
        <div className="mt-4 flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden">
          <p className="mb-3 text-[13px] font-medium text-[#8A857D]">
            {results.length} quest{results.length !== 1 ? "s" : ""} found
          </p>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((quest) => (
                <QuestCard key={quest.id} quest={quest} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-[14px] text-[#8A857D]">No quests match "{query}".</p>
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
  const [query, setQuery]           = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort]             = useState("Most relevant");
  const [duration, setDuration]     = useState(120);
  const [distance, setDistance]     = useState(15);
  const [myQ, setMyQ]               = useState("All");

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

      const isCompleted = q.completed || completedIds.includes(q.id);
      const matchMyQ =
        myQ === "All" || (myQ === "Completed" && isCompleted) || (myQ === "Not completed" && !isCompleted);

      return matchDiff && matchesText && matchMyQ;
    });

    if (sort === "Most popular") {
      return [...matches].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    if (sort === "Newly added") {
      return [...matches].sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    }
    if (sort === "Closest") {
      const from = userLocation ?? (locationDenied ? DEFAULT_LOCATION : null);
      if (from) {
        return [...matches].sort(
          (a, b) =>
            haversineDistanceKm(from.lat, from.lng, a.coordinates.lat, a.coordinates.lng) -
            haversineDistanceKm(from.lat, from.lng, b.coordinates.lat, b.coordinates.lng)
        );
      }
    }
    // "Most relevant" (default), or "Closest" while location is still loading.
    return matches;
  }, [query, difficulty, myQ, sort, userLocation, locationDenied]);

  const anySheetOpen = isFiltersOpen || isDiffOpen || isDurationOpen || isDistanceOpen || isSortOpen;

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
          aria-label="Toggle map"
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
          className="flex shrink-0 touch-none cursor-grab justify-center bg-[#F8F7F4] pb-1.5 pt-2.5 active:cursor-grabbing"
        >
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 [&::-webkit-scrollbar]:hidden">

        {/* Search bar */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-13 w-full items-center gap-3 rounded-full bg-white px-5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] text-left"
        >
          <SearchIcon />
          <span className="text-[15px] font-medium text-[#A7A39D]">Where will you explore next?</span>
        </button>

        {/* Chips — extend edge to edge so scroll works */}
        <div className="-mx-4 mt-4">
        <div
          ref={chipRef}
          onMouseDown={onChipMouseDown}
          onMouseMove={onChipMouseMove}
          onMouseUp={onChipMouseUp}
          onMouseLeave={onChipMouseLeave}
          onClickCapture={onChipClickCapture}
          className="flex cursor-grab gap-2 overflow-x-auto px-4 pb-1 scrollbar-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {/* All */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="flex h-10.5 shrink-0 items-center gap-2 rounded-full bg-[#15A963] px-4 text-[14px] font-semibold text-white"
          >
            <FilterIcon />All
          </button>

          {/* Difficulty */}
          <button
            type="button"
            onClick={() => setIsDiffOpen(true)}
            className={["flex h-10.5 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
              difficulty !== "All" ? "bg-[#E7F5EF] text-[#2F2F2F]" : "bg-[#F4F2EE] text-[#2F2F2F]"].join(" ")}
          >
            {difficulty !== "All" && <DifficultyIcon label={difficulty} />}
            {difficulty !== "All" ? difficulty : "Difficulty"}
            <ChevronDown />
          </button>

          {/* Duration */}
          <button
            type="button"
            onClick={() => setIsDurationOpen(true)}
            className={["flex h-10.5 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
              duration < 120 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {duration < 120 ? `0-${duration} min` : "Duration"}
            <ChevronDown />
          </button>

          {/* Distance */}
          <button
            type="button"
            onClick={() => setIsDistanceOpen(true)}
            className={["flex h-10.5 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
              distance < 15 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {distance < 15 ? `0-${distance} km` : "Distance"}
            <ChevronDown />
          </button>
        </div>
        </div>

        {/* Count + sort */}
        <div className="mt-5 flex items-center justify-between">
          <h1 className="text-[17px] font-bold">{filtered.length} quests found</h1>
          <button type="button" onClick={() => setIsSortOpen(true)} className="flex items-center gap-1 text-[14px] font-medium text-[#8A857D]">
            {sort} <ChevronDown />
          </button>
        </div>

        {/* Cards */}
        <section className="mt-4 space-y-4">
          {filtered.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              variant={i === 0 && difficulty === "All" && query === "" ? "featured" : "compact"}
            />
          ))}
        </section>
      </div>
      </div>

      {/* Map FAB — only shown while the sheet is fully covering the map; tap to peek */}
      {!anySheetOpen && !isSearchOpen && !dragging && sheetTop < 1 && (
        <button
          type="button"
          onClick={openMap}
          className="absolute bottom-4 right-4 z-30 flex h-16.5 w-16.5 flex-col items-center justify-center gap-0.5 rounded-full bg-[#252525] text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        >
          <MapFabIcon />
          <span>Map</span>
        </button>
      )}

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
      {isFiltersOpen   && <FiltersSheet onClose={() => setIsFiltersOpen(false)} filteredCount={filtered.length} myQ={myQ} setMyQ={setMyQ} />}
      {isDiffOpen      && <DifficultySheet selected={difficulty} onChange={setDifficulty} onClose={() => setIsDiffOpen(false)} count={filtered.length} />}
      {isDurationOpen  && <DurationSheet value={duration} onChange={setDuration} onClose={() => setIsDurationOpen(false)} count={filtered.length} />}
      {isDistanceOpen  && <DistanceSheet value={distance} onChange={setDistance} onClose={() => setIsDistanceOpen(false)} count={filtered.length} />}
      {isSortOpen      && <SortSheet selected={sort} onChange={setSort} onClose={() => setIsSortOpen(false)} />}
    </main>
  );
}
