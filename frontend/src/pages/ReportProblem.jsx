import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";
import { LanguageContext } from "../context/LanguageContext";
import { reportReasonKeyMap, translateLabel } from "../i18n/labelKeys";

const reasons = ["Route or directions issue", "Incorrect quest info", "Safety concern", "App bug", "Something else"];

export default function ReportProblem() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_type: reason, details }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then(() => setSubmitted(true))
      .catch((err) => setError(err.message || "Something went wrong submitting your report."))
      .finally(() => setIsSubmitting(false));
  }

  if (submitted) {
    return (
      <main className="flex h-full flex-col bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F]">
        <BackButton className="mt-2" />
        <div className="mt-24 flex flex-1 flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F5EF]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#15A963" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-[20px] font-bold">{t("reportProblem.submittedTitle", "Report submitted")}</h1>
          <p className="mt-2 text-[14px] leading-normall text-[#8A857D]">
            {t("reportProblem.submittedMessage", "Thanks — your feedback helps improve WAYO routes.")}
          </p>

          <button
            type="button"
            onClick={() => navigate("/profile/settings/help-safety")}
            className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
          >
            {t("reportProblem.backToHelpSafety", "Back to Help & Safety")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">{t("reportProblem.title", "Report a problem")}</h1>
      <p className="mt-1 text-[14px] text-[#8A857D]">{t("reportProblem.subtitle", "Tell us what went wrong so the route can be reviewed.")}</p>

      <form onSubmit={handleSubmit} className="mt-5">
        <p className="text-[13px] font-semibold text-[#2F2F2F]">{t("reportProblem.whatsThisAbout", "What's this about?")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={[
                "flex h-10 items-center rounded-full border px-3.5 text-[13px] font-medium",
                reason === r ? "border-[#15A963] bg-[#E7F5EF] text-[#2F2F2F]" : "border-[#E5E3DC] bg-white text-[#2F2F2F]",
              ].join(" ")}
            >
              {translateLabel(t, reportReasonKeyMap, r)}
            </button>
          ))}
        </div>

        <p className="mt-5 text-[13px] font-semibold text-[#2F2F2F]">{t("reportProblem.detailsLabel", "Details")}</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={t("reportProblem.detailsPlaceholder", "What happened? Include the quest name if relevant.")}
          rows={5}
          className="mt-2 w-full rounded-2xl bg-white p-4 text-[14px] text-[#2F2F2F] shadow-[0_4px_16px_rgba(47,47,47,0.06)] outline-none placeholder:text-[#A7A39D]"
        />

        {error && (
          <p className="mt-4 text-[13px] text-[#D44A08]">{t("reportProblem.submitError", "Couldn't submit your report.")} {error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || details.trim() === ""}
          className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white disabled:opacity-50"
        >
          {isSubmitting ? t("reportProblem.submitting", "Submitting…") : t("reportProblem.submitButton", "Submit report")}
        </button>
      </form>
    </main>
  );
}
