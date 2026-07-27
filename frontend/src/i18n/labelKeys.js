export const difficultyKeyMap = {
  Easy: "quest.easy",
  Moderate: "quest.moderate",
  Tough: "quest.tough",
};

export const questAccessibilityKeyMap = {
  "Step-free": "quest.stepFree",
  "Pram Friendly": "quest.pramFriendly",
  "Fully Paved": "quest.fullyPaved",
  "Mostly flat": "quest.mostlyFlat",
};

export const preferenceKeyMap = {
  "Street Art": "preference.streetArt",
  "Hidden History": "preference.hiddenHistory",
  Riverside: "preference.riverside",
  "Parks & Gardens": "preference.parksGardens",
  Architecture: "preference.architecture",
  "Photo Spots": "preference.photoSpots",
  "Cafés Nearby": "preference.cafesNearby",
};

export const accessibilityPreferenceKeyMap = {
  "Step-free": "preference.stepFree",
  "Pram Friendly": "preference.pramFriendly",
  "Fully Paved": "preference.fullyPaved",
};


export const tagKeyMap = {
  Walking: "tag.walking",
  Riverside: "tag.riverside",
  "Parks & Gardens": "tag.parksGardens",
  "Hidden history": "tag.hiddenHistory",
  "Hidden History": "tag.hiddenHistory",
  Garden: "tag.garden",
  Gardens: "tag.gardens",
  Peaceful: "tag.peaceful",
  Nature: "tag.nature",
  History: "tag.history",
  Landmarks: "tag.landmarks",
  "Hidden spots": "tag.hiddenSpots",
  "Independent places": "tag.independentPlaces",
  "Royal park": "tag.royalPark",
  Relaxed: "tag.relaxed",
  Architecture: "tag.architecture",
  "Photo Spots": "tag.photoSpots",
  "Cafés Nearby": "tag.cafesNearby",
};

export const activityKeyMap = {
  Walking: "explore.walking",
  Cycling: "explore.cycling",
  "Public transport": "explore.publicTransport",
};

export const sortKeyMap = {
  "Most relevant": "explore.mostRelevant",
  "Most popular": "explore.mostPopular",
  Closest: "explore.closest",
  "Newly added": "explore.newlyAdded",
  "Last updated": "saved.lastUpdated",
  Name: "saved.name",
};

export const myQuestsKeyMap = {
  All: "explore.allQuests",
  Completed: "quest.completed",
  "Not completed": "explore.notCompleted",
};

export const discoverKeyMap = {
  "Cutty Sark": "discover.cuttySark",
  "Old Royal College": "discover.oldRoyalCollege",
  "Greenwich Park": "discover.greenwichPark",
  "Greenwich Viewpoint": "discover.greenwichViewpoint",
  "Garden Walkway": "discover.gardenWalkway",
  "Kyoto Pavilion": "discover.kyotoPavilion",
  "Garden Bridge": "discover.gardenBridge",
  "Stone Lantern": "discover.stoneLantern",
  "Tower Bridge": "discover.towerBridge",
  "Borough Market": "discover.boroughMarket",
  "Market Stalls": "discover.marketStalls",
  "City Skyline": "discover.citySkyline",
  "London Eye": "discover.londonEye",
  "Riverside Skyline": "discover.riversideSkyline",
  "Millennium Bridge": "discover.millenniumBridge",
  "Riverside at Dusk": "discover.riversideAtDusk",
  "The Lake": "discover.theLake",
  "Queen's Guard": "discover.queensGuard",
  "Buckingham Palace": "discover.buckinghamPalace",
  "Victoria Memorial": "discover.victoriaMemorial",
};

export const reportReasonKeyMap = {
  "Route or directions issue": "reportProblem.reasonRoute",
  "Incorrect quest info": "reportProblem.reasonIncorrectInfo",
  "Safety concern": "reportProblem.reasonSafety",
  "App bug": "reportProblem.reasonBug",
  "Something else": "reportProblem.reasonOther",
};


export function translateLabel(t, map, label) {
  const key = map[label];
  return key ? t(key, label) : label;
}
