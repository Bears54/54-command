import React from 'react';
import { Compass, Activity, ShieldCheck } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { HealthCards } from './HealthCards';
import { NutritionWidget } from './NutritionWidget';
import { MiniCalendar } from './MiniCalendar';
import { PrioritiesWidget } from './PrioritiesWidget';
import { TodayTodosWidget } from './TodayTodosWidget';
import { DailyHabitsWidget } from './DailyHabitsWidget';
import { BillsDueWidget } from './BillsDueWidget';
import { ImportantDatesWidget } from './ImportantDatesWidget';
import { CleaningChoresWidget } from './CleaningChoresWidget';
import { HomeProjectsWidget } from './HomeProjectsWidget';
import { QuickNotesWidget } from './QuickNotesWidget';
import { MedsSupplementsWidget } from './MedsSupplementsWidget';
import { TodayQuickActionMenu } from './TodayQuickActionMenu';

export const TodayDashboard: React.FC = () => {
  const { userProfile, weather, todos, bills, habits } = useBinder();

  const completedHabits = habits.filter(h => h.completedToday).length;
  const openTodos = todos.filter(t => t.dueDate === '2026-11-12' && !t.completed).length;
  const unpaidBillsCount = bills.filter(b => b.dueDate === '2026-11-12' && !b.isPaid).length;

  const now = new Date();
  const weekdayShort = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthShort = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const liveBannerDate = `${weekdayShort} · ${monthShort} ${now.getDate()}, ${now.getFullYear()}`;

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT STACKED STATUS COLUMN (3 cols on xl) */}
        <div className="xl:col-span-3 space-y-5 order-2 xl:order-1">
          <MiniCalendar />
          <MedsSupplementsWidget />
          <ImportantDatesWidget />
        </div>

        {/* WIDE CENTRAL HERO & VISUAL WORKSPACE (6 cols on xl) */}
        <div className="xl:col-span-6 space-y-5 order-1 xl:order-2">
          {/* Mission Control Command Banner */}
          <div className="hud-panel hud-corners washi-tape-top p-5 sm:p-6 bg-linear-to-br from-white via-[#efd0e5]/55 to-[#e6c3db]/75 dark:from-[#1c0f19] dark:via-[#241420] dark:to-[#be7fab]/15 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 opacity-10 pointer-events-none hidden sm:block">
              <Compass className="w-28 h-28 text-[#be7fab] dark:text-[#efd0e5]" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-widest bg-[#e6c3db] dark:bg-[#be7fab]/25 px-2.5 py-0.5 rounded-md border border-[#be7fab] dark:border-[#be7fab]/60 shadow-[0_0_12px_rgba(190,127,171,0.25)]">
                    <Activity className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" />
                    Daily Command Center
                  </span>
                  <span className="text-[#be7fab]">·</span>
                  <span className="text-xs text-[#2d1b28]/80 dark:text-[#e6c3db] font-mono">
                    {liveBannerDate}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight mt-2">
                  Welcome back, {userProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#2d1b28]/80 dark:text-[#e6c3db]/85 font-medium mt-1 italic">
                  “Move gently, focus deeply, and command a day of intentional clarity.”
                </p>
              </div>

              {/* Compact HUD Readout Cluster */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 shrink-0 bg-[#e6c3db]/85 dark:bg-[#120a10]/80 p-2.5 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/40 font-mono">
                <div className="text-center sm:text-right">
                  <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 uppercase">Location</div>
                  <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">{weather.location} · {weather.temperature}°F</div>
                </div>
                <div className="text-center sm:text-right border-x sm:border-x-0 sm:border-t border-[#d29ec2] dark:border-[#be7fab]/25 px-2 sm:px-0 sm:pt-1.5">
                  <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 uppercase">Active Queue</div>
                  <div className="text-xs font-bold text-[#2d1b28] dark:text-[#daabcb]">
                    {openTodos} Tasks · {unpaidBillsCount} Bills
                  </div>
                </div>
                <div className="text-center sm:text-right sm:border-t border-[#d29ec2] dark:border-[#be7fab]/25 sm:pt-1.5 flex items-center justify-center sm:justify-end gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#be7fab]" />
                  <span className="text-[11px] font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    {completedHabits}/{habits.length} Habits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Apple Health 4 Circular Gauges + Spark-Bars */}
          <HealthCards />

          {/* Daily Nutrition Macro Ring Gauges */}
          <NutritionWidget />

          {/* Central Focus Action Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TodayTodosWidget />
            <QuickNotesWidget />
          </div>
        </div>

        {/* RIGHT INTERACTIVE METRIC TILES (3 cols on xl) */}
        <div className="xl:col-span-3 space-y-5 order-3">
          <PrioritiesWidget />
          <DailyHabitsWidget />
          <BillsDueWidget />
          <CleaningChoresWidget />
          <HomeProjectsWidget />
        </div>
      </div>

      {/* Floating Rose-Mauve Quick Action Menu */}
      <TodayQuickActionMenu />
    </div>
  );
};
