import { useContext, useEffect } from "react";
import { LanguageContext } from "../context/LanguageContext";

function HeartIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#15A963">
      <path d="M20.8 4.6c-2-1.8-5-1.5-6.8.5L12 7.3 10 5.1c-1.8-2-4.9-2.3-6.8-.5-2.2 2-2.3 5.4-.2 7.5l9 8.3 9-8.3c2.1-2.1 2-5.5-.2-7.5Z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="h-3.25 w-3.25" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="#8A857D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const AUTO_DISMISS_MS = 2800;

// One shared toast/snackbar, rendered once at the Shell level (see App.jsx)
// so every page that can trigger a save (Explore cards, Quest Detail) shows
// the same notification instead of each page owning its own copy.
export default function Toast({ toast, onDismiss }) {
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timeoutId);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-5.5 md:px-5"
      style={{ bottom: 112 }}
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-white py-3 pl-4.5 pr-3.5 shadow-[0_8px_24px_rgba(47,47,47,0.16)]">
        <HeartIcon />
        <span className="text-[15px] font-medium text-[#2F2F2F] md:text-[14px]">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common.dismissNotification", "Dismiss notification")}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
