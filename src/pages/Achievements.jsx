import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../utils/gameEngine';
import { Trophy, Lock, Sparkles } from 'lucide-react';

export default function Achievements() {
  const { unlockedAchievements } = useGame();
  const unlocked = unlockedAchievements || [];
  const total = ACHIEVEMENTS.length;
  const count = unlocked.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="page-stack stagger-children">
      <h1 className="page-title">
        <Trophy size={22} className="text-amber-400" />
        Achievements
      </h1>

      {/* Progress summary */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Progress
          </span>
          <span className="text-sm font-bold text-amber-400">
            {count} / {total}
          </span>
        </div>
        <div className="xp-bar-bg">
          <div className="xp-bar-fill"
            style={{
              width: `${Math.max(2, pct)}%`,
              background: 'linear-gradient(90deg, #f59e0b, #f43f5e)',
            }} />
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          {pct}% of badges unlocked
        </p>
      </div>

      {/* Badge Grid */}
      <div className="achievement-list">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id}
              className={`glass-card achievement-card transition-all duration-300 ${
                isUnlocked ? 'achievement-card-unlocked' : 'achievement-card-locked'
              }`}
              style={isUnlocked ? {
                borderColor: 'rgba(245, 158, 11, 0.3)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)',
              } : {}}
            >
              <div className="achievement-icon">
                {isUnlocked ? <span>{a.icon}</span> : <Lock size={20} />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm mb-0.5">{a.name}</p>
                <p className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {a.description}
                </p>
              </div>
              {isUnlocked && (
                <div className="achievement-state">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                    Done
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count === 0 && (
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Complete quests to unlock your first badge! ✨
          </p>
        </div>
      )}
    </div>
  );
}
