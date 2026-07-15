import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="m9 6 6 6-6 6" stroke="#B7B3AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsRow({ label, to, last }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={[
        "flex w-full items-center justify-between py-4 text-left text-[16px] text-[#2F2F2F]",
        last ? "" : "border-b border-[#E9E7E1]",
      ].join(" ")}
    >
      {label}
      <ChevronRight />
    </button>
  );
}

function SettingsSection({ title, items }) {
  return (
    <div className="mt-7">
      <h2 className="text-[19px] font-bold text-[#2F2F2F]">{title}</h2>
      <div className="mt-2">
        {items.map((item, i) => (
          <SettingsRow key={item.label} label={item.label} to={item.to} last={i === items.length - 1} />
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />

      <SettingsSection
        title="App settings"
        items={[
          { label: "Notifications", to: "/profile/settings/notifications" },
          { label: "Location permissions", to: "/profile/settings/location" },
        ]}
      />
      <SettingsSection
        title="Support"
        items={[
          { label: "Help & safety", to: "/profile/settings/help-safety" },
          { label: "Report a problem", to: "/profile/settings/report-problem" },
          { label: "Contact support", to: "/profile/settings/contact-support" },
        ]}
      />
      <SettingsSection
        title="Legal"
        items={[
          { label: "Privacy Policy", to: "/profile/settings/privacy-policy" },
          { label: "Terms of Service", to: "/profile/settings/terms-of-service" },
        ]}
      />
    </main>
  );
}
