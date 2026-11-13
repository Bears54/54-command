import React from 'react';
import { Hammer, ArrowRight } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const HomeProjectsWidget: React.FC = () => {
  const { homeProjects, setActivePage } = useBinder();

  const activeProjects = homeProjects.filter(p => p.status === 'In Progress').slice(0, 2);

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
            <Hammer className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Active Home Projects
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
              Renovations, DIY &amp; spaces in progress
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('projects')}
          className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] transition-colors shadow-[0_0_12px_rgba(190,127,171,0.35)]"
        >
          <span>Projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Projects List */}
      <div className="my-3 space-y-3">
        {activeProjects.map(proj => {
          const completedTasksCount = proj.tasks.filter(t => t.done).length;

          return (
            <div
              key={proj.id}
              onClick={() => setActivePage('projects')}
              className="p-3 rounded-xl bg-[#e6c3db]/70 dark:bg-[#241420]/90 border border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors truncate block">
                    {proj.title}
                  </span>
                  <span className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
                    {proj.category} · Target: {proj.targetDate}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#2d1b28] dark:text-[#daabcb] tabular-nums font-mono shrink-0">
                  {proj.progress}%
                </span>
              </div>

              {/* Illuminated Progress Bar */}
              <div className="w-full h-2 bg-white dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/25 rounded-full overflow-hidden my-1.5">
                <div
                  className="h-full bg-linear-to-r from-[#be7fab] to-[#d29ec2] dark:to-[#efd0e5] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(190,127,171,0.5)]"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 pt-1">
                <span>{completedTasksCount} of {proj.tasks.length} steps finished</span>
                <span className="tabular-nums font-medium text-[#2d1b28] dark:text-[#efd0e5] font-mono">
                  ${proj.spent} / ${proj.budget}
                </span>
              </div>
            </div>
          );
        })}

        {activeProjects.length === 0 && (
          <p className="text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 italic py-2">No active projects currently underway.</p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
        <span>DIY &amp; Home sanctuary</span>
        <button
          onClick={() => setActivePage('projects')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold"
        >
          View all projects →
        </button>
      </div>
    </div>
  );
};
