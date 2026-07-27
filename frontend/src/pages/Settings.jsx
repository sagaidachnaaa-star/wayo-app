import { useContext } from "react";
import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";
import { LanguageContext } from "../context/LanguageContext";

function ChevronRight() {
  return (
    <svg className="h-4.5 w-4.5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none">
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
        "flex w-full items-center justify-between py-4.5 text-left text-[17px] text-[#2F2F2F] md:py-4 md:text-[16px]",
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
      <h2 className="text-[20px] font-bold text-[#2F2F2F] md:text-[19px]">{title}</h2>
      <div className="mt-2">
        {items.map((item, i) => (
          <SettingsRow key={item.label} label={item.label} to={item.to} last={i === items.length - 1} />
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const { t } = useContext(LanguageContext);

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5.5 pb-6 [&::-webkit-scrollbar]:hidden md:px-5">
      <BackButton className="mt-2" />

      <SettingsSection
        title={t("settings.appSettings", "App settings")}
        items={[
          { label: t("settings.notifications", "Notifications"), to: "/profile/settings/notifications" },
          { label: t("settings.locationPermissions", "Location permissions"), to: "/profile/settings/location" },
        ]}
      />
      <SettingsSection
        title={t("settings.support", "Support")}
        items={[
          { label: t("settings.helpSafety", "Help & safety"), to: "/profile/settings/help-safety" },
          { label: t("settings.reportProblem", "Report a problem"), to: "/profile/settings/report-problem" },
          { label: t("settings.contactSupport", "Contact support"), to: "/profile/settings/contact-support" },
        ]}
      />
      <SettingsSection
        title={t("settings.legal", "Legal")}
        items={[
          { label: t("settings.privacyPolicy", "Privacy Policy"), to: "/profile/settings/privacy-policy" },
          { label: t("settings.termsOfService", "Terms of Service"), to: "/profile/settings/terms-of-service" },
        ]}
      />
    </main>
  );
}
