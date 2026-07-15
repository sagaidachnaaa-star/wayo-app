import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { quests } from "../data/quests";
import { questDetails } from "../data/questDetails";
import { saveCompletedQuest } from "../utils/questProgress";

export default function QuestComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quest = quests.find((q) => q.id === id);

  useEffect(() => {
    if (quest) saveCompletedQuest(quest.id);
  }, [quest]);

  if (!quest) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>Quest not found.</p>
      </main>
    );
  }

  const detail = questDetails[quest.id];
  const badgeImage = detail?.badge?.unlockedImage ?? detail?.badge?.image ?? quest.image;

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-[#F8F7F4] px-6 pb-8 pt-16 text-center text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <img src={badgeImage} alt={detail?.badge?.name ?? quest.title} className="h-56 w-auto" />

      <h1 className="mt-6 text-[26px] font-bold">Quest completed!</h1>
      <p className="mt-2 text-[15px] leading-[1.4] text-[#2F2F2F]">
        You did it! {quest.title} is now in your Passport.
      </p>

      <button
        type="button"
        onClick={() => navigate("/passport")}
        className="mt-8 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
      >
        View in Passport
      </button>

      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="mt-3 flex h-13.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F]"
      >
        Explore more quests
      </button>
    </main>
  );
}
