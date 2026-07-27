
// On a real phone, "localhost" points to the phone itself, not your Mac —
// so during local development the backend host is derived from whatever
// host the page itself was loaded from (window.location.hostname). Opening
// the Vite dev server via its LAN URL (e.g. http://172.17.85.141:5173) means
// the phone and the Mac already agree on that address, so the backend at
// the same host on port 5050 is reachable without hardcoding an IP that
// breaks every time you join a different Wi-Fi network.
// VITE_API_URL in frontend/.env.local still wins if set, for the rare case
// the backend runs on a different host/port than the frontend.
const DEV_API_PORT = 5050;

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return `http://${window.location.hostname}:${DEV_API_PORT}`;
  return "http://localhost:5050";
}

export const API_URL = resolveApiUrl();
