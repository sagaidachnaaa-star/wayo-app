export default function IPhoneStatusBar() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-50 h-[58px] w-full bg-[#F8F7F4]">
      {/* Time */}
      <div className="absolute left-[36px] top-[17px] text-[17px] font-semibold leading-none text-black">
        9:41
      </div>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-[10px] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />

      {/* Right icons */}
      <div className="absolute right-[28px] top-[16px] flex items-center gap-[8px]">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <div className="flex h-[16px] items-end gap-[2px]" aria-hidden="true">
      <span className="h-[5px] w-[3px] rounded-sm bg-black" />
      <span className="h-[8px] w-[3px] rounded-sm bg-black" />
      <span className="h-[11px] w-[3px] rounded-sm bg-black" />
      <span className="h-[14px] w-[3px] rounded-sm bg-black" />
    </div>
  );
}

function WifiIcon() {
  return (
    <svg
      width="19"
      height="14"
      viewBox="0 0 19 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.5 4.4C5.9 0.9 13.1 0.9 17.5 4.4"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.8 7.5C7.4 5.5 11.6 5.5 14.2 7.5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.3 10.6C9 10.1 10 10.1 10.7 10.6"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      width="28"
      height="14"
      viewBox="0 0 28 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1.5"
        width="22"
        height="11"
        rx="3"
        stroke="black"
        strokeWidth="1.6"
      />
      <path
        d="M25 5V9"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="4" y="4.5" width="16" height="5" rx="1.5" fill="black" />
    </svg>
  );
}