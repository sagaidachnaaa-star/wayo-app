import { useCallback, useContext, useState } from "react";
import { Routes, Route, useLocation } from "react-router";
import BottomNav from "./components/BottomNav";
import { SplashOverlayContext } from "./context/SplashContext";
import { SavedContext } from "./context/SavedContext";
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
        "flex items-center justify-between px-6 pt-3 pb-1 text-[15px] font-semibold",
        overlay ? "absolute inset-x-0 top-0 z-50" : "relative shrink-0",
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
      className="relative flex w-93.75 flex-col overflow-hidden rounded-[48px] shadow-2xl ring-[6px] ring-gray-800"
      style={{ height: "min(812px, calc(100vh - 32px))", background: "#F8F7F4" }}
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

      <div className="relative flex-1 overflow-hidden">
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
    </div>
  );
}

function App() {
  const [greenPhase, setGreenPhase] = useState(false);
  const [savedMap, setSavedMap] = useState({});

  const toggleSaved = useCallback((id) => {
    setSavedMap((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = Date.now();
      return next;
    });
  }, []);

  return (
    <SplashOverlayContext.Provider value={{ greenPhase, setGreenPhase }}>
      <SavedContext.Provider value={{ savedMap, toggleSaved }}>
        <div className="flex h-screen items-center justify-center" style={{ background: "#F7F6F3" }}>
          <Shell />
        </div>
      </SavedContext.Provider>
    </SplashOverlayContext.Provider>
  );
}

export default App;
