import { NavLink } from "react-router";

function ExploreIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16.5 16.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PassportIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 17.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const items = [
  { to: "/explore",  label: "Explore",  Icon: ExploreIcon },
  { to: "/saved",    label: "Saved",    Icon: HeartIcon },
  { to: "/passport", label: "Passport", Icon: PassportIcon },
  { to: "/profile",  label: "Profile",  Icon: ProfileIcon },
];

export default function BottomNav() {
  return (
    <div className="shrink-0 px-4 pb-4 pt-2 bg-transparent">
      <nav className="flex h-[70px] items-center justify-around rounded-full bg-white px-2 shadow-[0_8px_28px_rgba(47,47,47,0.13)]">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              ["flex min-w-[68px] flex-col items-center gap-[3px] text-[11px] font-medium",
                isActive ? "text-[#15A963]" : "text-[#8A857D]"].join(" ")
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
