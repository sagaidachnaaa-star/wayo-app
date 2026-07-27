import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { quests } from "../data/quests";
import { questDetails } from "../data/questDetails";
import { getActiveQuestProgress, saveActiveQuestProgress, clearActiveQuestProgress, saveCompletedQuest } from "../utils/questProgress";
import { LanguageContext } from "../context/LanguageContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
function BackArrowIcon() {
  return (
    <svg className="h-5.5 w-5.5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg className="h-4.25 w-4.25 md:h-4 md:w-4" viewBox="0 0 24 24" fill="#2F2F2F">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg className="h-4.25 w-4.25 md:h-4 md:w-4" viewBox="0 0 24 24" fill="#2F2F2F">
      <path d="M7 5v14l12-7Z" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg className="h-4.25 w-4.25 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none">
      <path d="M6 4h12v16l-6-4-6 4Z" stroke="#2F2F2F" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg className="h-4.25 w-4.25 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="#15A963" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function QrIcon() {
  return (
    <svg className="h-10.5 w-10.5 md:h-10 md:w-10" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="#8A857D" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="#8A857D" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="#8A857D" strokeWidth="1.6" />
      <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="#8A857D" />
    </svg>
  );
}

// ── Custom Leaflet markers — plain divIcons, no default-icon asset issues ───
// state is one of "completed" | "current" | "upcoming".
function stopIcon(number, state) {
  const size = state === "current" ? 34 : 28;
  const background = state === "completed" ? "#0E7C46" : state === "current" ? "#15A963" : "#CDE8D4";
  const textColor = state === "upcoming" ? "#15A963" : "white";
  const border = state === "current" ? "3px solid white" : "2px solid white";
  const inner =
    state === "completed"
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<span style="font-weight:700;font-size:${state === "current" ? 14 : 12}px;">${number}</span>`;
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${background};color:${textColor};border:${border};box-shadow:0 2px 6px rgba(0,0,0,0.25);">${inner}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
function flagIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#15A963;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="white" stroke-width="2.2" stroke-linecap="round"/><path d="M5 5c2-1.5 4-1.5 6 0s4 1.5 6 0v9c-2 1.5-4 1.5-6 0s-4-1.5-6 0V5Z" fill="white"/></svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}
function finishIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#2F2F2F;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// Fits the map to show the whole route once, on load.
function FitRouteBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48] });
    // Only fit once, when the map first loads — not every time points changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

// Smoothly pans to the current stop whenever it changes (skips the very
// first render, since FitRouteBounds already frames the whole route then).
function FlyToCurrentStop({ point }) {
  const map = useMap();
  const hasFlownBefore = useRef(false);
  useEffect(() => {
    if (!hasFlownBefore.current) {
      hasFlownBefore.current = true;
      return;
    }
    if (point) map.flyTo([point.lat, point.lng], 16, { duration: 0.8 });
  }, [map, point]);
  return null;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// The app's status bar overlays the top of this page — keep controls below it.
const HEADER_TOP_OFFSET = 68;
// How much of the sheet's height is reserved for its "peek" (collapsed) state.
const COLLAPSED_VISIBLE_HEIGHT = 230;

export default function QuestActive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const quest = quests.find((q) => q.id === id);
  const detail = questDetails[quest?.id];

  // Fall back to a single made-up stop so the page never crashes if a quest
  // has no route data yet.
  const fallbackPoint = quest ? { title: quest.title, lat: quest.coordinates.lat, lng: quest.coordinates.lng } : null;
  const routeStart = detail?.route?.start ?? fallbackPoint;
  const routeStops = detail?.route?.stops?.length ? detail.route.stops : fallbackPoint ? [fallbackPoint] : [];
  const routeEnd = detail?.route?.end ?? fallbackPoint;
  const totalStops = routeStops.length;
  const allRoutePoints = [routeStart, ...routeStops, routeEnd].filter(Boolean);

  const saved = quest ? getActiveQuestProgress(quest.id) : null;
  const [currentStop, setCurrentStop] = useState(saved?.currentStopIndex ?? 1);
  const [secondsElapsed, setSecondsElapsed] = useState(saved?.secondsElapsed ?? 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Simple running timer — ticks once a second while not paused.
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // ── Draggable bottom sheet — 2 snap positions (collapsed / half-open) ───────
  const containerRef = useRef(null);
  const [sheetTop, setSheetTopState] = useState(null);
  const [dragging, setDragging] = useState(false);
  const sheetTopRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const dragMoved = useRef(false);

  // sheetTop is null until the user first drags or taps the handle — until
  // then the sheet just sits at its default open position, no measurement needed.
  function setSheetTop(px) {
    sheetTopRef.current = px;
    setSheetTopState(px);
  }
  function getSnapTops() {
    const h = containerRef.current?.clientHeight ?? 700;
    return { open: h * 0.45, collapsed: h - COLLAPSED_VISIBLE_HEIGHT };
  }
  function currentSheetTop() {
    return sheetTopRef.current ?? getSnapTops().open;
  }

  function handleHandlePointerDown(e) {
    draggingRef.current = true;
    setDragging(true);
    dragMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartTop.current = currentSheetTop();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function handleHandlePointerMove(e) {
    if (!draggingRef.current) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    const { open, collapsed } = getSnapTops();
    setSheetTop(Math.min(collapsed, Math.max(open, dragStartTop.current + delta)));
  }
  function handleHandlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const { open, collapsed } = getSnapTops();
    const current = currentSheetTop();

    if (!dragMoved.current) {
      // A plain tap on the handle toggles collapsed <-> open.
      const isCloserToOpen = Math.abs(current - open) < Math.abs(current - collapsed);
      setSheetTop(isCloserToOpen ? collapsed : open);
      return;
    }

    // Otherwise snap to whichever of the two positions is closest.
    setSheetTop(Math.abs(current - open) < Math.abs(current - collapsed) ? open : collapsed);
  }

  if (!quest) {
    return (
      <main className="flex h-full items-center justify-center bg-[#F8F7F4] px-6 text-center text-[#2F2F2F]">
        <p>{t("quest.notFound", "Quest not found.")}</p>
      </main>
    );
  }

  const percent = Math.round((currentStop / totalStops) * 100);
  const stopsLeft = totalStops - currentStop;
  const currentStopPoint = routeStops[currentStop - 1] ?? routeEnd;
  const currentStopName = currentStopPoint?.title ?? quest.title;
  const remainingKm = ((quest.routeKm ?? 0) * (stopsLeft / totalStops)).toFixed(1);
  const isLastStop = currentStop >= totalStops;

  // Route line split into what's already been walked (solid green) and
  // what's left to go (pale green), joined at the current stop.
  const completedPoints = [routeStart, ...routeStops.slice(0, currentStop - 1)].filter(Boolean);
  const remainingPoints = [...routeStops.slice(currentStop - 1), routeEnd].filter(Boolean);

  function getStopState(index) {
    if (index + 1 < currentStop) return "completed";
    if (index + 1 === currentStop) return "current";
    return "upcoming";
  }

  function handleContinue() {
    if (isLastStop) {
      setIsQrOpen(true);
    } else {
      setCurrentStop((s) => s + 1);
    }
  }

  function handleSimulateScan() {
    // QR scanning is simulated for the MVP and can be replaced with a real QR scanner later.
    saveCompletedQuest(quest.id);
    clearActiveQuestProgress(quest.id);
    navigate(`/quest/${quest.id}/complete`);
  }

  function handleSaveExit() {
    saveActiveQuestProgress(quest.id, {
      questId: quest.id,
      currentStopIndex: currentStop,
      secondsElapsed,
      savedAt: new Date().toISOString(),
    });
    navigate("/explore");
  }

  return (
    <main ref={containerRef} className="relative h-full overflow-hidden bg-[#F8F7F4]">
      {/* Real, interactive Leaflet map. z-0 keeps Leaflet's internal panes/
          controls (which use their own high z-index values) boxed inside
          this stacking context, so they can never render above the sheet
          or back button. */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[quest.coordinates.lat, quest.coordinates.lng]}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRouteBounds points={allRoutePoints} />
          <FlyToCurrentStop point={currentStopPoint} />

          {completedPoints.length > 1 && (
            <Polyline positions={completedPoints.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#15A963", weight: 4 }} />
          )}
          {remainingPoints.length > 1 && (
            <Polyline positions={remainingPoints.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#A9D9BB", weight: 4 }} />
          )}

          {routeStart && <Marker position={[routeStart.lat, routeStart.lng]} icon={flagIcon()} />}
          {routeStops.map((stop, i) => (
            <Marker key={stop.title} position={[stop.lat, stop.lng]} icon={stopIcon(i + 1, getStopState(i))} />
          ))}
          {routeEnd && <Marker position={[routeEnd.lat, routeEnd.lng]} icon={finishIcon()} />}
        </MapContainer>
      </div>

      {/* Back button, sitting below the app's status bar, above the map */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={t("common.back", "Back")}
        className="absolute left-6 z-40 flex h-11.75 w-11.75 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(47,47,47,0.15)] md:h-11 md:w-11"
        style={{ top: HEADER_TOP_OFFSET }}
      >
        <BackArrowIcon />
      </button>

      {/* Draggable bottom sheet */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-[36px] bg-white shadow-[0_-8px_28px_rgba(47,47,47,0.14)]"
        style={{ top: sheetTop ?? "45%", transition: dragging ? "none" : "top 260ms cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div
          role="button"
          aria-label={t("questActive.dragToResize", "Drag to resize")}
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
          className="flex shrink-0 touch-none cursor-grab justify-center pb-1 pt-2.5 active:cursor-grabbing"
        >
          <div className="h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
        </div>

        <div className="flex-1 overflow-y-auto px-5.5 pb-6 [&::-webkit-scrollbar]:hidden md:px-5">
          <h1 className="text-[24px] font-bold text-[#2F2F2F] md:text-[22px]">{quest.title}</h1>
          <p className="mt-1 text-[15px] text-[#2F2F2F] md:text-[14px]">
            {currentStop} {t("common.of", "of")} {totalStops} {t("questActive.stopsCompleted", "stops completed")}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#E5E3DC]">
              <div className="h-full rounded-full bg-[#15A963]" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[15px] font-semibold text-[#2F2F2F] md:text-[14px]">{percent}%</span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-4 flex h-15 w-full items-center justify-center gap-2 rounded-full bg-[#15A963] text-[17px] font-bold text-white md:h-14 md:text-[16px]"
          >
            <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white md:h-6 md:w-6">
              <ArrowRightIcon />
            </span>
            {isLastStop ? t("questActive.scanQrToComplete", "Scan QR code to complete") : t("questActive.continueToNextStop", "Continue to next stop")}
          </button>

          <p className="mt-3 text-center text-[13px] text-[#8A857D] md:text-[12px]">{t("questActive.noTimeLimit", "No time limit - complete at your own pace.")}</p>

          <p className="mt-6 text-[14px] font-semibold text-[#15A963] md:text-[13px]">{t("questActive.currentStop", "Current stop")}</p>
          <h2 className="text-[20px] font-bold text-[#2F2F2F] md:text-[19px]">{currentStopName}</h2>
          <p className="mt-1 text-[14px] leading-[1.4] text-[#8A857D] md:text-[13px]">
            {t("questActive.followRoute", "Follow the route and scan the QR code at the final stop to complete the quest.")}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[21px] font-bold text-[#2F2F2F] md:text-[20px]">{formatTime(secondsElapsed)}</p>
              <p className="text-[13px] text-[#8A857D] md:text-[12px]">{t("questActive.elapsed", "elapsed")}</p>
            </div>
            <div>
              <p className="text-[21px] font-bold text-[#2F2F2F] md:text-[20px]">
                {remainingKm} <span className="text-[14px] font-medium text-[#8A857D] md:text-[13px]">{t("common.km", "km")}</span>
              </p>
              <p className="text-[13px] text-[#8A857D] md:text-[12px]">{t("questActive.remaining", "remaining")}</p>
            </div>
            <div>
              <p className="text-[21px] font-bold text-[#2F2F2F] md:text-[20px]">{stopsLeft}</p>
              <p className="text-[13px] text-[#8A857D] md:text-[12px]">{t("questActive.stopsLeft", "stops left")}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="flex h-13.5 flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F] md:h-13 md:text-[15px]"
            >
              {isPaused ? <PlayIcon /> : <PauseIcon />}
              {isPaused ? t("questActive.resume", "Resume") : t("questActive.pause", "Pause")}
            </button>
            <button
              type="button"
              onClick={handleSaveExit}
              className="flex h-13.5 flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F] md:h-13 md:text-[15px]"
            >
              <BookmarkIcon />
              {t("questActive.saveExit", "Save & exit")}
            </button>
          </div>

          <div className="mt-6">
            <p className="text-[14px] font-semibold text-[#2F2F2F] md:text-[13px]">{t("questActive.allStops", "All stops")}</p>
            <div className="mt-2 space-y-2">
              {routeStops.map((stop, i) => {
                const state = getStopState(i);
                return (
                  <div key={stop.title} className="flex items-center gap-2.5 text-[15px] md:text-[14px]">
                    <span
                      className={[
                        "flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold md:h-6 md:w-6 md:text-[11px]",
                        state === "completed"
                          ? "bg-[#15A963] text-white"
                          : state === "current"
                            ? "border-2 border-[#15A963] text-[#15A963]"
                            : "bg-[#F0EEE9] text-[#8A857D]",
                      ].join(" ")}
                    >
                      {state === "completed" ? "✓" : i + 1}
                    </span>
                    <span className={state === "current" ? "font-semibold text-[#2F2F2F]" : "text-[#6F6A62]"}>{stop.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated QR scan modal — shown once the user reaches the final stop */}
      {isQrOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setIsQrOpen(false)}>
          <div className="w-full rounded-t-[28px] bg-white px-5.5 pb-6 pt-3 text-center md:px-5" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.25 w-11 rounded-full bg-[#D5D2CC]" />
            <h2 className="mt-4 text-[20px] font-bold text-[#2F2F2F] md:text-[19px]">{t("questActive.scanFinalQr", "Scan final QR code")}</h2>
            <p className="mt-1 text-[14px] text-[#8A857D] md:text-[13px]">{t("questActive.scanFinalQrDesc", "Scan the QR code at the final stop to unlock your badge.")}</p>

            {/* QR scanning is simulated for the MVP and can be replaced with a real QR scanner later. */}
            <div className="mx-auto mt-5 flex h-47 w-47 items-center justify-center rounded-2xl border-2 border-dashed border-[#D5D2CC] bg-[#F8F7F4] md:h-44 md:w-44">
              <QrIcon />
            </div>

            <button
              type="button"
              onClick={handleSimulateScan}
              className="mt-6 flex h-14.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[17px] font-bold text-white md:h-13.5 md:text-[16px]"
            >
              {t("questActive.simulateQrScan", "Simulate QR scan")}
            </button>
            <button
              type="button"
              onClick={() => setIsQrOpen(false)}
              className="mt-3 flex h-14.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F] md:h-13.5 md:text-[15px]"
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
