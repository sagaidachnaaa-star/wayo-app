import { useState } from "react";
import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";

const reasons = ["Route or directions issue", "Incorrect quest info", "Safety concern", "App bug", "Something else"];

export default function ReportProblem() {
  const navigate = useNavigate();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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
          <h1 className="mt-5 text-[20px] font-bold">Report submitted</h1>
          <p className="mt-2 text-[14px] leading-[1.5] text-[#8A857D]">
            Thanks — your feedback helps improve WAYO routes.
          </p>

          <button
            type="button"
            onClick={() => navigate("/profile/settings/help-safety")}
            className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
          >
            Back to Help & Safety
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">Report a problem</h1>
      <p className="mt-1 text-[14px] text-[#8A857D]">Tell us what went wrong so the route can be reviewed.</p>

      <form onSubmit={handleSubmit} className="mt-5">
        <p className="text-[13px] font-semibold text-[#2F2F2F]">What's this about?</p>
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
              {r}
            </button>
          ))}
        </div>

        <p className="mt-5 text-[13px] font-semibold text-[#2F2F2F]">Details</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="What happened? Include the quest name if relevant."
          rows={5}
          className="mt-2 w-full rounded-2xl bg-white p-4 text-[14px] text-[#2F2F2F] shadow-[0_4px_16px_rgba(47,47,47,0.06)] outline-none placeholder:text-[#A7A39D]"
        />

        <button
          type="submit"
          className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
        >
          Submit report
        </button>
      </form>
    </main>
  );
}
