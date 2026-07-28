import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router";
import BottomNav from "./components/BottomNav";
import Toast from "./components/Toast";
import { SplashOverlayContext } from "./context/SplashContext";
import { SavedContext } from "./context/SavedContext";
import { LanguageContext } from "./context/LanguageContext";
import { API_BASE_URL } from "./config/api";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";
import Passport from "./pages/Passport";
import QuestDetail from "./pages/QuestDetail";
import QuestActive from "./pages/QuestActive";
import QuestComplete from "./pages/QuestComplete";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import LocationPermissions from "./pages/LocationPermissions";
import HelpSafety from "./pages/HelpSafety";
import ReportProblem from "./pages/ReportProblem";
import ContactSupport from "./pages/ContactSupport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function StatusBar({ overlay = false }) {
  return (
    <div
      className={[
        // Fake iPhone status bar — only meaningful for the desktop mockup
        // preview. A real phone already shows its own real status bar, so
        // this must never render below the md breakpoint.
        "hidden items-center justify-between px-6 pt-3 pb-1 text-[15px] font-semibold md:flex",
        overlay ? "md:absolute md:inset-x-0 md:top-0 md:z-50" : "md:relative md:shrink-0",
      ].join(" ")}
      style={{ color: "#1a1a1a", height: 52 }}
    >
      <div className="absolute left-1/2 top-2 z-60 h-8.5 w-30 -translate-x-1/2 rounded-full bg-black" />
      <span className="z-20" style={{ letterSpacing: "-0.3px" }}>9:41</span>
      <div className="z-20 flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0"    y="9" width="3" height="3"  rx="1"/>
          <rect x="4.5"  y="6" width="3" height="6"  rx="1"/>
          <rect x="9"    y="3" width="3" height="9"  rx="1"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <circle cx="8" cy="11" r="1.5"/>
          <path d="M4.9 7.9a4.4 4.4 0 0 1 6.2 0l1.4-1.4a6.4 6.4 0 0 0-9 0z"/>
          <path d="M2 5a8.4 8.4 0 0 1 12 0l1.4-1.4a10.4 10.4 0 0 0-14.8 0z"/>
        </svg>
        <div className="relative flex items-center">
          <div className="flex h-3 w-6.25 items-center rounded-[3px] border-[1.5px] border-black px-0.5">
            <div className="h-1.75 w-full rounded-[1.5px] bg-black"/>
          </div>
          <div className="absolute -right-0.75 top-1/2 h-1.25 w-0.5 -translate-y-1/2 rounded-r-xs bg-black"/>
        </div>
      </div>
    </div>
  );
}

const NO_NAV = ["/", "/onboarding"];

function Shell() {
  const location = useLocation();
  const isImmersive = location.pathname.startsWith("/quest/");
  const isSettings = location.pathname.startsWith("/profile/settings");
  const hideNav = NO_NAV.includes(location.pathname) || isImmersive || isSettings;
  const { greenPhase } = useContext(SplashOverlayContext);

  return (
    <div
      className="relative flex h-dvh w-full flex-col overflow-hidden md:h-[min(812px,calc(100vh-32px))] md:w-93.75 md:rounded-[48px] md:shadow-2xl md:ring-[6px] md:ring-gray-800"
      style={{
        background: "#F8F7F4",
        // Real safe-area insets — only matter when there's no browser chrome
        // (e.g. installed as a home-screen app), harmless (0px) elsewhere.
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-50 rounded-[42px]"
        style={{
          background: "#15A963",
          opacity: greenPhase ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />

      {!isImmersive && <StatusBar />}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isImmersive && <StatusBar overlay />}
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/quest/:id" element={<QuestDetail />} />
          <Route path="/quest/:id/active" element={<QuestActive />} />
          <Route path="/quest/:id/complete" element={<QuestComplete />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/settings/notifications" element={<Notifications />} />
          <Route path="/profile/settings/location" element={<LocationPermissions />} />
          <Route path="/profile/settings/help-safety" element={<HelpSafety />} />
          <Route path="/profile/settings/report-problem" element={<ReportProblem />} />
          <Route path="/profile/settings/contact-support" element={<ContactSupport />} />
          <Route path="/profile/settings/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/profile/settings/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </div>

      {!hideNav && <BottomNav />}

      <ShellToast />
    </div>
  );
}

// Reads toast state from SavedContext (set by toggleSaved below) and renders
// it at the Shell level — one place, so it appears above the bottom nav on
// every page, and above the sticky Start/Repeat button on Quest Detail
// (which hides the nav), without any page needing its own copy.
function ShellToast() {
  const { toast, dismissToast } = useContext(SavedContext);
  return <Toast toast={toast} onDismiss={dismissToast} />;
}

function App() {
  const { t } = useContext(LanguageContext);
  const [greenPhase, setGreenPhase] = useState(false);
  const [savedMap, setSavedMap] = useState({});
  const savedMapRef = useRef(savedMap);
  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);

  // Load which quests are already saved (backend is the source of truth —
  // no login yet, so this is always the one demo user's saved list).
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/saved`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        const map = {};
        data.forEach((quest) => {
          map[quest.id] = quest.saved_at ? new Date(quest.saved_at).getTime() : Date.now();
        });
        setSavedMap(map);
      })
      .catch(() => {
        // Backend not reachable yet — just start with nothing saved locally.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    savedMapRef.current = savedMap;
  }, [savedMap]);

  const toggleSaved = useCallback((id) => {
    const wasSaved = Boolean(savedMapRef.current[id]);

    setSavedMap((prev) => {
      const next = { ...prev };
      if (wasSaved) delete next[id];
      else next[id] = Date.now();
      return next;
    });

    // Optimistic UI update above already happened — persist to the backend
    // in the background. On success, confirm with a toast; on failure, roll
    // the optimistic update back and tell the user instead of failing silently.
    fetch(`${API_BASE_URL}/api/saved/${id}`, { method: wasSaved ? "DELETE" : "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        setToast({
          message: wasSaved
            ? t("notification.removed", "Removed from saved")
            : t("notification.saved", "Added to saved"),
        });
      })
      .catch(() => {
        console.error("Failed to sync saved quest with the backend");
        setSavedMap((prev) => {
          const next = { ...prev };
          if (wasSaved) next[id] = Date.now();
          else delete next[id];
          return next;
        });
        setToast({ message: t("notification.saveError", "Couldn't save — please try again") });
      });
  }, [t]);

  return (
    <SplashOverlayContext.Provider value={{ greenPhase, setGreenPhase }}>
      <SavedContext.Provider value={{ savedMap, toggleSaved, toast, dismissToast }}>
        <div className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden" style={{ background: "#F7F6F3" }}>
          <Shell />
        </div>
      </SavedContext.Provider>
    </SplashOverlayContext.Provider>
  );
}

export default App;
