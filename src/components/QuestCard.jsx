import { useState } from "react";
import { useNavigate } from "react-router";


function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" stroke="#15A963" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.4" stroke="#15A963" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "white" : "none"}>
      <path
        d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F6CA5D">
      <path d="m12 2 2.8 6 6.5.8-4.8 4.5 1.3 6.4L12 16.4 6.2 19.7l1.3-6.4L2.7 8.8 9.2 8 12 2Z" />
    </svg>
  );
}

export default function QuestCard({ quest, variant = "compact" }) {
  const navigate = useNavigate();
  const isFeatured = variant === "featured";
  const [saved, setSaved] = useState(quest.isSaved ?? false);

  return (
    <article
      onClick={() => navigate(`/quest/${quest.id}`)}
      className="cursor-pointer overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(47,47,47,0.07)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={quest.image}
          alt={quest.title}
          className={["w-full object-cover", isFeatured ? "h-50" : "h-40"].join(" ")}
        />

        {/* Daily Quest badge */}
        {quest.isDaily && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5ounded-full bg-[#15A963] px-3 py-1.5ext-[12px] font-bold uppercase tracking-[0.6px] text-white">
            <StarIcon />
            Daily Quest
          </div>
        )}

        {/* iOS glass save button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl"
          aria-label="Save quest"
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <h2 className="text-[20px] font-bold leading-[1.1] tracking-[-0.4px] text-[#2F2F2F]">
          {quest.title}
        </h2>

        <div className="mt-1.5 flex items-center gap-1.5 text-[14px] text-[#6F6A62]">
          <LocationIcon />
          <span>{quest.location}</span>
        </div>

        <p className="mt-2 text-[14px] leading-[1.4] text-[#2F2F2F]">
          {quest.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium text-[#6F6A62]">
          {quest.difficulty === "Easy" && (
            <span className="h-2.75 w-2.75 shrink-0 rounded-full bg-[#15A963]" />
          )}
          {quest.difficulty === "Moderate" && (
            <span className="h-2.5 w-2.5 shrink-0 rourounded-xs-[#F6CA5D]" />
          )}
          {quest.difficulty === "Tough" && (
            <span className="shrink-0 h-0 w-0" style={{ borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderBottom:"11px solid #D44A08" }} />
          )}
          <span>{quest.difficulty}</span>
          <span className="text-[#C5C1BB]">·</span>
          <span>{quest.duration}</span>
          <span className="text-[#C5C1BB]">·</span>
          <span>{quest.distance}</span>
          <span className="text-[#C5C1BB]">·</span>
          <span>{quest.accessibility}</span>
        </div>

        {isFeatured && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/quest/${quest.id}`); }}
            className="mt-4 flex h-13 w-full items-center justify-center rounded-[14px] bg-[#15A963] text-[16px] font-bold text-white"
          >
            Explore
          </button>
        )}
      </div>
    </article>
  );
}
