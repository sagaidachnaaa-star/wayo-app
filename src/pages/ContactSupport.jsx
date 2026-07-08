import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#15A963" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="#15A963" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z"
        stroke="#15A963"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactSupport() {
  const navigate = useNavigate();

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">Contact support</h1>
      <p className="mt-1 text-[14px] text-[#8A857D]">Get help with app questions, account settings, or general feedback.</p>

      <div className="mt-5 space-y-3">
        <a
          href="mailto:support@wayoapp.com"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F5EF]">
            <MailIcon />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#2F2F2F]">Email us</p>
            <p className="text-[13px] text-[#8A857D]">support@wayoapp.com</p>
          </div>
        </a>

        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F5EF]">
            <ChatIcon />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#2F2F2F]">Support type</p>
            <p className="text-[13px] text-[#8A857D]">General app questions and feedback</p>
          </div>
        </div>
      </div>

      <p className="mt-5 text-[14px] leading-[1.5] text-[#8A857D]">
        For safety concerns about a specific route, please use "Report a problem" so the issue can be reviewed more clearly.
      </p>

      <button
        type="button"
        onClick={() => navigate("/profile/settings/report-problem")}
        className="mt-4 flex h-13.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F]"
      >
        Report a problem
      </button>
    </main>
  );
}
