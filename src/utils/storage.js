/**
 * localStorage persistence layer for Life RPG
 */

const STORAGE_KEYS = {
  QUESTS: 'lifeRpg_quests',
  COMPLETION_LOG: 'lifeRpg_completionLog',
  TOTAL_XP: 'lifeRpg_totalXp',
  UNLOCKED_ACHIEVEMENTS: 'lifeRpg_unlockedAchievements',
  DAILY_BONUS_CLAIMED: 'lifeRpg_dailyBonusClaimed',
  FIRST_LAUNCH: 'lifeRpg_firstLaunch',
};

function safeGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ── Quests ──
export function getQuests() {
  return safeGet(STORAGE_KEYS.QUESTS, null);
}

export function saveQuests(quests) {
  safeSet(STORAGE_KEYS.QUESTS, quests);
}

// ── Completion Log ──
// Each entry: { id, questId, questName, xp, date, category, timestamp }
export function getCompletionLog() {
  return safeGet(STORAGE_KEYS.COMPLETION_LOG, []);
}

export function saveCompletionLog(log) {
  safeSet(STORAGE_KEYS.COMPLETION_LOG, log);
}

export function addCompletion(entry) {
  const log = getCompletionLog();
  log.push(entry);
  saveCompletionLog(log);
  return log;
}

// ── Total XP ──
export function getTotalXp() {
  return safeGet(STORAGE_KEYS.TOTAL_XP, 0);
}

export function saveTotalXp(xp) {
  safeSet(STORAGE_KEYS.TOTAL_XP, xp);
}

export function addXp(amount) {
  const current = getTotalXp();
  const newTotal = current + amount;
  saveTotalXp(newTotal);
  return newTotal;
}

// ── Achievements ──
export function getUnlockedAchievements() {
  return safeGet(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, []);
}

export function saveUnlockedAchievements(achievements) {
  safeSet(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, achievements);
}

export function unlockAchievement(id) {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    saveUnlockedAchievements(unlocked);
  }
  return unlocked;
}

// ── Daily Bonus ──
export function getDailyBonusClaimed() {
  return safeGet(STORAGE_KEYS.DAILY_BONUS_CLAIMED, null);
}

export function setDailyBonusClaimed(date) {
  safeSet(STORAGE_KEYS.DAILY_BONUS_CLAIMED, date);
}

// ── First Launch ──
export function isFirstLaunch() {
  return safeGet(STORAGE_KEYS.FIRST_LAUNCH, true);
}

export function markLaunched() {
  safeSet(STORAGE_KEYS.FIRST_LAUNCH, false);
}

// ── Reset (for debugging) ──
export function resetAll() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
