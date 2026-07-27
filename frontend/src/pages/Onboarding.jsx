import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import onboardingMap from "../assets/onboarding-map.svg";
import onboardingQuest from "../assets/onboarding-quest.svg";
import onboardingPassport from "../assets/onboarding-passport.svg";
import { LanguageContext } from "../context/LanguageContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const trackRef = useRef(null);

  const slides = useMemo(
    () => [
      {
        image: onboardingMap,
        eyebrow: "WAYO",
        title: t("onboarding.slide1Title", "Discover your city, one quest at a time"),
        // Figma calls for this exact 3-line break on mobile — too fragile to
        // leave to natural wrapping (font metrics/viewport width can easily
        // collapse it to 2 lines), so it's spelled out explicitly and only
        // used below the md breakpoint. Desktop still wraps `title` naturally.
        mobileTitleLines: [
          t("onboarding.slide1TitleLine1", "Discover your"),
          t("onboarding.slide1TitleLine2", "city, one quest"),
          t("onboarding.slide1TitleLine3", "at a time"),
        ],
        description: t(
          "onboarding.slide1Description",
          "Turn everyday walks into playful adventures with quests tailored to where you are."
        ),
        button: t("onboarding.slide1Button", "Get started"),
      },
      {
        image: onboardingQuest,
        eyebrow: "",
        title: t("onboarding.slide2Title", "Complete quests, collect badges"),
        description: t(
          "onboarding.slide2Description",
          "Finish each quest's small tasks and earn a unique badge for every place you discover."
        ),
        button: t("onboarding.slide2Button", "Continue"),
      },
      {
        image: onboardingPassport,
        eyebrow: "",
        title: t("onboarding.slide3Title", "Build your city passport"),
        description: t(
          "onboarding.slide3Description",
          "Collect badges, grow your passport, and keep track of the places you've explored."
        ),
        button: t("onboarding.slide3Button", "Start exploring"),
      },
    ],
    [t]
  );

  const isLastSlide = currentSlide === slides.length - 1;

  function goTo(next) {
    if (animating || next === currentSlide) return;
    setAnimating(true);

    const track = trackRef.current;
    // Percentage of the track's own width, not a pixel value measured from
    // offsetWidth — that measurement can be stale or momentarily 0 while a
    // real phone's viewport height is still settling (e.g. Safari's toolbar
    // showing/hiding), which silently froze the slide on real devices.
    const stepPct = 100 / slides.length;

    track.style.transition = "none";
    track.style.transform = `translateX(${-currentSlide * stepPct}%)`;

    track.getBoundingClientRect();

    track.style.transition = "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)";
    track.style.transform = `translateX(${-next * stepPct}%)`;

    setTimeout(() => {
      setCurrentSlide(next);
      setAnimating(false);
      track.style.transition = "none";
      track.style.transform = `translateX(${-next * stepPct}%)`;
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
    <main className="relative h-full w-full overflow-y-auto bg-[#F8F7F4]">
      {/* One deliberate layout, top to bottom. Every gap below is a small,
          fixed value — no flex-1 spacer, no justify-between, no mt-auto, no
          vh-based push-down margin. The ONE thing that responds to viewport
          height is the illustration's own size (immediately below): on a
          short real Safari viewport it shrinks so the CTA stays reachable
          with at most a small scroll; on a tall viewport it's simply
          allowed to be a bit bigger, instead of leaving dead space at the
          bottom. That's a deliberate, singular lever — not a per-gap patch. */}
      <div className="mx-auto flex w-full min-h-full max-w-[430px] flex-col justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:min-h-0 md:justify-start md:pb-0">
        {/* Skip — a normal row, not an absolutely-positioned overlay */}
        <div className="flex justify-end px-5.5 pt-5 md:px-5">
          <button
            type="button"
            onClick={() => navigate("/explore", { replace: true })}
            className="text-[17px] font-semibold text-[#6F6C66] md:text-[16px]"
          >
            {t("onboarding.skip", "Skip")}
          </button>
        </div>

        {/* Sliding track — sized by its content (the tallest slide), not
            stretched to fill the page. Only its width participates in the
            horizontal swipe/translateX animation. */}
        <div className="mt-8 overflow-hidden md:mt-10">
          <div
            ref={trackRef}
            className="flex"
            style={{ width: `${slides.length * 100}%`, transform: "translateX(0%)" }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="flex flex-col items-center px-5.5 text-center md:px-5"
                style={{ width: `${100 / slides.length}%` }}
              >
                {/* Fixed-aspect box, same ratio on every slide so there's
                    never a vertical jump when swiping. Width is whichever
                    is smaller of "86% of the content width" (desktop-style
                    proportion) or a viewport-height-based cap — so it's
                    naturally capped on short screens without a separate
                    media query or JS. The md: cap uses plain vh (fine on
                    desktop — no mobile-Safari toolbar to worry about) so
                    the desktop mockup preview also shrinks the illustration
                    instead of overflowing when the actual browser window is
                    shorter than the mockup's natural ~812px reference
                    height. The vh term is affine (100vh - 511px), not a
                    flat percentage: at 800px+ windows it stays at/above the
                    86% cap (so normal windows keep the Figma proportions
                    untouched), but it falls off steeply below that, so even
                    quite short real browser windows (~650px) still shrink
                    enough to keep the CTA on-screen. The 140px floor stops
                    it collapsing further on extreme cases — a small scroll
                    is the fallback there, not a broken/negative size. */}
                <div className="flex aspect-[367/392] w-[min(86%,40svh)] items-center justify-center md:w-[min(86%,340px,max(140px,calc(100vh_-_550px)))]">
                  <img src={slide.image} alt="" className="max-h-full max-w-full object-contain" draggable="false" />
                </div>
                <div className="mt-6 flex flex-col items-center md:mt-5">
                  {/* Always rendered (hidden when a slide has no eyebrow) so
                      every slide reserves the same vertical footprint —
                      otherwise slides without "WAYO" render their title
                      higher, leaving an inconsistent, larger body→dots gap
                      on those slides since the row is stretched to match
                      the tallest (eyebrow-having) slide. */}
                  <p
                    className={[
                      "mb-3.5 text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#15A963] md:text-[12px]",
                      slide.eyebrow ? "" : "invisible",
                    ].join(" ")}
                  >
                    {slide.eyebrow || "WAYO"}
                  </p>
                  {slide.mobileTitleLines ? (
                    <>
                      <h1 className="max-w-none text-[34px] font-extrabold leading-[1.1] text-[#303030] md:hidden">
                        {slide.mobileTitleLines.map((line, li) => (
                          <span key={li} className="block">{line}</span>
                        ))}
                      </h1>
                      <h1 className="hidden max-w-75 text-[28px] font-extrabold leading-[1.15] text-[#303030] md:block">
                        {slide.title}
                      </h1>
                    </>
                  ) : (
                    <h1 className="max-w-80 text-[34px] font-extrabold leading-[1.1] text-[#303030] md:max-w-75 md:text-[28px] md:leading-[1.15]">
                      {slide.title}
                    </h1>
                  )}
                  <p className="mt-5.5 max-w-80 text-[18px] font-medium leading-[1.4] text-[#706D68] md:mt-5 md:max-w-75 md:text-[15px] md:leading-[1.55]">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="mt-4.5 flex items-center justify-center gap-2 md:mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${t("onboarding.slideAriaLabel", "Slide")} ${index + 1}`}
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

        {/* Button — a small, fixed gap above it. Bottom safe-area spacing is
            handled by the wrapper's own padding-bottom above, not by this
            button's own margin or by absolute/fixed positioning. */}
        <button
          type="button"
          onClick={handleNext}
          className="mx-5.5 mt-7 flex h-15 items-center justify-center rounded-2xl bg-[#15A963] text-[18px] font-bold tracking-[0.03em] text-white md:mx-5 md:mt-10 md:h-15 md:text-[17px]"
        >
          {slides[currentSlide].button}
          <span className="ml-3 text-[24px] leading-none md:text-[22px]">→</span>
        </button>
      </div>

      {/* Fake home indicator — desktop mockup preview only; a real phone
          already shows its own. */}
      <div className="absolute bottom-3 left-1/2 hidden h-1.25 w-33.5 -translate-x-1/2 rounded-full bg-black/20 md:block" />
    </main>
  );
}
