import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const ImportantDatesWidget: React.FC = () => {
  const { importantDates, setActivePage } = useBinder();

  const sortedDates = [...importantDates].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date(2026, 10, 12);
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1) return `In ${diff}d`;
    return 'Past';
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Birthday': return 'bg-white/80 dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab]/50';
      case 'Anniversary': return 'bg-white/80 dark:bg-[#d29ec2]/20 text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2] dark:border-[#d29ec2]/45';
      case 'Appointment': return 'bg-white/80 dark:bg-[#daabcb]/20 text-[#2d1b28] dark:text-[#efd0e5] border-[#daabcb] dark:border-[#daabcb]/45';
      case 'Holiday': return 'bg-[#be7fab]/25 dark:bg-[#be7fab]/30 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab]/60';
      default: return 'bg-white/80 dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2] dark:border-[#d29ec2]/40';
    }
  };

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
            <Gift className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Important Dates
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
              Birthdays, milestones &amp; reminders
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('planner')}
          className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] transition-colors shadow-[0_0_12px_rgba(190,127,171,0.35)]"
        >
          <span>Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dates List */}
      <div className="my-3 space-y-2">
        {sortedDates.map(item => {
          const daysLeft = getDaysUntil(item.date);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#e6c3db]/70 dark:bg-[#241420]/90 border border-[#d29ec2] dark:border-[#d29ec2]/30 hover:border-[#be7fab] transition-all"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                  {item.title}
                </div>
                <div className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span className={`px-1.5 py-0.5 rounded border font-semibold text-[9px] ${getBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold font-mono text-[#120a10] bg-[#daabcb] px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                {daysLeft}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
        <span>Never miss a milestone</span>
        <button
          onClick={() => setActivePage('planner')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold"
        >
          Add to calendar →
        </button>
      </div>
    </div>
  );
};
