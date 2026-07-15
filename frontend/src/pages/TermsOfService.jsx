import BackButton from "../components/BackButton";

const sections = [
  {
    title: "Using WAYO",
    body: "WAYO provides self-guided walking quests. You're responsible for your own safety while completing a route, including following local traffic laws and weather conditions.",
  },
  {
    title: "Account",
    body: "You're responsible for keeping your account details accurate and secure. We may suspend accounts used to submit false reports or misuse the app.",
  },
  {
    title: "Content and routes",
    body: "Quest routes, badges, and descriptions are provided for guidance and may change over time. We aim for accuracy but can't guarantee every route detail is current.",
  },
  {
    title: "Limitation of liability",
    body: "WAYO is not liable for injury, loss, or damage arising from following a quest route. Walk at your own pace and judgement, and skip any stop that feels unsafe.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms occasionally. Continued use of the app after a change means you accept the updated terms.",
  },
];

export default function TermsOfService() {
  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">Terms of Service</h1>
      <p className="mt-1 text-[13px] text-[#8A857D]">Last updated: July 2026</p>

      <div className="mt-5 space-y-5">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-[16px] font-bold text-[#2F2F2F]">{s.title}</h2>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-[#8A857D]">{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
