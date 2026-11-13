import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Droplets,
  Flame,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Footprints,
  Pill,
  FlameKindling,
  Dumbbell,
  Download,
  Zap,
  Coffee,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const HabitsPage: React.FC = () => {
  const {
    habitCards,
    moveHabitCard,
    setWaterGlassesForHabit,
    addHabitCard,
    deleteHabitCard,
    habits,
    toggleHabit,
  } = useBinder();

  const [activeView, setActiveView] = useState<'kanban' | 'matrix'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<'todo' | 'done'>('todo');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wellness');

  const todoCards = habitCards.filter((c) => c.column === 'todo');
  const doneCards = habitCards.filter((c) => c.column === 'done');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const isWater = title.toLowerCase().includes('water');
    addHabitCard({
      title: title.trim(),
      column: targetColumn,
      category,
      isWaterHabit: isWater,
      waterGlasses: isWater ? 0 : undefined,
      streak: 1,
    });
    setTitle('');
    setIsAddModalOpen(false);
  };

  const getHabitIcon = (cardTitle: string) => {
    const t = cardTitle.toLowerCase();
    if (t.includes('walk')) return <Footprints className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />;
    if (t.includes('vitamin')) return <Pill className="w-4 h-4 text-[#be7fab] dark:text-[#e6c3db]" />;
    if (t.includes('sauna')) return <FlameKindling className="w-4 h-4 text-[#be7fab]" />;
    if (t.includes('protein')) return <Coffee className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]" />;
    if (t.includes('workout')) return <Dumbbell className="w-4 h-4 text-[#2d1b28] dark:text-[#efd0e5]" />;
    if (t.includes('water')) return <Droplets className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />;
    if (t.includes('show')) return <Download className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]" />;
    if (t.includes('generator')) return <Zap className="w-4 h-4 text-[#be7fab]" />;
    return <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
            Daily Habits Command Board
          </h2>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
            Two-column telemetry flow for daily rituals, hydration tracking, and streak consistency
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl">
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'kanban'
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                  : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              Habits Kanban
            </button>
            <button
              onClick={() => setActiveView('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'matrix'
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                  : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              7-Day Streaks
            </button>
          </div>

          <button
            onClick={() => {
              setTargetColumn('todo');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {activeView === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Column 1: TO DO */}
          <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/15 border border-[#be7fab]/35 text-[#be7fab] dark:text-[#daabcb]">
                  <Circle className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                  To Do
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 tabular-nums">
                  {todoCards.length}
                </span>
              </div>

              <span className="text-[11px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 font-medium">Pending today</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {todoCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl bg-[#e6c3db]/55 dark:bg-[#120a10]/85 border border-[#d29ec2]/75 dark:border-[#d29ec2]/30 hover:border-[#be7fab] shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-white/80 dark:bg-[#be7fab]/15 border border-[#d29ec2] dark:border-[#be7fab]/30">
                        {getHabitIcon(card.title)}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug">
                          {card.title}
                        </h4>
                        <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 font-medium">
                          {card.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {card.streak !== undefined && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-white/85 dark:bg-[#be7fab]/20 px-1.5 py-0.5 rounded border border-[#d29ec2] dark:border-[#be7fab]/40 tabular-nums">
                          <Flame className="w-3 h-3 text-[#be7fab] fill-[#be7fab]" />
                          <span>{card.streak}d</span>
                        </span>
                      )}
                      <button
                        onClick={() => deleteHabitCard(card.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity"
                        title="Delete habit card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* SPECIAL WATER HABIT: 8 Clickable Water-Drop Icons */}
                  {card.isWaterHabit && (
                    <div className="mt-3 pt-2.5 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/25 bg-white/85 dark:bg-[#1c0f19]/90 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] fill-[#be7fab]/35 dark:fill-[#daabcb]/60" />
                          <span>Tap drops to fill (8 glasses goal):</span>
                        </span>
                        <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums text-xs">
                          {card.waterGlasses || 0}/8 Glasses
                        </span>
                      </div>

                      <div className="grid grid-cols-8 gap-1.5 py-1">
                        {[...Array(8)].map((_, dropIdx) => {
                          const isFilled = dropIdx < (card.waterGlasses || 0);
                          return (
                            <button
                              key={dropIdx}
                              onClick={() => {
                                const newCount = dropIdx + 1 === card.waterGlasses ? dropIdx : dropIdx + 1;
                                setWaterGlassesForHabit(card.id, newCount);
                              }}
                              className={`h-8 rounded-lg flex flex-col items-center justify-center transition-all active:scale-90 border ${
                                isFilled
                                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5]/60 shadow-[0_0_10px_rgba(190,127,171,0.55)]'
                                  : 'bg-[#efd0e5]/60 dark:bg-[#120a10] text-[#be7fab]/45 dark:text-[#d29ec2]/40 border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
                              }`}
                              title={`Glass ${dropIdx + 1}`}
                            >
                              <Droplets className={`w-4 h-4 ${isFilled ? 'fill-[#120a10]' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Move to Done Action Button */}
                  <div className="mt-3 pt-2 border-t border-[#d29ec2]/40 dark:border-[#be7fab]/15 flex items-center justify-between">
                    <span className="text-[10px] text-[#2d1b28]/60 dark:text-[#e6c3db]/65">Ready to complete?</span>
                    <button
                      onClick={() => moveHabitCard(card.id, 'done')}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#120a10] bg-[#daabcb] hover:bg-[#be7fab] dark:hover:bg-[#efd0e5] rounded-lg transition-colors active:scale-95"
                    >
                      <span>Mark Done</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {todoCards.length === 0 && (
                <div className="h-48 border-2 border-dashed border-[#be7fab]/45 dark:border-[#be7fab]/35 rounded-2xl flex flex-col items-center justify-center text-[#2d1b28]/70 dark:text-[#e6c3db]/70 p-4 text-center">
                  <Sparkles className="w-6 h-6 text-[#be7fab] mb-1" />
                  <p className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">All daily habits completed!</p>
                  <p className="text-[11px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 mt-0.5">Celebrate your consistency today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: DONE */}
          <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab] text-[#120a10]">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                  Done
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#be7fab] text-[#120a10] tabular-nums">
                  {doneCards.length}
                </span>
              </div>

              <span className="text-[11px] text-[#be7fab] dark:text-[#daabcb] font-semibold">Completed today</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {doneCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl bg-[#e6c3db]/75 dark:bg-[#be7fab]/12 border border-[#be7fab]/45 shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-white/80 dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5]">
                        {getHabitIcon(card.title)}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#2d1b28]/75 dark:text-[#e6c3db]/80 line-through">
                          {card.title}
                        </h4>
                        <span className="text-[10px] text-[#2d1b28]/60 dark:text-[#e6c3db]/65 font-medium">
                          {card.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {card.streak !== undefined && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#120a10] bg-[#daabcb] px-1.5 py-0.5 rounded tabular-nums">
                          <Flame className="w-3 h-3 text-[#120a10] fill-[#120a10]" />
                          <span>{card.streak}d streak</span>
                        </span>
                      )}
                      <button
                        onClick={() => deleteHabitCard(card.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity"
                        title="Delete habit card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {card.isWaterHabit && (
                    <div className="mt-2 text-[11px] text-[#2d1b28] dark:text-[#efd0e5] font-semibold flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] fill-[#be7fab] dark:fill-[#daabcb]" />
                      <span>All 8 glasses logged!</span>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-[#be7fab]/25 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-semibold">Accomplished ✓</span>
                    <button
                      onClick={() => moveHabitCard(card.id, 'todo')}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#2d1b28]/75 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Move to To-Do</span>
                    </button>
                  </div>
                </div>
              ))}

              {doneCards.length === 0 && (
                <div className="h-48 border-2 border-dashed border-[#be7fab]/35 rounded-2xl flex flex-col items-center justify-center text-[#2d1b28]/70 dark:text-[#e6c3db]/70 p-4 text-center">
                  <p className="text-xs text-[#2d1b28] dark:text-[#efd0e5]">No habits completed yet today.</p>
                  <p className="text-[11px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 mt-0.5">Click &quot;Mark Done&quot; on any habit card as you finish it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hud-panel hud-corners p-6 overflow-x-auto">
          <div className="pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              7-Day Habit Streak History
            </h3>
            <span className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/80">Compounding consistency</span>
          </div>

          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb] text-[11px] font-bold uppercase tracking-wider">
                <th className="pb-3">Habit Name</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3 text-center">Streak</th>
                <th className="pb-3 text-center">Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d29ec2]/35 dark:divide-[#be7fab]/15">
              {habits.map((h) => (
                <tr key={h.id} className="hover:bg-[#e6c3db]/50 dark:hover:bg-[#be7fab]/10 transition-colors">
                  <td className="py-3 font-semibold text-xs text-[#2d1b28] dark:text-[#efd0e5]">{h.name}</td>
                  <td className="py-3 text-center text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/80">{h.category}</td>
                  <td className="py-3 text-center font-bold text-[#be7fab] dark:text-[#daabcb] text-xs tabular-nums">{h.streak} days</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => toggleHabit(h.id)}
                      className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center text-xs transition-colors ${
                        h.completedToday
                          ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_8px_rgba(190,127,171,0.5)]'
                          : 'border border-[#d29ec2] dark:border-[#be7fab]/45 text-transparent hover:border-[#be7fab] dark:hover:border-[#efd0e5]'
                      }`}
                    >
                      {h.completedToday ? '✓' : ''}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Custom Habit Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Add Habit Card
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cold shower, Read 20 pages, Meditate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                >
                  <option value="Movement">Movement</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Recovery">Recovery</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Hydration">Hydration</option>
                  <option value="Media">Media</option>
                  <option value="Home & Power">Home &amp; Power</option>
                  <option value="Mindfulness">Mindfulness</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
