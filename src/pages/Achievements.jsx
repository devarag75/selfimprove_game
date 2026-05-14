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
    <div className="pb-6 space-y-4 stagger-children">
      <h1 className="text-xl font-bold flex items-center gap-2">
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
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id}
              className={`glass-card p-4 text-center transition-all duration-300 ${
                isUnlocked ? '' : 'opacity-50'
              }`}
              style={isUnlocked ? {
                borderColor: 'rgba(245, 158, 11, 0.3)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)',
              } : {}}
            >
              <div className="text-3xl mb-2">
                {isUnlocked ? a.icon : '🔒'}
              </div>
              <p className="font-semibold text-sm mb-0.5">
                {a.name}
              </p>
              <p className="text-[11px] leading-tight"
                style={{ color: 'var(--text-muted)' }}>
                {a.description}
              </p>
              {isUnlocked && (
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                    Unlocked
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
