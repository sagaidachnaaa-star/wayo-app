import { useContext, useMemo } from "react";
import BackButton from "../components/BackButton";
import { LanguageContext } from "../context/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useContext(LanguageContext);

  const intro = t(
    "privacyPolicy.intro",
    "This Privacy Policy explains how WAYO would handle user information in the full version of the app. The current MVP is a front-end prototype and does not store personal data on a backend server."
  );

  const sections = useMemo(
    () => [
      {
        title: t("privacyPolicy.section1Title", "Information we may collect"),
        body: t(
          "privacyPolicy.section1Body",
          "In a full version of WAYO, we may collect information provided by the user, such as name, interests, saved quests, and accessibility preferences. If location access is allowed, the app may use location while a quest is active to show nearby quests, centre the map, and support route progress."
        ),
      },
      {
        title: t("privacyPolicy.section2Title", "How we use information"),
        body: t(
          "privacyPolicy.section2Body",
          "User information would be used to personalise quest recommendations, show saved quests, track Passport progress, and improve route quality. WAYO would not sell personal information to third parties."
        ),
      },
      {
        title: t("privacyPolicy.section3Title", "Location data"),
        body: t(
          "privacyPolicy.section3Body",
          "Location would only be used while the app is open or while a quest is active. It would support map positioning, route progress, and distance estimation. Users can turn location access off at any time in their device or browser settings."
        ),
      },
      {
        title: t("privacyPolicy.section4Title", "Data retention"),
        body: t(
          "privacyPolicy.section4Body",
          "In a future full-stack version, user data would only be kept for as long as needed to provide the app features. Users would be able to request deletion of their data through Contact support."
        ),
      },
      {
        title: t("privacyPolicy.section5Title", "Your rights"),
        body: t(
          "privacyPolicy.section5Body",
          "Users would be able to request access, correction, or deletion of their personal data. These requests could be made through the Contact support screen."
        ),
      },
    ],
    [t]
  );

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">{t("privacyPolicy.title", "Privacy Policy")}</h1>
      <p className="mt-1 text-[13px] text-[#8A857D]">{t("privacyPolicy.lastUpdated", "Last updated: July 2026")}</p>
      <p className="mt-4 text-[14px] leading-normal text-[#2F2F2F]">{intro}</p>

      <div className="mt-5 space-y-5">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-[16px] font-bold text-[#2F2F2F]">{s.title}</h2>
            <p className="mt-1.5 text-[14px] leading-normal text-[#8A857D]">{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
