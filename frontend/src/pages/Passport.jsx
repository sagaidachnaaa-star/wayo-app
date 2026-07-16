import { useEffect, useMemo, useState } from "react";
import { questDetails } from "../data/questDetails";
import lockedBadge from "../assets/Locked.png";

const API_URL = "http://localhost:5050";
const city = "London";

// Real per-quest colour badge art already placed in public/assets — same
// mapping Quest Detail uses, so the two pages stay visually consistent.
const badgeImageOverrides = {
  "greenwich-stroll": "/assets/GreenwichStrollReward.png",
  "kyoto-garden-escape": "/assets/badge1.png",
  "thames-time-trail": "/assets/thames-trail-badge.png",
  "quiet-corners-southbank": "/assets/Southbank-badge.png",
  "green-escape-city": "/assets/GreenEscapeintheCity.png",
};

function FlagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 21V4" stroke="#15A963" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 5c2-1.5 4-1.5 6 0s4 1.5 6 0v9c-2 1.5-4 1.5-6 0s-4-1.5-6 0V5Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" stroke="#15A963" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.4" stroke="#15A963" strokeWidth="2" />
    </svg>
  );
}

function StatCard({ icon, label, value, total }) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F5EF]">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-medium text-[#2F2F2F]">{label}</p>
        <p className="mt-0.5 text-[26px] font-bold text-[#2F2F2F]">
          {value}<span className="text-[#B7B3AB]">/{total}</span>
        </p>
      </div>
    </div>
  );
}

// "Places discovered" is approximated as the number of stops across
// completed quests — there's no separate places dataset in this MVP.
// This still reads the local route data (unrelated to completion status).
function countStops(quest) {
  return questDetails[quest.id]?.route?.stops?.length ?? 0;
}

export default function Passport() {
  const [allQuests, setAllQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${API_URL}/api/quests`).then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      }),
      fetch(`${API_URL}/api/completed`).then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      }),
    ])
      .then(([questsData, completedData]) => {
        if (cancelled) return;
        setAllQuests(questsData);
        setCompletedQuests(completedData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Something went wrong loading your progress.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const completedById = useMemo(() => {
    const map = {};
    completedQuests.forEach((q) => {
      map[q.id] = q;
    });
    return map;
  }, [completedQuests]);

  const collected = allQuests.filter((q) => completedById[q.id]);
  const locked = allQuests.filter((q) => !completedById[q.id]);

  const placesDiscovered = collected.reduce((sum, q) => sum + countStops(q), 0);
  const totalPlaces = allQuests.reduce((sum, q) => sum + countStops(q), 0);
  const pct = totalPlaces > 0 ? Math.round((placesDiscovered / totalPlaces) * 100) : 0;

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>Loading your progress…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-3 bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p className="text-[14px] text-[#8A857D]">Couldn't load your progress. {error}</p>
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

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-4 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <h1 className="pt-2 text-[26px] font-bold">Personal Progress</h1>

      <div className="mt-4 flex gap-3">
        <StatCard icon={<FlagIcon />} label="Quests completed" value={collected.length} total={allQuests.length} />
        <StatCard icon={<LocationPinIcon />} label="Places discovered" value={placesDiscovered} total={totalPlaces} />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#2F2F2F]">
            {placesDiscovered}/{totalPlaces} places discovered in {city}
          </p>
          <p className="text-[14px] font-bold text-[#15A963]">{pct}%</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#E5E3DC]">
          <div className="h-full rounded-full bg-[#15A963]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 className="mt-6 text-[20px] font-bold">Collected</h2>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {collected.map((quest) => {
          const badgeImage =
            badgeImageOverrides[quest.id] ?? completedById[quest.id]?.badge_image_url ?? quest.image_url;
          return (
            <div key={quest.id} className="flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center">
                <img
                  src={badgeImage}
                  alt={quest.title}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = lockedBadge;
                  }}
                />
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-tight">{quest.title}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 text-[20px] font-bold">Locked</h2>
      <p className="mt-0.5 text-[13px] text-[#8A857D]">Complete more to unlock</p>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {locked.map((quest) => (
          <div key={quest.id} className="flex flex-col items-center text-center">
            <div className="flex h-32 w-32 items-center justify-center">
              <img src={lockedBadge} alt="Locked" className="h-full w-full object-contain" />
            </div>
            <p className="mt-2 text-[13px] font-medium leading-tight">{quest.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
