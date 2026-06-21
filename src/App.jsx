import { useContext, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router";
import { SplashOverlayContext } from "./context/SplashContext";

import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import Map from "./pages/Map";
import Saved from "./pages/Saved";
import Passport from "./pages/Passport";
import QuestDetail from "./pages/QuestDetail";
import QuestActive from "./pages/QuestActive";
import QuestComplete from "./pages/QuestComplete";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";


function StatusBar({ dark = false }) {
  const color = dark ? "white" : "#1a1a1a";
  return (
    <div
      className="relative flex shrink-0 items-center justify-between px-6 pt-3 pb-1 text-[15px] font-semibold"
      style={{ color, height: 52 }}
    >
      <div
        className="absolute left-1/2 top-2 z-[60] h-[34px] w-[120px] -translate-x-1/2 rounded-full"
        style={{ background: "black" }}
      />
      <span className="z-20" style={{ letterSpacing: "-0.3px" }}>9:41</span>
      <div className="z-20 flex items-center gap-[6px]">
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
          <div
            className="flex h-[12px] w-[25px] items-center rounded-[3px] border-[1.5px] px-[2px]"
            style={{ borderColor: color }}
          >
            <div className="h-[7px] w-full rounded-[1.5px]" style={{ background: color }}/>
          </div>
          <div className="absolute -right-[3px] top-1/2 h-[5px] w-[2px] -translate-y-1/2 rounded-r-[2px]" style={{ background: color }}/>
        </div>
      </div>
    </div>
  );
}

const NO_NAV = ["/", "/onboarding"];

function Shell() {
  const location = useLocation();
  const hideNav = NO_NAV.includes(location.pathname);
  const { greenPhase } = useContext(SplashOverlayContext);

  return (
    <div
      className="relative flex w-[375px] flex-col overflow-hidden rounded-[48px] shadow-2xl ring-[6px] ring-gray-800"
      style={{ height: "min(812px, calc(100vh - 32px))", background: "#F8F7F4" }}
    >
      {/* Full-screen green overlay — covers status bar too */}
      <div
        className="pointer-events-none absolute inset-0 z-50 rounded-[42px]"
        style={{
          background: "#15A963",
          opacity: greenPhase ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />

      <StatusBar />

      <div className="relative flex-1 overflow-hidden">
        <Routes>
          <Route path="/"                    element={<Splash />} />
          <Route path="/onboarding"          element={<Onboarding />} />
          <Route path="/explore"             element={<Explore />} />
          <Route path="/map"                 element={<Map />} />
          <Route path="/saved"               element={<Saved />} />
          <Route path="/passport"            element={<Passport />} />
          <Route path="/quest/:id"           element={<QuestDetail />} />
          <Route path="/quest/:id/active"    element={<QuestActive />} />
          <Route path="/quest/:id/complete"  element={<QuestComplete />} />
          <Route path="/profile"             element={<Profile />} />
          <Route path="/profile/settings"    element={<Settings />} />
        </Routes>
      </div>

      {!hideNav && (
        <nav className="flex shrink-0 justify-around border-t border-white/10 bg-[#101511] px-4 py-3 text-sm text-white">
          <Link to="/explore">Explore</Link>
          <Link to="/map">Map</Link>
          <Link to="/saved">Saved</Link>
          <Link to="/passport">Passport</Link>
        </nav>
      )}
    </div>
  );
}

function App() {
  const [greenPhase, setGreenPhase] = useState(false);

  return (
    <SplashOverlayContext.Provider value={{ greenPhase, setGreenPhase }}>
      <div className="flex h-screen items-center justify-center" style={{ background: "#F7F6F3" }}>
        <Shell />
      </div>
    </SplashOverlayContext.Provider>
  );
}

export default App;
