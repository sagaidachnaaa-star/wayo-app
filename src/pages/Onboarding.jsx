import { useState, useRef } from "react";
import { useNavigate } from "react-router";

import onboardingMap from "../assets/onboarding-map.svg";
import onboardingQuest from "../assets/onboarding-quest.svg";
import onboardingPassport from "../assets/onboarding-passport.svg";

const slides = [
  {
    image: onboardingMap,
    eyebrow: "WAYO",
    title: "Discover your city, one quest at a time",
    description: "Turn everyday walks into playful adventures with quests tailored to where you are.",
    button: "Get started",
  },
  {
    image: onboardingQuest,
    eyebrow: "",
    title: "Complete quests, collect badges",
    description: "Finish each quest's small tasks and earn a unique badge for every place you discover.",
    button: "Continue",
  },
  {
    image: onboardingPassport,
    eyebrow: "",
    title: "Build your city passport",
    description: "Collect badges, grow your passport, and keep track of the places you've explored.",
    button: "Start exploring",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const trackRef = useRef(null);

  const isLastSlide = currentSlide === slides.length - 1;

  function goTo(next) {
    if (animating || next === currentSlide) return;
    setAnimating(true);

    const track = trackRef.current;
    // кожен слайд = 100% ширини контейнера
    // трек = slides.length * 100% контейнера
    // тому offset = -(next * containerWidth) в пікселях
    const containerWidth = track.parentElement.offsetWidth;

    // спочатку — без анімації ставимо поточну позицію
    track.style.transition = "none";
    track.style.transform = `translateX(${-currentSlide * containerWidth}px)`;

    // форс reflow
    track.getBoundingClientRect();

    // потім — з анімацією рухаємось до наступного
    track.style.transition = "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)";
    track.style.transform = `translateX(${-next * containerWidth}px)`;

    setTimeout(() => {
      setCurrentSlide(next);
      setAnimating(false);
      track.style.transition = "none";
      track.style.transform = `translateX(${-next * containerWidth}px)`;
    }, 420);
  }

  function handleNext() {
    if (isLastSlide) {
      navigate("/explore", { replace: true });
    } else {
      goTo(currentSlide + 1);
    }
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-[#F8F7F4]">
      {/* Skip */}
      <button
        type="button"
        onClick={() => navigate("/explore", { replace: true })}
        className="absolute right-5 top-4 z-20 text-[16px] font-semibold text-[#6F6C66]"
      >
        Skip
      </button>

      {/* Sliding track */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${slides.length * 100}%`, transform: "translateX(0px)" }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="flex h-full flex-col items-center px-5 text-center"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="mt-10 flex h-[240px] w-full items-center justify-center">
                <img src={slide.image} alt="" className="max-h-full w-full object-contain" draggable="false" />
              </div>
              <div className="mt-5 flex flex-col items-center">
                {slide.eyebrow && (
                  <p className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#15A963]">
                    {slide.eyebrow}
                  </p>
                )}
                <h1 className="max-w-[300px] text-[28px] font-extrabold leading-[1.15] text-[#303030]">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-[300px] text-[15px] font-medium leading-[1.55] text-[#706D68]">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Slide ${index + 1}`}
            style={{
              height: 10,
              width: currentSlide === index ? 32 : 10,
              borderRadius: 999,
              background: currentSlide === index ? "#15A963" : "#D8D5CF",
              transition: "width 420ms cubic-bezier(0.4,0,0.2,1), background 420ms ease",
            }}
          />
        ))}
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={handleNext}
        className="mx-5 mb-8 flex h-[60px] w-[calc(100%-40px)] items-center justify-center rounded-[16px] bg-[#15A963] text-[17px] font-bold tracking-[0.03em] text-white"
      >
        {slides[currentSlide].button}
        <span className="ml-3 text-[22px] leading-none">→</span>
      </button>

      <div className="absolute bottom-[12px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black/20" />
    </main>
  );
}
