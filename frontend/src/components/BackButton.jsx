import { useContext } from "react";
import { useNavigate } from "react-router";
import { LanguageContext } from "../context/LanguageContext";

function BackIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label={t("common.back", "Back")}
      className={["flex h-11.75 w-11.75 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(47,47,47,0.08)] md:h-11 md:w-11", className].join(" ")}
    >
      <BackIcon />
    </button>
  );
}
