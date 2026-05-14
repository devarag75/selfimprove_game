import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getTodayStr } from '../utils/gameEngine';
import {
  Plus, Pencil, Trash2, X, Check, Zap, Swords,
  CheckCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: 'mind', label: 'Mind', icon: '📚' },
  { value: 'body', label: 'Body', icon: '💪' },
  { value: 'focus', label: 'Focus', icon: '🎯' },
  { value: 'social', label: 'Social', icon: '🤝' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '⭐' },
];

const EMOJI_OPTIONS = ['📚', '💪', '📖', '📵', '💧', '🌙', '✍️', '🧘', '🏃', '🎨', '🎵', '🧹', '🥗', '💤', '🎯', '🤝', '💻', '🌱', '⭐', '🔥'];

export default function Quests() {
  const {
    quests,
    addQuest,
    updateQuest,
    deleteQuest,
    completeQuest,
    uncompleteQuest,
    todayCompletions,
  } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const today = getTodayStr();
  const completedQuestIds = todayCompletions.map(entry => entry.questId);

  const handleEdit = (quest) => {
    setEditingQuest(quest);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingQuest(null);
    setShowForm(true);
  };

  const handleSave = (questData) => {
    if (editingQuest) {
      updateQuest({ ...editingQuest, ...questData });
    } else {
      addQuest({ ...questData, id: `custom-${Date.now()}` });
    }
    setShowForm(false);
    setEditingQuest(null);
  };

  const handleDelete = (id) => {
    deleteQuest(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Swords size={22} className="text-purple-400" />
            Quest Board
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {quests.length} quest{quests.length !== 1 ? 's' : ''} active
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
          }}
        >
          <Plus size={16} />
          New Quest
        </button>
      </div>

      {/* Quest List */}
      <div className="space-y-2 stagger-children">
        {quests.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Swords size={40} className="mx-auto mb-3 text-purple-400 opacity-50" />
            <p className="font-medium mb-1">No quests created yet</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create your first quest to start earning XP!
            </p>
          </div>
        ) : (
          quests.map(quest => {
            const isCompleted = completedQuestIds.includes(quest.id);

            return (
            <div
              key={quest.id}
              className={`glass-card-interactive quest-manage-card ${isCompleted ? 'opacity-75' : ''}`}
              style={isCompleted ? { borderColor: 'rgba(16, 185, 129, 0.3)' } : {}}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => isCompleted ? uncompleteQuest(quest.id, today) : completeQuest(quest)}
                  className={`quest-checkbox ${isCompleted ? 'checked' : ''}`}
                  aria-label={isCompleted ? `Mark ${quest.name} incomplete` : `Complete ${quest.name}`}
                >
                  {isCompleted ? <CheckCircle size={16} className="text-white" /> : <span className="text-sm">{quest.icon}</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${isCompleted ? 'line-through' : ''}`}
                    style={isCompleted ? { color: 'var(--text-muted)' } : {}}
                  >
                    {quest.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: 'var(--accent-purple)',
                      }}
                    >
                      <Zap size={8} /> {quest.xp} XP
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                      style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      {quest.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(quest)}
                    className="icon-button"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label={`Edit ${quest.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  {deleteConfirm === quest.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(quest.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="icon-button"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="Cancel delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(quest.id)}
                      className="icon-button"
                      style={{ color: 'var(--text-secondary)' }}
                      aria-label={`Delete ${quest.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <QuestForm
          quest={editingQuest}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingQuest(null); }}
        />
      )}
    </div>
  );
}

// ── Quest Form Modal ──
function QuestForm({ quest, onSave, onClose }) {
  const [name, setName] = useState(quest?.name || '');
  const [xp, setXp] = useState(quest?.xp?.toString() || '10');
  const [category, setCategory] = useState(quest?.category || 'other');
  const [icon, setIcon] = useState(quest?.icon || '⭐');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      xp: Math.max(1, Math.min(100, parseInt(xp) || 10)),
      category,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="glass-card w-full max-w-md p-5 relative animate-fade-in-up"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">
            {quest ? 'Edit Quest' : 'New Quest'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Quest Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Study for 25 minutes"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              autoFocus
              required
            />
          </div>

          {/* XP Value */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              XP Reward
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20, 25].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setXp(val.toString())}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                  style={{
                    background: parseInt(xp) === val
                      ? 'linear-gradient(135deg, #a855f7, #3b82f6)'
                      : 'var(--bg-card)',
                    border: `1px solid ${parseInt(xp) === val ? 'transparent' : 'var(--border-color)'}`,
                    boxShadow: parseInt(xp) === val ? '0 4px 15px rgba(168, 85, 247, 0.3)' : 'none',
                  }}
                >
                  {val}
                </button>
              ))}
              <input
                type="number"
                value={xp}
                onChange={e => setXp(e.target.value)}
                min="1"
                max="100"
                className="w-16 py-2 px-2 rounded-lg text-xs font-bold text-center outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className="py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                  style={{
                    background: category === cat.value
                      ? 'rgba(168, 85, 247, 0.2)'
                      : 'var(--bg-card)',
                    border: `1px solid ${category === cat.value ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    color: category === cat.value ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className="w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: icon === emoji ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-card)',
                    border: `1px solid ${icon === emoji ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    transform: icon === emoji ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
            }}
          >
            {quest ? 'Save Changes' : 'Create Quest'}
          </button>
        </form>
      </div>
    </div>
  );
}
