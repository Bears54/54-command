import React, { useState } from 'react';
import { Star, CheckCircle2, Circle, Edit2, Plus, Sparkles, Check } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const PrioritiesWidget: React.FC = () => {
  const { priorities, togglePriority, updatePriorityText, addPriority } = useBinder();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newPriorityText, setNewPriorityText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = priorities.filter((p) => p.completed).length;

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      updatePriorityText(id, editText.trim());
    }
    setEditingId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriorityText.trim()) {
      addPriority(newPriorityText.trim());
      setNewPriorityText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/30">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/60 text-[#be7fab] dark:text-[#efd0e5] shrink-0">
            <Star className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight leading-snug">
              Top 3 Priorities
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]">
              Primary daily focus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold font-mono text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            {completedCount}/{priorities.length}
          </span>
          {priorities.length < 5 && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
              title="Add priority"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Priorities List */}
      <div className="my-3 space-y-2.5">
        {priorities.map((item, index) => {
          const isItemEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all border ${
                item.completed
                  ? 'bg-[#efd0e5]/55 dark:bg-[#be7fab]/12 text-[#2d1b28]/65 dark:text-[#e6c3db]/70 border-[#be7fab]/40 dark:border-[#be7fab]/35'
                  : 'bg-[#e6c3db]/70 dark:bg-[#120a10]/70 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/30 hover:border-[#be7fab]'
              }`}
            >
              <button
                onClick={() => togglePriority(item.id)}
                className="mt-0.5 shrink-0 transition-transform active:scale-90"
                aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#be7fab] fill-[#be7fab]/25" />
                ) : (
                  <Circle className="w-5 h-5 text-[#be7fab]/70 dark:text-[#d29ec2]/60 group-hover:text-[#be7fab]" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {isItemEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(item.id)}
                      className="w-full text-xs px-2 py-1 bg-white dark:bg-[#120a10] border border-[#be7fab] rounded text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="p-1 bg-[#be7fab] text-[#120a10] rounded hover:bg-[#d29ec2]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[#be7fab] text-xs shrink-0">
                      0{index + 1}.
                    </span>
                    <span
                      onClick={() => togglePriority(item.id)}
                      className={`text-xs font-semibold cursor-pointer leading-relaxed ${
                        item.completed ? 'line-through text-[#2d1b28]/60 dark:text-[#e6c3db]/60' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                )}
              </div>

              {!isItemEditing && (
                <button
                  onClick={() => startEdit(item.id, item.text)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-opacity shrink-0"
                  title="Edit priority"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {isAdding && (
          <form onSubmit={handleAdd} className="flex items-center gap-2 p-2 bg-[#efd0e5]/60 dark:bg-[#120a10] rounded-xl border border-[#be7fab]/50">
            <input
              type="text"
              placeholder="Type new priority..."
              value={newPriorityText}
              onChange={(e) => setNewPriorityText(e.target.value)}
              className="flex-1 text-xs px-2 py-1 bg-transparent text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
            >
              Add
            </button>
          </form>
        )}
      </div>

      <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25 flex items-center justify-between font-mono">
        <span>High-leverage queue</span>
        {completedCount === priorities.length && priorities.length > 0 && (
          <span className="text-[#be7fab] dark:text-[#daabcb] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Complete
          </span>
        )}
      </div>
    </div>
  );
};
