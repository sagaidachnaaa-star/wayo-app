import { useNavigate } from "react-router";

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Back"
      className={["flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(47,47,47,0.08)]", className].join(" ")}
    >
      <BackIcon />
    </button>
  );
}
