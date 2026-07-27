import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import LanguageProvider from "./context/LanguageProvider";
import { initAnalytics, trackEvent } from "./analytics/amplitude";

// One-off diagnostic event, fired once per app load (not per render) so it's
// easy to confirm the whole path — key, init, network — actually works.
initAnalytics().then((ready) => {
  if (ready) {
    trackEvent("WAYO Analytics Test", {
      source: "application_start",
      environment: import.meta.env.MODE,
    });
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
