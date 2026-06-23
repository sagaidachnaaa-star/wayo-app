import { useMemo, useState } from "react";
import { Link } from "react-router";
import QuestCard from "../components/QuestCard";
import { quests } from "../data/quests";

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
function EasyDot()     { return <span className="h-[13px] w-[13px] rounded-full bg-[#15A963] shrink-0" />; }
function ModerateDot() { return <span className="h-[11px] w-[11px] rounded-[2px] bg-[#F6CA5D] shrink-0" />; }
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

// ── Sheet wrapper ─────────────────────────────────────────────────────────────
function Sheet({ onClose, children }) {
  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-[5px] w-[44px] rounded-full bg-[#D5D2CC]" />
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
        "flex h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors",
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
      <div className="relative mt-3 h-[4px] rounded-full bg-[#E5E3DC]">
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
          className="pointer-events-none absolute top-1/2 h-[26px] w-[26px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
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
          className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white"
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
        <button type="button" onClick={onClose} className="mt-6 flex h-[54px] w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white">
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
        <button type="button" onClick={onClose} className="mt-6 flex h-[54px] w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-semibold text-white">
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
                "flex h-[52px] w-full items-center rounded-full px-5 text-[15px] font-medium",
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

function FiltersSheet({ onClose, filteredCount }) {
  const [diff, setDiff]     = useState([]);
  const [duration, setDuration] = useState(90);
  const [distance, setDistance] = useState(15);
  const [acc, setAcc]       = useState([]);
  const [act, setAct]       = useState([]);
  const [feat, setFeat]     = useState([]);
  const [myQ, setMyQ]       = useState("All");

  function toggle(arr, setArr, val) {
    setArr((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
  }

  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[88%] flex-col rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-[5px] w-[44px] rounded-full bg-[#D5D2CC]" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <button type="button" onClick={onClose} className="flex h-[54px] flex-1 items-center justify-center rounded-full border border-[#E5E3DC] text-[15px] font-semibold text-[#2F2F2F]">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="flex h-[54px] flex-[2] items-center justify-center rounded-full bg-[#15A963] text-[15px] font-semibold text-white">
            See {filteredCount} quest{filteredCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Search expanded ───────────────────────────────────────────────────────────
function SearchExpanded({ query, setQuery, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#F8F7F4] px-4 pt-4">
      <div className="flex h-[54px] items-center gap-3 rounded-full bg-white px-4 shadow-[0_4px_16px_rgba(47,47,47,0.07)]">
        <button type="button" onClick={onClose}><BackIcon /></button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where will you explore next?"
          className="flex-1 bg-transparent text-[16px] font-medium text-[#2F2F2F] outline-none placeholder:text-[#A7A39D]"
        />
      </div>
      <div className="mt-3 flex items-center gap-4 rounded-[16px] bg-white p-4 shadow-[0_4px_14px_rgba(47,47,47,0.06)]">
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#F0FBF5]">
          <LocationArrow />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#2F2F2F]">Nearby quest</p>
          <p className="text-[13px] text-[#8A857D]">Use my current location</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Explore() {
  const [query, setQuery]           = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort]             = useState("Most relevant");
  const [duration, setDuration]     = useState(120);
  const [distance, setDistance]     = useState(15);

  const [isSearchOpen, setIsSearchOpen]     = useState(false);
  const [isFiltersOpen, setIsFiltersOpen]   = useState(false);
  const [isDiffOpen, setIsDiffOpen]         = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isDistanceOpen, setIsDistanceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen]         = useState(false);

  const filtered = useMemo(() => {
    return quests.filter((q) => {
      const matchDiff = difficulty === "All" || q.difficulty === difficulty;
      const text = `${q.title} ${q.location} ${q.description}`.toLowerCase();
      return matchDiff && text.includes(query.toLowerCase());
    });
  }, [query, difficulty]);

  const anySheetOpen = isFiltersOpen || isDiffOpen || isDurationOpen || isDistanceOpen || isSortOpen;

  return (
    <main className="relative h-full bg-[#F8F7F4] text-[#2F2F2F]">
      <div className="h-full overflow-y-auto px-4 pb-[24px] pt-4">

        {/* Search bar */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-[52px] w-full items-center gap-3 rounded-full bg-white px-5 shadow-[0_4px_16px_rgba(47,47,47,0.06)] text-left"
        >
          <SearchIcon />
          <span className="text-[15px] font-medium text-[#A7A39D]">Where will you explore next?</span>
        </button>

        {/* Chips — extend edge to edge so scroll works */}
        <div className="-mx-4 mt-4">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* All */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="flex h-[42px] shrink-0 items-center gap-2 rounded-full bg-[#15A963] px-4 text-[14px] font-semibold text-white"
          >
            <FilterIcon />All
          </button>

          {/* Difficulty */}
          <button
            type="button"
            onClick={() => setIsDiffOpen(true)}
            className={["flex h-[42px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
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
            className={["flex h-[42px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
              duration < 120 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {duration < 120 ? `0-${duration} min` : "Duration"}
            <ChevronDown />
          </button>

          {/* Distance */}
          <button
            type="button"
            onClick={() => setIsDistanceOpen(true)}
            className={["flex h-[42px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
              distance < 15 ? "bg-[#E7F5EF]" : "bg-[#F4F2EE]"].join(" ")}
          >
            {distance < 15 ? `0-${distance} km` : "Distance"}
            <ChevronDown />
          </button>

          {/* Features */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="flex h-[42px] shrink-0 items-center gap-2 rounded-full bg-[#F4F2EE] px-4 text-[14px] font-medium text-[#2F2F2F]"
          >
            Features <ChevronDown />
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

      {/* Map FAB */}
      {!anySheetOpen && !isSearchOpen && (
        <Link
          to="/map"
          className="absolute bottom-[16px] right-4 z-30 flex h-[66px] w-[66px] flex-col items-center justify-center gap-[2px] rounded-full bg-[#252525] text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        >
          <MapFabIcon />
          <span>Map</span>
        </Link>
      )}

      {/* Search */}
      {isSearchOpen && <SearchExpanded query={query} setQuery={setQuery} onClose={() => setIsSearchOpen(false)} />}

      {/* Sheets */}
      {isFiltersOpen   && <FiltersSheet onClose={() => setIsFiltersOpen(false)} filteredCount={filtered.length} />}
      {isDiffOpen      && <DifficultySheet selected={difficulty} onChange={setDifficulty} onClose={() => setIsDiffOpen(false)} count={filtered.length} />}
      {isDurationOpen  && <DurationSheet value={duration} onChange={setDuration} onClose={() => setIsDurationOpen(false)} count={filtered.length} />}
      {isDistanceOpen  && <DistanceSheet value={distance} onChange={setDistance} onClose={() => setIsDistanceOpen(false)} count={filtered.length} />}
      {isSortOpen      && <SortSheet selected={sort} onChange={setSort} onClose={() => setIsSortOpen(false)} />}
    </main>
  );
}
