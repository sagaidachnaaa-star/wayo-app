import { useContext, useMemo, useState } from "react";
import BackButton from "../components/BackButton";
import { LanguageContext } from "../context/LanguageContext";

function ChevronDown({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }}
    >
      <path d="m7 10 5 5 5-5" stroke="#8A857D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-[#E9E7E1] py-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 text-left">
        <span className="text-[15px] font-semibold text-[#2F2F2F]">{q}</span>
        <ChevronDown open={open} />
      </button>
      {open && <p className="mt-2 text-[14px] leading-normal text-[#8A857D]">{a}</p>}
    </div>
  );
}

export default function HelpSafety() {
  const { t } = useContext(LanguageContext);
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = useMemo(
    () => [
      {
        q: t("helpSafety.faq1Q", "Is it safe to walk these routes alone?"),
        a: t(
          "helpSafety.faq1A",
          "WAYO routes are designed for public, walkable areas, but users should stay aware of their surroundings, avoid isolated areas at night, and check route notes before starting."
        ),
      },
      {
        q: t("helpSafety.faq2Q", "What if I need to stop a quest halfway through?"),
        a: t(
          "helpSafety.faq2A",
          "You can exit a quest at any time. In future versions, progress can be saved so users can resume later."
        ),
      },
      {
        q: t("helpSafety.faq3Q", "Does the app work without an internet connection?"),
        a: t(
          "helpSafety.faq3A",
          "The app requires an internet connection for maps and quest content. Offline access could be added in future development."
        ),
      },
      {
        q: t("helpSafety.faq4Q", "How do I report an unsafe or blocked route?"),
        a: t(
          "helpSafety.faq4A",
          "Users can report a problem through the Help & Safety section. Reports can help keep routes accurate and safe."
        ),
      },
    ],
    [t]
  );

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">{t("helpSafety.title", "Help & safety")}</h1>
      <p className="mt-1 text-[14px] text-[#8A857D]">
        {t("helpSafety.subtitle", "Answers to common questions, and how we keep your walks safe.")}
      </p>

      <div className="mt-4">
        {faqs.map((item, i) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </main>
  );
}
