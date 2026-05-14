/**
 * Life RPG Game Engine
 * Handles XP calculations, leveling, streaks, and achievements
 */

// ── Level Curve ──
// Each level requires progressively more XP
// Formula: XP needed = 50 * level^1.5 (rounded)
export function getXpForLevel(level) {
  return Math.round(50 * Math.pow(level, 1.5));
}

export function getLevelFromTotalXp(totalXp) {
  let level = 1;
  let xpUsed = 0;
  while (true) {
    const needed = getXpForLevel(level);
    if (xpUsed + needed > totalXp) break;
    xpUsed += needed;
    level++;
  }
  return {
    level,
    currentXp: totalXp - xpUsed,
    xpForNext: getXpForLevel(level),
    totalXp,
  };
}

export function getTotalXpFromLog(completionLog) {
  const dayGroups = {};

  completionLog.forEach(entry => {
    if (!dayGroups[entry.date]) {
      dayGroups[entry.date] = { baseXp: 0, count: 0 };
    }
    dayGroups[entry.date].baseXp += entry.xp;
    dayGroups[entry.date].count += 1;
  });

  return Object.values(dayGroups).reduce((total, day) => {
    return total + day.baseXp + getDailyBonusXp(day.count);
  }, 0);
}

export function getLevelHistory(completionLog) {
  const byDay = {};

  completionLog.forEach(entry => {
    if (!byDay[entry.date]) {
      byDay[entry.date] = [];
    }
    byDay[entry.date].push(entry);
  });

  let runningXp = 0;
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entries]) => {
      const baseXp = entries.reduce((sum, entry) => sum + entry.xp, 0);
      runningXp += baseXp + getDailyBonusXp(entries.length);

      return {
        date,
        xp: runningXp,
        level: getLevelFromTotalXp(runningXp).level,
      };
    });
}

// ── Streak Calculation ──
export function calculateStreak(completionLog) {
  if (!completionLog || completionLog.length === 0) return { current: 0, best: 0 };

  const uniqueDays = [...new Set(completionLog.map(entry => entry.date))].sort().reverse();
  const today = getTodayStr();
  const yesterday = getDateStr(new Date(Date.now() - 86400000));

  let current = 0;

  // Check if the streak includes today or yesterday
  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    current = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diffDays = (prev - curr) / 86400000;
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak
  let best = 0;
  let tempStreak = 1;
  const sortedAsc = [...uniqueDays].sort();
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = (curr - prev) / 86400000;
    if (diffDays === 1) {
      tempStreak++;
    } else {
      best = Math.max(best, tempStreak);
      tempStreak = 1;
    }
  }
  best = Math.max(best, tempStreak, current);

  return { current, best };
}

// ── Date Helpers ──
export function getTodayStr() {
  return getDateStr(new Date());
}

export function getDateStr(date) {
  return date.toISOString().split('T')[0];
}

// ── Default Quests ──
export const DEFAULT_QUESTS = [
  { id: 'study-25', name: 'Study 25 minutes', xp: 10, icon: '📚', category: 'mind' },
  { id: 'exercise', name: 'Exercise', xp: 15, icon: '💪', category: 'body' },
  { id: 'reading', name: 'Read for 20 minutes', xp: 10, icon: '📖', category: 'mind' },
  { id: 'no-phone', name: 'No-phone focus session', xp: 10, icon: '📵', category: 'focus' },
  { id: 'hydrate', name: 'Drink 8 glasses of water', xp: 5, icon: '💧', category: 'body' },
  { id: 'sleep-early', name: 'Sleep before midnight', xp: 10, icon: '🌙', category: 'body' },
  { id: 'journal', name: 'Write journal entry', xp: 10, icon: '✍️', category: 'mind' },
  { id: 'meditate', name: 'Meditate 10 minutes', xp: 10, icon: '🧘', category: 'focus' },
];

// ── Achievements ──
export const ACHIEVEMENTS = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first quest', icon: '🌟', condition: (stats) => stats.totalCompleted >= 1 },
  { id: 'getting-started', name: 'Getting Started', description: 'Reach Level 2', icon: '⬆️', condition: (stats) => stats.level >= 2 },
  { id: 'triple-threat', name: 'Triple Threat', description: 'Complete 3 quests in one day', icon: '⚡', condition: (stats) => stats.maxQuestsInDay >= 3 },
  { id: 'streak-3', name: '3-Day Focus', description: 'Maintain a 3-day streak', icon: '🔥', condition: (stats) => stats.bestStreak >= 3 },
  { id: 'streak-7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '🗡️', condition: (stats) => stats.bestStreak >= 7 },
  { id: 'streak-14', name: 'Fortnight Force', description: '14-day streak achieved', icon: '🛡️', condition: (stats) => stats.bestStreak >= 14 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day streak achieved', icon: '👑', condition: (stats) => stats.bestStreak >= 30 },
  { id: 'xp-100', name: 'Century Club', description: 'Earn 100 total XP', icon: '💯', condition: (stats) => stats.totalXp >= 100 },
  { id: 'xp-500', name: 'XP Collector', description: 'Earn 500 total XP', icon: '💎', condition: (stats) => stats.totalXp >= 500 },
  { id: 'xp-1000', name: 'XP Hoarder', description: 'Earn 1000 total XP', icon: '🏆', condition: (stats) => stats.totalXp >= 1000 },
  { id: 'level-5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', condition: (stats) => stats.level >= 5 },
  { id: 'level-10', name: 'Veteran', description: 'Reach Level 10', icon: '🎖️', condition: (stats) => stats.level >= 10 },
  { id: 'tasks-10', name: 'Task Slayer', description: 'Complete 10 quests total', icon: '⚔️', condition: (stats) => stats.totalCompleted >= 10 },
  { id: 'tasks-50', name: 'Quest Master', description: 'Complete 50 quests total', icon: '🏅', condition: (stats) => stats.totalCompleted >= 50 },
  { id: 'study-warrior', name: 'Study Warrior', description: 'Complete 10 study sessions', icon: '🎓', condition: (stats) => stats.categoryCount?.mind >= 10 },
  { id: 'fitness-hero', name: 'Fitness Hero', description: 'Complete 10 exercise sessions', icon: '🏋️', condition: (stats) => stats.categoryCount?.body >= 10 },
];

// ── Level-Up Messages ──
export const LEVEL_UP_MESSAGES = [
  "You're leveling up in real life!",
  "Every level counts. Keep going!",
  "You're becoming the best version of yourself!",
  "Real progress, real rewards!",
  "The grind is paying off!",
  "Life XP > Game XP. You're winning!",
  "Another level conquered!",
  "Your future self thanks you!",
  "Discipline is your superpower!",
  "Building the character that matters most: you.",
];

export function getRandomLevelUpMessage() {
  return LEVEL_UP_MESSAGES[Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)];
}

// ── Daily Bonus ──
export function getDailyBonusXp(completedToday) {
  if (completedToday >= 5) return 25;
  if (completedToday >= 3) return 10;
  return 0;
}
