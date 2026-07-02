import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import QuestCard from "../components/QuestCard";
import { SavedContext } from "../context/SavedContext";
import { quests } from "../data/quests";

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartOutlineIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z"
        stroke="#2F2F2F"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Sort sheet ────────────────────────────────────────────────────────────────
const sortOptions = ["Last updated", "Name"];

function SortSheet({ selected, onChange, onClose }) {
  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 z-40 bg-black/20" />
      <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>
        <div className="px-5 pb-6">
          <h2 className="text-[20px] font-bold text-[#2F2F2F]">Sort</h2>
          <div className="mt-4 space-y-2">
            {sortOptions.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); onClose(); }}
                className={[
                  "flex h-13 w-full items-center rounded-full border px-5 text-[15px] font-medium text-[#2F2F2F]",
                  selected === o ? "border-[#15A963] bg-[#E7F5EF]" : "border-transparent bg-[#F4F2EE]",
                ].join(" ")}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Saved() {
  const navigate = useNavigate();
  const { savedMap } = useContext(SavedContext);
  const [sort, setSort] = useState("Last updated");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const savedQuests = useMemo(() => {
    const list = quests.filter((q) => savedMap[q.id]);
    if (sort === "Name") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => savedMap[b.id] - savedMap[a.id]);
  }, [savedMap, sort]);

  const isEmpty = savedQuests.length === 0;

  return (
    <main className="relative flex h-full flex-col overflow-hidden bg-[#F8F7F4] text-[#2F2F2F]">
      <div className="flex-1 overflow-y-auto px-4 pb-6 [&::-webkit-scrollbar]:hidden">
        <h1 className="pt-2 text-[28px] font-bold">Saved</h1>

        <button
          type="button"
          onClick={() => setIsSortOpen(true)}
          className="mt-4 flex h-10.5 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-[#2F2F2F] shadow-[0_4px_14px_rgba(47,47,47,0.06)]"
        >
          {sort}
          <ChevronDown />
        </button>

        {isEmpty ? (
          <div className="mt-24 flex flex-col items-center px-6 text-center">
            <HeartOutlineIcon />
            <h2 className="mt-5 text-[19px] font-bold text-[#2F2F2F]">Add your first favourite</h2>
            <p className="mt-2 text-[14px] leading-[1.4] text-[#8A857D]">
              Save places, routes or spots you love and find them here
            </p>
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="mt-6 flex h-13 items-center justify-center rounded-full bg-[#15A963] px-8 text-[15px] font-bold text-white"
            >
              Explore quests
            </button>
          </div>
        ) : (
          <section className="mt-4 space-y-4">
            {savedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} variant="compact" />
            ))}
          </section>
        )}
      </div>

      {isSortOpen && <SortSheet selected={sort} onChange={setSort} onClose={() => setIsSortOpen(false)} />}
    </main>
  );
}
