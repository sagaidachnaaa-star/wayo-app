import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fallback used when geolocation is unavailable or denied.
const DEFAULT_LOCATION = { lat: 51.4826, lng: -0.0077 }; // Greenwich, London

// Icons
function LocateFabIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L19 21L12 17L5 21L12 2Z" stroke="#15A963" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── Leaflet marker icons (plain divIcons — no default-icon asset issues) ─────
function questPinIcon() {
  return L.divIcon({
    className: "",
    html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11.3 16 24 16 24s16-12.7 16-24C32 7.2 24.8 0 16 0Z" fill="#15A963"/>
      <circle cx="16" cy="16" r="6.5" fill="white"/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}
function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2E7FF0;border:3px solid white;box-shadow:0 0 0 5px rgba(46,127,240,0.25)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const QUEST_PIN_ICON = questPinIcon();

// ── Main ──────────────────────────────────────────────────────────────────────
// Bare map background: pins + user location only. No filters or list of its
// own — those live once in the Explore sheet so there's a single source of
// truth for the quest list instead of two parallel UIs.
export default function QuestMapView({ quests, active }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const requested = useRef(false);

  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!active || requested.current) return;
    requested.current = true;

    if (!("geolocation" in navigator)) {
      const id = setTimeout(() => {
        setUserLocation(DEFAULT_LOCATION);
        setLocationDenied(true);
      }, 0);
      return () => clearTimeout(id);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setUserLocation(DEFAULT_LOCATION);
        setLocationDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [active]);

  function centerOnMe() {
    if (userLocation) mapRef.current?.panTo([userLocation.lat, userLocation.lng]);
  }

  if (!userLocation) return <div className="h-full w-full bg-[#E9E7E1]" />;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        ref={mapRef}
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!locationDenied && <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon()} />}

        {quests.map((q) => (
          <Marker
            key={q.id}
            position={[q.coordinates.lat, q.coordinates.lng]}
            icon={QUEST_PIN_ICON}
            eventHandlers={{ click: () => navigate(`/quest/${q.id}`) }}
          />
        ))}
      </MapContainer>

      <button
        type="button"
        onClick={centerOnMe}
        className="absolute bottom-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(47,47,47,0.18)]"
        aria-label="Center on my location"
      >
        <LocateFabIcon />
      </button>
    </div>
  );
}
