// Simple localStorage-backed persistence for the MVP prototype.
// No backend yet — these are the only two things we need to remember:
// which quests are completed, and where the user was in an active quest.
// Swapping this for a real API later just means changing what's inside
// these functions, not how the pages call them.

const COMPLETED_QUESTS_KEY = "wayoCompletedQuests";
const ACTIVE_QUEST_PROGRESS_KEY = "wayoActiveQuestProgress";

export function getCompletedQuests() {
  try {
    const raw = localStorage.getItem(COMPLETED_QUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCompletedQuest(id) {
  const completed = getCompletedQuests();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem(COMPLETED_QUESTS_KEY, JSON.stringify(completed));
  }
}

export function getActiveQuestProgress(id) {
  try {
    const raw = localStorage.getItem(ACTIVE_QUEST_PROGRESS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[id] || null;
  } catch {
    return null;
  }
}

export function saveActiveQuestProgress(id, progress) {
  let all;
  try {
    const raw = localStorage.getItem(ACTIVE_QUEST_PROGRESS_KEY);
    all = raw ? JSON.parse(raw) : {};
  } catch {
    all = {};
  }
  all[id] = progress;
  localStorage.setItem(ACTIVE_QUEST_PROGRESS_KEY, JSON.stringify(all));
}

export function clearActiveQuestProgress(id) {
  try {
    const raw = localStorage.getItem(ACTIVE_QUEST_PROGRESS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    delete all[id];
    localStorage.setItem(ACTIVE_QUEST_PROGRESS_KEY, JSON.stringify(all));
  } catch {
    // nothing to clear
  }
}
