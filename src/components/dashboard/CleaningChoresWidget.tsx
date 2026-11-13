import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const CleaningChoresWidget: React.FC = () => {
  const { cleaningChores, toggleChore, setActivePage } = useBinder();

  const todayChores = cleaningChores.slice(0, 4);
  const completedCount = cleaningChores.filter(c => c.completed).length;

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Cleaning Chores
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
              Daily touch-ups &amp; fresh maintenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#d29ec2]/45 tabular-nums font-mono">
            {completedCount}/{cleaningChores.length}
          </span>
          <button
            onClick={() => setActivePage('cleaning')}
            className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] transition-colors shadow-[0_0_12px_rgba(190,127,171,0.35)]"
          >
            <span>Cleaning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chores list */}
      <div className="my-3 space-y-2">
        {todayChores.map(chore => (
          <div
            key={chore.id}
            className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border ${
              chore.completed
                ? 'bg-[#efd0e5]/50 dark:bg-[#120a10]/50 text-[#2d1b28]/60 dark:text-[#e6c3db]/55 border-[#d29ec2]/60 dark:border-[#be7fab]/20'
                : 'bg-[#e6c3db]/70 dark:bg-[#241420]/90 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => toggleChore(chore.id)}
                className="shrink-0 transition-transform active:scale-90"
                aria-label={chore.completed ? 'Mark chore undone' : 'Mark chore completed'}
              >
                {chore.completed ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#be7fab] fill-[#be7fab]/25" />
                ) : (
                  <Circle className="w-4.5 h-4.5 text-[#be7fab]/70 dark:text-[#d29ec2]/70 group-hover:text-[#be7fab]" />
                )}
              </button>

              <span
                onClick={() => toggleChore(chore.id)}
                className={`text-xs font-medium cursor-pointer truncate ${
                  chore.completed ? 'line-through text-[#2d1b28]/55 dark:text-[#e6c3db]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                }`}
              >
                {chore.task}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-[#2d1b28] dark:text-[#efd0e5] font-medium px-2 py-0.5 rounded bg-white/80 dark:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#d29ec2]/40">
                {chore.room}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
        <span>Room-by-room rotation</span>
        <button
          onClick={() => setActivePage('cleaning')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold"
        >
          View cleaning zones →
        </button>
      </div>
    </div>
  );
};
