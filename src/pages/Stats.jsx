import { useGame } from '../context/GameContext';
import { BarChart3, Flame, Target, TrendingUp, Zap, Calendar, Award, Star } from 'lucide-react';
import { getTodayStr } from '../utils/gameEngine';

export default function Stats() {
  const { stats, levelInfo, streakInfo, completionLog } = useGame();

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const xp = completionLog.filter(e => e.date === dateStr).reduce((s, e) => s + e.xp, 0);
    last7Days.push({ dateStr, dayName, xp });
  }
  const maxXpDay = Math.max(1, ...last7Days.map(d => d.xp));

  const categoryData = {};
  completionLog.forEach(entry => {
    const cat = entry.category || 'other';
    if (!categoryData[cat]) categoryData[cat] = { count: 0, xp: 0 };
    categoryData[cat].count++;
    categoryData[cat].xp += entry.xp;
  });

  const catMeta = {
    mind: { color: '#a855f7', label: '📚 Mind' },
    body: { color: '#10b981', label: '💪 Body' },
    focus: { color: '#06b6d4', label: '🎯 Focus' },
    social: { color: '#3b82f6', label: '🤝 Social' },
    creative: { color: '#f59e0b', label: '🎨 Creative' },
    other: { color: '#8888a8', label: '⭐ Other' },
  };

  return (
    <div className="page-stack stagger-children">
      <h1 className="page-title">
        <BarChart3 size={22} className="text-cyan-400" />
        Statistics
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Zap size={20} className="text-purple-400" />, label: 'Total XP', value: stats.totalXp.toLocaleString() },
          { icon: <Star size={20} className="text-amber-400" />, label: 'Level', value: levelInfo.level },
          { icon: <Target size={20} className="text-cyan-400" />, label: 'Quests Done', value: stats.totalCompleted },
          { icon: <Calendar size={20} className="text-blue-400" />, label: 'Days Active', value: stats.daysActive },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={20} className="text-amber-400" />
          <h2 className="font-bold">Streak</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{streakInfo.current}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Current</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-400">{streakInfo.best}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Best</p>
          </div>
        </div>
        {streakInfo.current > 0 && (
          <div className="mt-4 flex justify-center gap-1">
            {Array.from({ length: Math.min(streakInfo.current, 14) }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-sm"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)', opacity: 0.4 + (i / 14) * 0.6 }} />
            ))}
          </div>
        )}
        {streakInfo.current === 0 && (
          <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
            Complete a quest today to start your streak! 🔥
          </p>
        )}
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-green-400" />
          <h2 className="font-bold">Last 7 Days</h2>
        </div>
        <div className="flex items-end justify-between gap-2" style={{ height: '96px' }}>
          {last7Days.map((day, i) => {
            const hPct = day.xp > 0 ? Math.max(15, (day.xp / maxXpDay) * 100) : 5;
            const isToday = day.dateStr === getTodayStr();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: day.xp > 0 ? '#a855f7' : 'var(--text-muted)' }}>
                  {day.xp > 0 ? day.xp : ''}
                </span>
                <div className="w-full flex justify-center" style={{ height: '62px' }}>
                  <div className="w-full max-w-[28px] rounded-t-md transition-all duration-500"
                    style={{
                      height: `${hPct}%`, alignSelf: 'flex-end',
                      background: day.xp > 0
                        ? `linear-gradient(to top, ${isToday ? '#a855f7' : '#3b82f6'}, ${isToday ? '#06b6d4' : '#8b5cf6'})`
                        : 'rgba(42,42,69,0.5)',
                      boxShadow: day.xp > 0 && isToday ? 'var(--glow-purple)' : 'none',
                    }} />
                </div>
                <span className="text-[10px]" style={{ color: isToday ? '#a855f7' : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      {Object.keys(categoryData).length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-purple-400" />
            <h2 className="font-bold">Categories</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryData).sort((a, b) => b[1].xp - a[1].xp).map(([cat, data]) => {
              const m = catMeta[cat] || catMeta.other;
              const pct = stats.totalCompleted > 0 ? (data.count / stats.totalCompleted) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{m.label}</span>
                    <span className="text-xs font-bold" style={{ color: m.color }}>{data.xp} XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(42,42,69,0.5)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: m.color, boxShadow: `0 0 8px ${m.color}40` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.levelHistory.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-amber-400" />
            <h2 className="font-bold">Level History</h2>
          </div>
          <div className="space-y-3">
            {stats.levelHistory.slice(-6).reverse().map(item => (
              <div key={item.date} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Level {item.level}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-400">{item.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalCompleted === 0 && (
        <div className="glass-card p-8 text-center">
          <BarChart3 size={40} className="mx-auto mb-3 text-cyan-400 opacity-40" />
          <p className="font-medium mb-1">No stats yet</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Complete some quests to see your progress.</p>
        </div>
      )}
    </div>
  );
}
