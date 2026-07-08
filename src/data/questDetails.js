import greenwichMain from "../assets/GreenwichMain.png";
import greenwichCuttySark from "../assets/GreenwichCuttySurk.png";
import greenwichOldRoyal from "../assets/GreenwichOldRoyal.png";
import greenwichPark from "../assets/GreenwichGreenwichPark.png";
import greenwichViewpoint from "../assets/GreenwichGreenwichViewPoint.png";
import greenwichBadgeClosed from "../assets/GreenwichbadgeClosed.png";
import greenwichBadgeReward from "../assets/GreenwichStrollReward.png";

import kyoto1 from "../assets/Kyoto1.png";
import kyoto2 from "../assets/Kyoto2.png";
import kyoto3 from "../assets/Kyoto3.png";
import kyoto4 from "../assets/Kyoto4.png";

import thames1 from "../assets/Thames1.png";
import thames2 from "../assets/Thames2.png";
import thames3 from "../assets/Thames3.png";
import thames4 from "../assets/Thames4.png";

import southbank1 from "../assets/Southbank1.png";
import southbank2 from "../assets/Southbank2.png";
import southbank3 from "../assets/Southbank3.png";
import southbank4 from "../assets/Southbank4.png";

import jamesPark1 from "../assets/JamesPark1.png";
import jamesPark2 from "../assets/JamesPark2.png";
import jamesPark3 from "../assets/JamesPark3.png";
import jamesPark4 from "../assets/JamesPark4.png";

import kyotoBadge from "../assets/badge1.png";
import lockedBadge from "../assets/Locked.png";

import pathsIcon from "../assets/PathsIcon.png";
import uphillIcon from "../assets/UphillIcon.png";
import stopsIcon from "../assets/StopsIcon.png";
import toiletsIcon from "../assets/ToiletsIcon.png";
import headphonesIcon from "../assets/HeadphonesIcon.png";

// ── Per-quest detail content — only quests with dedicated photography and
// route notes get the extended sections; others fall back to the basics.
// Shared by QuestDetail, QuestActive, and QuestComplete. ────────────────────
export const questDetails = {
  "greenwich-stroll": {
    heroImages: [greenwichMain, greenwichCuttySark, greenwichOldRoyal, greenwichPark, greenwichViewpoint],
    tags: ["Walking", "Riverside", "Parks & Gardens", "Hidden history"],
    longDescription:
      "Take a relaxed walk through Royal Greenwich and discover peaceful green spaces. This quest guides you through key local stops, from Cutty Sark to Greenwich Park, with clear directions and photo-worthy moments along the way.",
    discover: [
      { name: "Cutty Sark", image: greenwichCuttySark },
      { name: "Old Royal College", image: greenwichOldRoyal },
      { name: "Greenwich Park", image: greenwichPark },
      { name: "Greenwich Viewpoint", image: greenwichViewpoint },
    ],
    route: {
      start: { title: "Cutty Sark DLR Station", lat: 51.4817, lng: -0.0096 },
      stops: [
        { title: "Cutty Sark", lat: 51.4828, lng: -0.0096 },
        { title: "Old Royal Naval College", lat: 51.483, lng: -0.0058 },
        { title: "Queen's House", lat: 51.4811, lng: -0.0039 },
        { title: "Greenwich Park", lat: 51.4779, lng: -0.0015 },
      ],
      end: { title: "Greenwich Park viewpoint", lat: 51.4769, lng: -0.0005 },
    },
    safety: [
      { icon: pathsIcon, title: "Mostly paved paths", text: "The route mainly follows pedestrian areas and park paths." },
      { icon: uphillIcon, title: "Short uphill section", text: "There is moderate uphill part near Greenwich Park." },
      { icon: stopsIcon, title: "Rest stops nearby", text: "Benches, cafés, and public spaces are available along the route." },
      { icon: toiletsIcon, title: "Public toilets nearby", text: "Facilities are available near Cutty Sark and Greenwich town centre." },
      { icon: headphonesIcon, title: "Stay aware at crossing", text: "Use headphones at low volume and check roads carefully." },
    ],
    weatherNote: "This is an outdoor route. Check the weather and wear comfortable shoes.",
    badge: {
      image: greenwichBadgeClosed,
      unlockedImage: greenwichBadgeReward,
      name: "Greenwich Stroll badge",
      desc: "Finish the route to collect this badge in your Passport.",
    },
  },

  "kyoto-garden-escape": {
    heroImages: [kyoto1, kyoto2, kyoto3, kyoto4],
    tags: ["Walking", "Gardens", "Peaceful", "Photo Spots"],
    longDescription:
      "Slip away from Kensington's busy streets into a quiet Japanese-style garden. This short quest guides you past a waterfall, koi pond, and peace pagoda, ending with a calm sit-down spot perfect for a breather.",
    discover: [
      { name: "Garden Walkway", image: kyoto1 },
      { name: "Kyoto Pavilion", image: kyoto2 },
      { name: "Garden Bridge", image: kyoto3 },
      { name: "Stone Lantern", image: kyoto4 },
    ],
    route: {
      start: { title: "Holland Park Main Gate", lat: 51.5051, lng: -0.2058 },
      stops: [
        { title: "Kyoto Garden entrance", lat: 51.5047, lng: -0.204 },
        { title: "Waterfall viewpoint", lat: 51.5043, lng: -0.2033 },
        { title: "Peace Pagoda", lat: 51.5038, lng: -0.2025 },
      ],
      end: { title: "Holland Park Café", lat: 51.503, lng: -0.201 },
    },
    safety: [
      { icon: pathsIcon, title: "Mostly paved paths", text: "Gravel and paved paths throughout, step-free access." },
      { icon: stopsIcon, title: "Rest stops nearby", text: "Benches are dotted along the garden paths." },
      { icon: toiletsIcon, title: "Public toilets nearby", text: "Facilities are available near the main park gate." },
      { icon: headphonesIcon, title: "Keep it quiet", text: "This is a popular spot for quiet reflection — keep noise low." },
    ],
    weatherNote: "This is an outdoor route. Check the weather and wear comfortable shoes.",
    badge: {
      image: kyotoBadge,
      unlockedImage: kyotoBadge,
      name: "Kyoto Garden Escape badge",
      desc: "Finish the route to collect this badge in your Passport.",
    },
  },

  "thames-time-trail": {
    heroImages: [thames1, thames2, thames3, thames4],
    tags: ["Walking", "Riverside", "Architecture", "History"],
    longDescription:
      "Trace the Thames from the Tower of London to London Bridge, weaving through centuries of history — medieval fortress, Victorian markets, and the modern City skyline all on one riverside walk.",
    discover: [
      { name: "Tower Bridge", image: thames1 },
      { name: "Borough Market", image: thames2 },
      { name: "Market Stalls", image: thames3 },
      { name: "City Skyline", image: thames4 },
    ],
    route: {
      start: { title: "Tower Hill Station", lat: 51.5098, lng: -0.0766 },
      stops: [
        { title: "Tower of London", lat: 51.5081, lng: -0.0759 },
        { title: "Tower Bridge", lat: 51.5055, lng: -0.0754 },
        { title: "Borough Market", lat: 51.5055, lng: -0.091 },
      ],
      end: { title: "London Bridge viewpoint", lat: 51.5079, lng: -0.0877 },
    },
    safety: [
      { icon: uphillIcon, title: "Busy crossings", text: "Several road crossings near Tower Bridge — take care." },
      { icon: stopsIcon, title: "Rest stops nearby", text: "Cafés and benches along Borough Market and the riverside." },
      { icon: toiletsIcon, title: "Public toilets nearby", text: "Facilities available at Borough Market and London Bridge." },
      { icon: headphonesIcon, title: "Stay aware at crossings", text: "Use headphones at low volume and check roads carefully." },
    ],
    weatherNote: "This is an outdoor route. Check the weather and wear comfortable shoes.",
    badge: {
      image: lockedBadge,
      name: "Thames Time Trail badge",
      desc: "Finish the route to collect this badge in your Passport.",
    },
  },

  "quiet-corners-southbank": {
    heroImages: [southbank1, southbank2, southbank3, southbank4],
    tags: ["Walking", "Riverside", "Photo Spots", "Cafés Nearby"],
    longDescription:
      "Skip the crowds and find Southbank's quieter side — hidden courtyards, riverside benches, and viewpoints over the Thames that most visitors walk straight past.",
    discover: [
      { name: "London Eye", image: southbank1 },
      { name: "Riverside Skyline", image: southbank2 },
      { name: "Millennium Bridge", image: southbank3 },
      { name: "Riverside at Dusk", image: southbank4 },
    ],
    route: {
      start: { title: "Southbank Centre", lat: 51.5065, lng: -0.1149 },
      stops: [
        { title: "Gabriel's Wharf", lat: 51.5072, lng: -0.1103 },
        { title: "OXO Tower", lat: 51.5077, lng: -0.1088 },
        { title: "Tate Modern", lat: 51.5076, lng: -0.0994 },
      ],
      end: { title: "Millennium Bridge viewpoint", lat: 51.5095, lng: -0.0985 },
    },
    safety: [
      { icon: pathsIcon, title: "Mostly paved paths", text: "Flat, step-free riverside paths for the whole route." },
      { icon: stopsIcon, title: "Rest stops nearby", text: "Cafés and public seating along the riverside." },
      { icon: toiletsIcon, title: "Public toilets nearby", text: "Facilities available near Gabriel's Wharf and Tate Modern." },
    ],
    weatherNote: "This is an outdoor route. Check the weather and wear comfortable shoes.",
    badge: {
      image: lockedBadge,
      name: "Quiet Corners of Southbank badge",
      desc: "Finish the route to collect this badge in your Passport.",
    },
  },

  "green-escape-city": {
    heroImages: [jamesPark1, jamesPark2, jamesPark3, jamesPark4],
    tags: ["Walking", "Parks & Gardens", "Peaceful", "Photo Spots"],
    longDescription:
      "A short, peaceful loop through St James's Park — lakeside views, pelicans, and a classic postcard shot of Buckingham Palace from across the water.",
    discover: [
      { name: "The Lake", image: jamesPark1 },
      { name: "Queen's Guard", image: jamesPark2 },
      { name: "Buckingham Palace", image: jamesPark3 },
      { name: "Victoria Memorial", image: jamesPark4 },
    ],
    route: {
      start: { title: "St James's Park Station", lat: 51.4994, lng: -0.1332 },
      stops: [
        { title: "Blue Bridge", lat: 51.503, lng: -0.1347 },
        { title: "Duck Island", lat: 51.5039, lng: -0.131 },
      ],
      end: { title: "Buckingham Palace viewpoint", lat: 51.5014, lng: -0.1419 },
    },
    safety: [
      { icon: pathsIcon, title: "Mostly paved paths", text: "Flat, step-free paths throughout the park." },
      { icon: stopsIcon, title: "Rest stops nearby", text: "Benches and a café are available along the lake." },
      { icon: toiletsIcon, title: "Public toilets nearby", text: "Facilities are available near the park entrances." },
    ],
    weatherNote: "This is an outdoor route. Check the weather and wear comfortable shoes.",
    badge: {
      image: lockedBadge,
      name: "Green Escape in the City badge",
      desc: "Finish the route to collect this badge in your Passport.",
    },
  },
};
