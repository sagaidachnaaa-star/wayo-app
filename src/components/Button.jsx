function Button({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={[
        "flex h-13.5 w-full items-center justify-center rounded-2xl bg-[#15A963] text-[16px] font-semibold text-white transition active:scale-[0.98]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button; 