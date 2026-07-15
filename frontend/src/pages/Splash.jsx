import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { SplashOverlayContext } from "../context/SplashContext";

function PinIcon({ size = 85, color = "#15A963" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 85 85" fill="none" aria-hidden="true">
      <path
        d="M42.5 7C28.4 7 17 18.4 17 32.5C17 50.5 42.5 78 42.5 78C42.5 78 68 50.5 68 32.5C68 18.4 56.6 7 42.5 7Z"
        fill={color}
      />
      <circle cx="42.5" cy="32.5" r="10" fill="white" />
    </svg>
  );
}

export default function Splash() {
  const navigate = useNavigate();
  const { setGreenPhase } = useContext(SplashOverlayContext);
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 800);
    const t2 = setTimeout(() => {
      setPhase(3);
      setGreenPhase(true); // покриває весь телефон включно зі статус баром
    }, 1800);
    const t3 = setTimeout(() => {
      navigate("/onboarding", { replace: true });
      // невелика затримка перед прибиранням зеленого щоб онбординг встиг завантажитись
      setTimeout(() => setGreenPhase(false), 100);
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setGreenPhase(false);
    };
  }, [navigate, setGreenPhase]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#F8F7F4]">
      {/* Pin icon */}
      <div
        style={{
          transform: phase >= 2 ? "scaleX(-1)" : "scaleX(1)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: phase === 3 ? 0 : 1,
          transitionProperty: "transform, opacity",
        }}
      >
        <PinIcon size={85} color="#15A963" />
      </div>

      {/* Wayo label */}
      <span
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[15px] font-bold text-[#15A963]"
        style={{ opacity: phase === 3 ? 0 : 1, transition: "opacity 200ms ease" }}
      >
        Wayo
      </span>
    </div>
  );
}
