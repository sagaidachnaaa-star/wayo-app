import { useState } from "react";
import { useNavigate } from "react-router";
import avatar from "../assets/Avatar.png";
import settingsIcon from "../assets/SettingsIcon.png";

function Chip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-11 items-center rounded-full border px-4 text-[14px] font-medium",
        active ? "border-[#15A963] bg-[#E7F5EF] text-[#2F2F2F]" : "border-[#E5E3DC] bg-white text-[#2F2F2F]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const interestOptions = [
  "Street Art",
  "Hidden History",
  "Riverside",
  "Parks & Gardens",
  "Architecture",
  "Photo Spots",
  "Cafés Nearby",
];
const accessibilityOptions = ["Step-free", "Pram Friendly", "Fully Paved"];

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function Profile() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [accessibility, setAccessibility] = useState(["Step-free"]);

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-start justify-between pt-2">
        <img src={avatar} alt="Profile avatar" className="h-28 w-28 rounded-full object-cover" />
        <button
          type="button"
          onClick={() => navigate("/profile/settings")}
          aria-label="Settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(47,47,47,0.08)]"
        >
          <img src={settingsIcon} alt="" className="h-5 w-5" />
        </button>
      </div>

      <h1 className="mt-4 text-[26px] font-bold leading-tight">Irena Sahajdaczna</h1>
      <p className="mt-1 text-[15px] text-[#8A857D]">London, UK</p>

      <h2 className="mt-6 text-[18px] font-bold">Interests</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {interestOptions.map((i) => (
          <Chip key={i} active={interests.includes(i)} onClick={() => setInterests((prev) => toggle(prev, i))}>
            {i}
          </Chip>
        ))}
      </div>

      <h2 className="mt-6 text-[18px] font-bold">Accessibility preferences</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {accessibilityOptions.map((o) => (
          <Chip key={o} active={accessibility.includes(o)} onClick={() => setAccessibility((prev) => toggle(prev, o))}>
            {o}
          </Chip>
        ))}
      </div>
    </main>
  );
}
