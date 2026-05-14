import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as storage from '../utils/storage';
import {
  DEFAULT_QUESTS,
  getLevelFromTotalXp,
  getTotalXpFromLog,
  getLevelHistory,
  calculateStreak,
  getTodayStr,
  ACHIEVEMENTS,
  getDailyBonusXp,
} from '../utils/gameEngine';

const GameContext = createContext(null);

// ── Initial State ──
function getInitialState() {
  const savedQuests = storage.getQuests();
  const quests = savedQuests || DEFAULT_QUESTS;
  if (!savedQuests) storage.saveQuests(quests);

  const completionLog = storage.getCompletionLog();
  const totalXp = getTotalXpFromLog(completionLog);
  storage.saveTotalXp(totalXp);
  const unlockedAchievements = storage.getUnlockedAchievements();
  const levelInfo = getLevelFromTotalXp(totalXp);
  const streakInfo = calculateStreak(completionLog);

  return {
    quests,
    totalXp,
    completionLog,
    unlockedAchievements,
    levelInfo,
    streakInfo,
    showLevelUp: false,
    newLevel: null,
    toast: null,
    newAchievement: null,
  };
}

// ── Reducer ──
function gameReducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_QUEST': {
      const { quest } = action.payload;
      const today = getTodayStr();
      const entry = {
        id: Date.now().toString(),
        questId: quest.id,
        questName: quest.name,
        xp: quest.xp,
        date: today,
        category: quest.category,
        timestamp: Date.now(),
      };

      const newLog = [...state.completionLog, entry];
      const newTotalXp = getTotalXpFromLog(newLog);

      storage.saveCompletionLog(newLog);
      storage.saveTotalXp(newTotalXp);

      const newLevelInfo = getLevelFromTotalXp(newTotalXp);
      const newStreakInfo = calculateStreak(newLog);
      const leveledUp = newLevelInfo.level > state.levelInfo.level;

      // Check for daily bonus
      const todayCompletions = newLog.filter(e => e.date === today).length;
      const bonusXp = getDailyBonusXp(todayCompletions);
      const prevCompletions = state.completionLog.filter(e => e.date === today).length;
      const prevBonus = getDailyBonusXp(prevCompletions);

      // Check new achievements
      const stats = buildStats(newLog, newTotalXp, newLevelInfo.level, newStreakInfo);
      const newUnlocked = checkNewAchievements(stats, state.unlockedAchievements);

      return {
        ...state,
        completionLog: newLog,
        totalXp: newTotalXp,
        levelInfo: newLevelInfo,
        streakInfo: newStreakInfo,
        showLevelUp: leveledUp,
        newLevel: leveledUp ? newLevelInfo.level : null,
        unlockedAchievements: newUnlocked.allUnlocked,
        newAchievement: newUnlocked.justUnlocked,
        toast: {
          message: `+${quest.xp} XP${bonusXp > prevBonus ? ` (+${bonusXp - prevBonus} bonus!)` : ''}`,
          type: 'xp',
        },
      };
    }

    case 'UNCOMPLETE_QUEST': {
      const { questId, date } = action.payload;
      const idx = [...state.completionLog].reverse().findIndex(
        e => e.questId === questId && e.date === date
      );
      if (idx === -1) return state;

      const actualIdx = state.completionLog.length - 1 - idx;
      const newLog = state.completionLog.filter((_, i) => i !== actualIdx);
      const newTotalXp = getTotalXpFromLog(newLog);

      storage.saveCompletionLog(newLog);
      storage.saveTotalXp(newTotalXp);

      return {
        ...state,
        completionLog: newLog,
        totalXp: newTotalXp,
        levelInfo: getLevelFromTotalXp(newTotalXp),
        streakInfo: calculateStreak(newLog),
      };
    }

    case 'ADD_QUEST': {
      const newQuests = [...state.quests, action.payload];
      storage.saveQuests(newQuests);
      return { ...state, quests: newQuests };
    }

    case 'UPDATE_QUEST': {
      const newQuests = state.quests.map(q =>
        q.id === action.payload.id ? { ...q, ...action.payload } : q
      );
      storage.saveQuests(newQuests);
      return { ...state, quests: newQuests };
    }

    case 'DELETE_QUEST': {
      const newQuests = state.quests.filter(q => q.id !== action.payload);
      storage.saveQuests(newQuests);
      return { ...state, quests: newQuests };
    }

    case 'DISMISS_LEVEL_UP':
      return { ...state, showLevelUp: false, newLevel: null };

    case 'DISMISS_TOAST':
      return { ...state, toast: null };

    case 'DISMISS_ACHIEVEMENT':
      return { ...state, newAchievement: null };

    default:
      return state;
  }
}

// ── Helpers ──
function buildStats(log, totalXp, level, streakInfo) {
  const today = getTodayStr();
  const todayLog = log.filter(e => e.date === today);

  const categoryCount = {};
  log.forEach(entry => {
    if (entry.category) {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
    }
  });

  // Max quests in a single day
  const dayGroups = {};
  log.forEach(entry => {
    dayGroups[entry.date] = (dayGroups[entry.date] || 0) + 1;
  });
  const maxQuestsInDay = Math.max(0, ...Object.values(dayGroups));

  return {
    totalXp,
    level,
    totalCompleted: log.length,
    todayCompleted: todayLog.length,
    currentStreak: streakInfo.current,
    bestStreak: streakInfo.best,
    maxQuestsInDay,
    categoryCount,
    daysActive: new Set(log.map(e => e.date)).size,
    levelHistory: getLevelHistory(log),
  };
}

function checkNewAchievements(stats, currentUnlocked) {
  let justUnlocked = null;
  const allUnlocked = [...currentUnlocked];

  for (const achievement of ACHIEVEMENTS) {
    if (!allUnlocked.includes(achievement.id) && achievement.condition(stats)) {
      allUnlocked.push(achievement.id);
      justUnlocked = achievement;
    }
  }

  if (allUnlocked.length !== currentUnlocked.length) {
    storage.saveUnlockedAchievements(allUnlocked);
  }

  return { allUnlocked, justUnlocked };
}

// ── Provider ──
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);

  // Auto-dismiss toast
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  // Auto-dismiss achievement notification
  useEffect(() => {
    if (state.newAchievement) {
      const timer = setTimeout(() => dispatch({ type: 'DISMISS_ACHIEVEMENT' }), 3500);
      return () => clearTimeout(timer);
    }
  }, [state.newAchievement]);

  const completeQuest = useCallback((quest) => {
    dispatch({ type: 'COMPLETE_QUEST', payload: { quest } });
  }, []);

  const uncompleteQuest = useCallback((questId, date) => {
    dispatch({ type: 'UNCOMPLETE_QUEST', payload: { questId, date } });
  }, []);

  const addQuest = useCallback((quest) => {
    dispatch({ type: 'ADD_QUEST', payload: quest });
  }, []);

  const updateQuest = useCallback((quest) => {
    dispatch({ type: 'UPDATE_QUEST', payload: quest });
  }, []);

  const deleteQuest = useCallback((id) => {
    dispatch({ type: 'DELETE_QUEST', payload: id });
  }, []);

  const dismissLevelUp = useCallback(() => {
    dispatch({ type: 'DISMISS_LEVEL_UP' });
  }, []);

  const today = getTodayStr();
  const todayCompletions = state.completionLog.filter(e => e.date === today);
  const stats = buildStats(
    state.completionLog,
    state.totalXp,
    state.levelInfo.level,
    state.streakInfo
  );

  const value = {
    ...state,
    stats,
    todayCompletions,
    completeQuest,
    uncompleteQuest,
    addQuest,
    updateQuest,
    deleteQuest,
    dismissLevelUp,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
