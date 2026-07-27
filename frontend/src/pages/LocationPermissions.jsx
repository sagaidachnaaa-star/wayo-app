import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BackButton from "../components/BackButton";
import { LanguageContext } from "../context/LanguageContext";

const STORAGE_KEY = "wayo-location-permission";
const geoSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" stroke="#15A963" strokeWidth="1.8" />
      <circle cx="12" cy="9" r="2.6" stroke="#15A963" strokeWidth="1.8" />
    </svg>
  );
}

function LocationOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" stroke="#D44A08" strokeWidth="1.8" />
      <path d="M4 4l16 16" stroke="#D44A08" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Reads what we remembered last time, so refreshing the page doesn't flash
// back to the "please allow" screen if the user already answered before.
function getStoredStatus() {
  return localStorage.getItem(STORAGE_KEY) || "prompt";
}

export default function LocationPermissions() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const [status, setStatus] = useState(getStoredStatus); // "prompt" | "granted" | "denied"

  function saveStatus(next) {
    setStatus(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // On load, ask the browser what the real permission state is (if it can
  // tell us) so we stay in sync even if it changed outside the app.
  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") saveStatus("granted");
        else if (result.state === "denied") saveStatus("denied");
      })
      .catch(() => {
        // Permissions API not fully supported here — keep whatever we had stored.
      });
  }, []);

  function requestLocation() {
    if (!geoSupported) {
      saveStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => saveStatus("granted"),
      () => saveStatus("denied")
    );
  }

  return (
    <main className="h-full overflow-y-auto bg-[#F8F7F4] px-5 pb-6 text-[#2F2F2F] [&::-webkit-scrollbar]:hidden">
      <BackButton className="mt-2" />
      <h1 className="mt-6 text-[24px] font-bold">{t("location.title", "Location permissions")}</h1>

      {status === "granted" && (
        <>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F5EF]">
              <LocationIcon />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#2F2F2F]">{t("location.whileUsingApp", "While using the app")}</p>
              <p className="text-[13px] font-medium text-[#15A963]">{t("location.allowed", "Allowed")}</p>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-[1.5] text-[#2F2F2F]">
            {t(
              "location.grantedBody1",
              "WAYO uses your location to show nearby quests, measure distance and duration accurately, and centre the map on where you are. We never share your location with third parties, and it's only accessed while the app is open."
            )}
          </p>

          <p className="mt-4 text-[15px] leading-[1.5] text-[#2F2F2F]">
            {t("location.grantedBody2", "You can change this at any time from your device's system settings.")}
          </p>
        </>
      )}

      {status === "denied" && (
        <>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(47,47,47,0.06)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBEAE3]">
              <LocationOffIcon />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#2F2F2F]">{t("location.off", "Location access is off")}</p>
              <p className="text-[13px] font-medium text-[#D44A08]">{t("location.notAllowed", "Not allowed")}</p>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-[1.5] text-[#2F2F2F]">
            {t(
              "location.deniedBody1",
              "You can still use WAYO without location — just search for a place or pick a quest manually from Explore."
            )}
          </p>

          <p className="mt-4 text-[15px] leading-[1.5] text-[#2F2F2F]">
            {t("location.deniedBody2", "You can turn location back on at any time from your browser or device settings.")}
          </p>

          <button
            type="button"
            onClick={requestLocation}
            className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
          >
            {t("common.retry", "Try again")}
          </button>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="mt-3 flex h-13.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F]"
          >
            {t("location.exploreManually", "Explore manually")}
          </button>
        </>
      )}

      {status === "prompt" && (
        <>
          <p className="mt-5 text-[15px] leading-[1.5] text-[#2F2F2F]">
            {t(
              "location.promptBody",
              "WAYO uses your location to show nearby quests, measure distance and duration accurately, and centre the map on where you are. We never share your location with third parties."
            )}
          </p>

          <button
            type="button"
            onClick={requestLocation}
            className="mt-6 flex h-13.5 w-full items-center justify-center rounded-full bg-[#15A963] text-[16px] font-bold text-white"
          >
            {t("location.allowLocation", "Allow location")}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-3 flex h-13.5 w-full items-center justify-center rounded-full border border-[#E5E3DC] bg-white text-[16px] font-semibold text-[#2F2F2F]"
          >
            {t("location.notNow", "Not now")}
          </button>

          {!geoSupported && (
            <p className="mt-4 text-[13px] text-[#8A857D]">
              {t("location.notSupported", "Location isn't supported in this browser, but you can still explore manually.")}
            </p>
          )}
        </>
      )}
    </main>
  );
}
