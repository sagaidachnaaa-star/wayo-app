import { useContext } from "react";
import { NavLink } from "react-router";
import { LanguageContext } from "../context/LanguageContext";

function ExploreIcon() {
  return (
    <svg className="h-7 w-7 md:h-6.5 md:w-6.5" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16.5 16.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg className="h-7 w-7 md:h-6.5 md:w-6.5" viewBox="0 0 24 24" fill="none">
      <path d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PassportIcon() {
  return (
    <svg className="h-7 w-7 md:h-6.5 md:w-6.5" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 17.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg className="h-7 w-7 md:h-6.5 md:w-6.5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const items = [
  { to: "/explore",  key: "nav.explore",  fallback: "Explore",  Icon: ExploreIcon },
  { to: "/saved",    key: "nav.saved",    fallback: "Saved",    Icon: HeartIcon },
  { to: "/passport", key: "nav.passport", fallback: "Passport", Icon: PassportIcon },
  { to: "/profile",  key: "nav.profile",  fallback: "Profile",  Icon: ProfileIcon },
];

export default function BottomNav() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="shrink-0 px-4 pb-4 pt-2.5 md:pt-2 bg-transparent">
      <nav className="flex h-19 items-center justify-around rounded-full bg-white px-2 shadow-[0_8px_28px_rgba(47,47,47,0.13)] md:h-17.5">
        {items.map(({ to, key, fallback, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              ["flex min-w-18 flex-col items-center gap-1 text-[12px] font-medium md:min-w-17 md:gap-0.75 md:text-[11px]",
                isActive ? "text-[#15A963]" : "text-[#8A857D]"].join(" ")
            }
          >
            <Icon />
            <span>{t(key, fallback)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
