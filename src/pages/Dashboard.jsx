import { useGame } from '../context/GameContext';
import { getTodayStr, getRandomLevelUpMessage } from '../utils/gameEngine';
import {
  Flame, Zap, Plus, CheckCircle, Trophy, Star,
  TrendingUp, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    quests,
    levelInfo,
    streakInfo,
    todayCompletions,
    completeQuest,
    uncompleteQuest,
    stats,
  } = useGame();

  const today = getTodayStr();
  const completedQuestIds = todayCompletions.map(c => c.questId);
  const progress = (levelInfo.currentXp / levelInfo.xpForNext) * 100;
  const rankTitle =
    levelInfo.level >= 10 ? 'Legend' :
    levelInfo.level >= 5 ? 'Rising Hero' :
    levelInfo.level >= 3 ? 'Focused Adventurer' :
    'New Adventurer';

  return (
    <div className="page-stack stagger-children">
      {/* ── Level Card ── */}
      <div className="glass-card level-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="level-hero">
            <div className="level-orb">
              <span>LVL</span>
              <strong>{levelInfo.level}</strong>
            </div>

            <div className="level-copy">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    Hero Rank
                  </span>
                  <p className="font-bold">{rankTitle}</p>
                </div>
                <div className="streak-pill">
                  <Flame size={14} />
                  <span>{streakInfo.current} day</span>
                </div>
              </div>
              <p className="level-xp">
                {levelInfo.currentXp} / {levelInfo.xpForNext} XP to Level {levelInfo.level + 1}
              </p>
            </div>
          </div>

          <div className="xp-bar-bg">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.max(2, progress)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stats.totalXp} total XP earned
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Level {levelInfo.level + 1} →
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="dashboard-metrics">
        <div className="glass-card metric-card">
          <Target size={18} className="mx-auto mb-1 text-purple-400" />
          <p className="text-lg font-bold">{todayCompletions.length}</p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Today</p>
        </div>
        <div className="glass-card metric-card">
          <TrendingUp size={18} className="mx-auto mb-1 text-cyan-400" />
          <p className="text-lg font-bold">{stats.totalCompleted}</p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total</p>
        </div>
        <div className="glass-card metric-card">
          <Trophy size={18} className="mx-auto mb-1 text-amber-400" />
          <p className="text-lg font-bold">{stats.daysActive}</p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Days Active</p>
        </div>
      </div>

      {/* ── Today's Quests ── */}
      <div>
        <div className="section-heading">
          <h2 className="section-title">
            <Zap size={20} className="text-amber-400" />
            Today's Quests
          </h2>
          <Link
            to="/quests"
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-purple)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            <Plus size={12} />
            Manage
          </Link>
        </div>

        <div className="space-y-2">
          {quests.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Star size={32} className="mx-auto mb-3 text-purple-400 animate-float" />
              <p className="font-medium mb-1">No quests yet!</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Head to Quests to add your first habit
              </p>
              <Link
                to="/quests"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                }}
              >
                <Plus size={16} />
                Add Quest
              </Link>
            </div>
          ) : (
            quests.map(quest => {
              const isCompleted = completedQuestIds.includes(quest.id);
              return (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isCompleted={isCompleted}
                  onToggle={() => {
                    if (isCompleted) {
                      uncompleteQuest(quest.id, today);
                    } else {
                      completeQuest(quest);
                    }
                  }}
                />
              );
            })
          )}
        </div>

        {/* Daily progress */}
        {quests.length > 0 && (
          <div className="mt-3 glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Daily Progress
              </span>
              <span className="text-xs font-bold text-purple-400">
                {todayCompletions.length} / {quests.length}
              </span>
            </div>
            <div className="xp-bar-bg" style={{ height: '8px' }}>
              <div
                className="xp-bar-fill"
                style={{
                  width: `${quests.length > 0 ? (todayCompletions.length / quests.length) * 100 : 0}%`,
                  background: todayCompletions.length === quests.length
                    ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                    : undefined,
                }}
              />
            </div>
            {todayCompletions.length === quests.length && quests.length > 0 && (
              <p className="text-xs text-center mt-2 text-emerald-400 font-medium animate-scale-in">
                🎉 All quests completed! You're crushing it!
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Motivational Footer ── */}
      <div className="text-center py-4">
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
          "{getRandomLevelUpMessage()}"
        </p>
      </div>
    </div>
  );
}

// ── Quest Card Component ──
function QuestCard({ quest, isCompleted, onToggle }) {
  return (
    <div
      className={`glass-card-interactive quest-list-card flex items-center gap-3 transition-all duration-300 ${
        isCompleted ? 'opacity-70' : ''
      }`}
      style={isCompleted ? { borderColor: 'rgba(16, 185, 129, 0.3)' } : {}}
    >
      <div
        className={`quest-checkbox ${isCompleted ? 'checked' : ''}`}
        onClick={onToggle}
        role="checkbox"
        aria-checked={isCompleted}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        {isCompleted && <CheckCircle size={16} className="text-white" />}
      </div>

      <div className="flex-1 min-w-0" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{quest.icon}</span>
          <p className={`font-medium text-sm ${isCompleted ? 'line-through' : ''}`}
            style={isCompleted ? { color: 'var(--text-muted)' } : {}}
          >
            {quest.name}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
        style={{
          background: isCompleted
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(168, 85, 247, 0.15)',
          color: isCompleted ? 'var(--accent-green)' : 'var(--accent-purple)',
        }}
      >
        <Zap size={10} />
        {quest.xp} XP
      </div>
    </div>
  );
}
