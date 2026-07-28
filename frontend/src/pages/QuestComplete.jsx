import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { quests } from "../data/quests";
import { questDetails } from "../data/questDetails";
import { saveCompletedQuest } from "../utils/questProgress";
import { API_BASE_URL } from "../config/api";
import { LanguageContext } from "../context/LanguageContext";

// Real per-quest badge art in public/assets — same mapping Passport uses,
// since questDetails only has unlocked artwork for 2 of the 5 quests.
const badgeImageOverrides = {
  "greenwich-stroll": "/assets/GreenwichStrollReward.png",
  "kyoto-garden-escape": "/assets/badge1.png",
  "thames-time-trail": "/assets/thames-trail-badge.png",
  "quiet-corners-southbank": "/assets/Southbank-badge.png",
  "green-escape-city": "/assets/GreenEscapeintheCity.png",
};

export default function QuestComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const quest = quests.find((q) => q.id === id);

  useEffect(() => {
    if (!quest) return;
    // Kept as a fallback record — MySQL (via the POST below) is now the
    // real source of truth for Passport, not this localStorage entry.
    saveCompletedQuest(quest.id);

    fetch(`${API_BASE_URL}/api/completed/${quest.id}`, { method: "POST" }).catch(() => {
      console.error("Failed to sync quest completion with the backend");
    });
  }, [quest]);

  if (!quest) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>{t("quest.notFound", "Quest not found.")}</p>
      </main>
    );
  }

  const detail = questDetails[quest.id];
  const badgeImage =
    badgeImageOverrides[quest.id] ?? detail?.badge?.unlockedImage ?? detail?.badge?.image ?? quest.image;

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-[#F8F7F4] px-6.5 pb-8 pt-16 text-center text-[#2F2F2F] [&::-webkit-scrollbar]:hidden md:px-6">
      <img src={badgeImage} alt={detail?.badge?.name ?? quest.title} className="h-60 w-auto md:h-56" />

      <h1 className="mt-6 text-[28px] font-bold md:text-[26px]">{t("questComplete.title", "Quest completed!")}</h1>
      <p className="mt-2 text-[16px] leading-[1.4] text-[#2F2F2F] md:text-[15px]">
        {t("questComplete.body", "You did it!")} {quest.title} {t("questComplete.bodySuffix", "is now in your Passport.")}
      </p>

      <button
        type="button"
        onClick={() => navigate("/passport")}
        className="mt-8 flex h-14.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-bold text-white md:h-13.5 md:text-[16px]"
      >
        {t("questComplete.viewInPassport", "View in Passport")}
      </button>

      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="mt-3 flex h-14.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[17px] font-semibold text-[#2F2F2F] md:h-13.5 md:text-[16px]"
      >
        {t("questComplete.exploreMore", "Explore more quests")}
      </button>
    </main>
  );
}
