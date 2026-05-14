import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { getRandomLevelUpMessage } from './utils/gameEngine';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Stats from './pages/Stats';
import Achievements from './pages/Achievements';
import { Home, Swords, BarChart3, Trophy, Zap, X, Sparkles } from 'lucide-react';

function AppLayout() {
  const location = useLocation();
  const { showLevelUp, newLevel, dismissLevelUp, toast, newAchievement } = useGame();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/quests', icon: Swords, label: 'Quests' },
    { to: '/stats', icon: BarChart3, label: 'Stats' },
    { to: '/achievements', icon: Trophy, label: 'Badges' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background particles */}
      <div className="bg-particles" />

      {/* Main content */}
      <main className="app-shell relative z-10 px-4 pt-6 pb-24">
        {/* App Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="font-game text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            LIFE RPG
          </h1>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
            <Zap size={12} />
            v1.0
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/achievements" element={<Achievements />} />
        </Routes>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner flex items-center justify-around py-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? '' : 'opacity-50'
                }`
              }
              style={({ isActive }) => isActive ? {
                color: '#a855f7',
                background: 'rgba(168,85,247,0.08)',
              } : { color: 'var(--text-secondary)' }}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* XP Toast */}
      {toast && (
        <div className="fixed top-6 right-4 z-50 toast-enter">
          <div className="glass-card px-4 py-2.5 flex items-center gap-2"
            style={{
              background: 'rgba(168,85,247,0.2)',
              borderColor: 'rgba(168,85,247,0.4)',
              boxShadow: 'var(--glow-purple)',
            }}>
            <Zap size={16} className="text-purple-400" />
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Achievement Toast */}
      {newAchievement && (
        <div className="fixed top-16 right-4 z-50 toast-enter">
          <div className="glass-card px-4 py-3 flex items-center gap-2"
            style={{
              background: 'rgba(245,158,11,0.15)',
              borderColor: 'rgba(245,158,11,0.3)',
              boxShadow: 'var(--glow-amber)',
            }}>
            <span className="text-xl">{newAchievement.icon}</span>
            <div>
              <p className="text-xs font-bold text-amber-400">Achievement Unlocked!</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {newAchievement.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level-Up Overlay */}
      {showLevelUp && (
        <div className="level-up-overlay" onClick={dismissLevelUp}>
          <div className="level-up-content" onClick={e => e.stopPropagation()}>
            <div className="animate-float mb-4">
              <Sparkles size={48} className="mx-auto text-amber-400" />
            </div>
            <p className="text-sm uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-secondary)' }}>Level Up!</p>
            <p className="font-game text-6xl font-black mb-3 animate-level-up"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              {newLevel}
            </p>
            <p className="text-sm mb-6 max-w-xs mx-auto"
              style={{ color: 'var(--text-secondary)' }}>
              {getRandomLevelUpMessage()}
            </p>
            <button onClick={dismissLevelUp}
              className="px-8 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                boxShadow: 'var(--glow-purple)',
              }}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <AppLayout />
      </GameProvider>
    </HashRouter>
  );
}
