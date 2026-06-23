function Chip({ children, active = false, onClick, leftIcon, rightIcon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-[44px] shrink-0 items-center gap-2 rounded-full px-5 text-[14px] font-medium transition",
        active
          ? "bg-[#15A963] text-white"
          : "border border-[#EDECE6] bg-white text-[#2F2F2F]",
      ].join(" ")}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
}

export default Chip;