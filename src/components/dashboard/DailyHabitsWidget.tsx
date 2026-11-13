import React from 'react';
import {
  Heart,
  ArrowRight,
  Flame,
  CheckCircle2,
  Circle,
  Droplets,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const DailyHabitsWidget: React.FC = () => {
  const { habitCards, moveHabitCard, setActivePage } = useBinder();

  const completedCount = habitCards.filter((h) => h.column === 'done').length;
  const totalCount = habitCards.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const size = 54;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/30">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/60 text-[#be7fab] dark:text-[#efd0e5]">
            <Heart className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Daily Habits &amp; Rituals
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]">
              Consistency &amp; momentum
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 hud-svg-glow">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(210, 158, 194, 0.35)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#be7fab"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <span className="text-[10px] font-bold font-mono text-[#2d1b28] dark:text-[#efd0e5]">{percent}%</span>
            </div>
          </div>

          <button
            onClick={() => setActivePage('habits')}
            className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1.5 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] transition-all active:scale-95 shadow-[0_0_15px_rgba(190,127,171,0.35)]"
            title="Open Daily Habits Kanban board"
          >
            <span>Habits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Illuminated Progress Bar */}
      <div className="mt-3 mb-1">
        <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#d29ec2]/25">
          <div
            className="h-full bg-[#be7fab] shadow-[0_0_10px_#be7fab] rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="my-2.5 space-y-2 max-h-56 overflow-y-auto pr-1">
        {habitCards.map((habit) => {
          const isDone = habit.column === 'done';

          return (
            <div
              key={habit.id}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                isDone
                  ? 'bg-[#efd0e5]/55 dark:bg-[#be7fab]/12 text-[#2d1b28]/65 dark:text-[#e6c3db]/70 border-[#be7fab]/45 dark:border-[#be7fab]/35'
                  : 'bg-[#e6c3db]/70 dark:bg-[#120a10]/70 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/30 hover:border-[#be7fab]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => moveHabitCard(habit.id, isDone ? 'todo' : 'done')}
                  className="shrink-0 transition-transform active:scale-90"
                  aria-label={isDone ? 'Mark habit undone' : 'Mark habit done'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#be7fab] fill-[#be7fab]/25" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#be7fab]/70 dark:text-[#d29ec2]/60 group-hover:text-[#be7fab]" />
                  )}
                </button>

                <div className="min-w-0">
                  <span
                    onClick={() => moveHabitCard(habit.id, isDone ? 'todo' : 'done')}
                    className={`text-xs font-semibold cursor-pointer truncate block ${
                      isDone ? 'line-through text-[#2d1b28]/60 dark:text-[#e6c3db]/60' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                    }`}
                  >
                    {habit.title}
                  </span>
                  {habit.isWaterHabit && (
                    <div className="flex items-center gap-1 text-[10px] text-[#2d1b28]/75 dark:text-[#daabcb] font-mono">
                      <Droplets className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" />
                      <span>{habit.waterGlasses || 0}/8 glasses</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold font-mono tabular-nums text-[#2d1b28] dark:text-[#daabcb] shrink-0">
                <Flame className="w-3 h-3 text-[#be7fab]" />
                <span>{habit.streak || 1}d</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono tabular-nums">
        <span>{completedCount} of {totalCount} completed</span>
        <button
          onClick={() => setActivePage('habits')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-bold"
        >
          Habit Board →
        </button>
      </div>
    </div>
  );
};
