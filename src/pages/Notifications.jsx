import { useState } from "react";
import BackButton from "../components/BackButton";

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={["relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-[#15A963]" : "bg-[#D5D2CC]"].join(" ")}
    >
      <span
        className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  );
}

function NotificationRow({ title, description, checked, onChange, last }) {
  return (
    <div className={["flex items-center justify-between gap-4 py-4", last ? "" : "border-b border-[#E9E7E1]"].join(" ")}>
      <div>
        <p className="text-[16px] font-semibold text-[#2F2F2F]">{title}</p>
        <p className="mt-0.5 text-[13px] text-[#8A857D]">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Notifications() {
  const [prefs, setPrefs] = useState({ nearby: true, reminders: true, digest: false });

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">Notifications</h1>
      <p className="mt-1 text-[14px] text-[#8A857D]">Choose what you want to hear about.</p>

      <div className="mt-5">
        <NotificationRow
          title="New quests nearby"
          description="Get notified when a new quest launches near you."
          checked={prefs.nearby}
          onChange={() => toggle("nearby")}
        />
        <NotificationRow
          title="Quest reminders"
          description="A nudge if you leave a quest unfinished."
          checked={prefs.reminders}
          onChange={() => toggle("reminders")}
        />
        <NotificationRow
          title="Weekly digest"
          description="A weekly summary of your progress and new spots to explore."
          checked={prefs.digest}
          onChange={() => toggle("digest")}
          last
        />
      </div>
    </main>
  );
}
