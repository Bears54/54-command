import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Gift,
  Wallet,
  Heart,
  CalendarDays,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { ImportantDate } from '../../types/binder';

export const PlannerPage: React.FC = () => {
  const {
    importantDates,
    addImportantDate,
    deleteImportantDate,
    todos,
    toggleTodo,
    habits,
    toggleHabit,
    bills,
    toggleBillPaid,
    cleaningChores,
    toggleChore,
    calendarNotes,
    updateCalendarNote,
    hourlySchedule,
    updateHourlySlot,
    selectedPlannerDate,
    setSelectedPlannerDate,
    activePlannerTab,
    setActivePlannerTab,
    celebrate,
  } = useBinder();

  const [currentYear, setCurrentYear] = useState<number>(() => {
    return parseInt(selectedPlannerDate.split('-')[0]) || 2026;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return (parseInt(selectedPlannerDate.split('-')[1]) || 11) - 1;
  });

  const [newDateTitle, setNewDateTitle] = useState('');
  const [newDateValue, setNewDateValue] = useState('2026-11-20');
  const [newDateType, setNewDateType] = useState<ImportantDate['type']>('Appointment');
  const [newReminderDays, setNewReminderDays] = useState(3);

  const hourlySlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
    '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
    '12:00 AM',
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const changeDay = (delta: number) => {
    const [y, m, d] = selectedPlannerDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + delta);
    const newStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    setSelectedPlannerDate(newStr);
    setCurrentYear(dateObj.getFullYear());
    setCurrentMonth(dateObj.getMonth());
  };

  const jumpToToday = () => {
    setSelectedPlannerDate('2026-11-12');
    setCurrentYear(2026);
    setCurrentMonth(10);
  };

  const getSelectedDayOfWeek = () => {
    const [y, m, d] = selectedPlannerDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return daysOfWeek[dateObj.getDay()];
  };

  const datesOnSelected = importantDates.filter((d) => d.date === selectedPlannerDate);
  const tasksOnSelected = todos.filter((t) => t.dueDate === selectedPlannerDate);
  const billsOnSelected = bills.filter((b) => b.dueDate === selectedPlannerDate);

  const handleAddImportantDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateTitle.trim()) return;
    addImportantDate({
      title: newDateTitle.trim(),
      date: newDateValue,
      type: newDateType,
      reminderDaysBefore: Number(newReminderDays),
    });
    setNewDateTitle('');
    celebrate();
  };

  const jumpFromMonthToDaily = (dayNum: number) => {
    const newStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedPlannerDate(newStr);
    setActivePlannerTab('Daily');
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
            Planner Command Hub
          </h2>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
            Hourly timelines, multi-year navigations, interactive monthly grids & milestone dates
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl overflow-x-auto max-w-full">
          {(['Daily', 'Weekly', 'Monthly', 'Yearly', 'Important Dates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePlannerTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activePlannerTab === tab
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                  : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DAILY PLANNER */}
      {activePlannerTab === 'Daily' && (
        <div className="space-y-6">
          <div className="hud-panel hud-corners p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDay(-1)}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-lg transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 border border-[#be7fab]/40 text-[#be7fab] dark:text-[#daabcb]">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-tight">
                    {getSelectedDayOfWeek()}, {selectedPlannerDate}
                  </h3>
                  <span className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                    {selectedPlannerDate === '2026-11-12' ? '★ Active Mission Date (2026)' : 'Browsing planner date'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => changeDay(1)}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-lg transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedPlannerDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedPlannerDate(e.target.value);
                    const [y, m] = e.target.value.split('-').map(Number);
                    setCurrentYear(y);
                    setCurrentMonth(m - 1);
                  }
                }}
                className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                title="Jump to any date in past or future years"
              />
              <button
                onClick={jumpToToday}
                className="px-3 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Hourly Schedule */}
            <div className="lg:col-span-7 hud-panel hud-corners washi-tape-top p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                      Hourly Schedule (8:00 AM – 12:00 AM)
                    </h3>
                    <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70">
                      Type directly in any time slot to schedule your day
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono font-bold">AUTO-SAVE</span>
              </div>

              <div className="divide-y divide-[#d29ec2]/35 dark:divide-[#be7fab]/15 max-h-[680px] overflow-y-auto pr-1">
                {hourlySlots.map((slot) => {
                  const daySlots = hourlySchedule[selectedPlannerDate] || {};
                  const currentSlotText = daySlots[slot] || '';

                  return (
                    <div key={slot} className="py-2 flex items-center gap-3 group">
                      <div className="w-20 shrink-0 text-right font-mono text-xs font-bold text-[#be7fab] dark:text-[#d29ec2] tabular-nums">
                        {slot}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={currentSlotText}
                          onChange={(e) => updateHourlySlot(selectedPlannerDate, slot, e.target.value)}
                          placeholder="— Open time block"
                          className="w-full px-2.5 py-1.5 text-xs text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/35 dark:placeholder:text-[#d29ec2]/35 bg-transparent hover:bg-[#e6c3db]/50 dark:hover:bg-[#120a10]/60 focus:bg-[#efd0e5]/60 dark:focus:bg-[#120a10] border border-transparent hover:border-[#d29ec2] dark:hover:border-[#be7fab]/30 focus:border-[#be7fab] rounded-lg transition-all focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Sections */}
            <div className="lg:col-span-5 space-y-4">
              {/* Important Dates */}
              <div className="hud-panel hud-corners p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wide">
                      Important Dates
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#120a10] bg-[#daabcb] px-2 py-0.5 rounded-full">
                    {datesOnSelected.length}
                  </span>
                </div>

                {datesOnSelected.length > 0 ? (
                  <div className="space-y-1.5">
                    {datesOnSelected.map((d) => (
                      <div
                        key={d.id}
                        className="p-2 rounded-lg bg-[#be7fab]/15 border border-[#be7fab]/40 text-xs text-[#2d1b28] dark:text-[#efd0e5] font-semibold flex items-center justify-between"
                      >
                        <span>{d.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-white dark:bg-[#120a10] rounded text-[#be7fab] dark:text-[#daabcb] font-bold border border-[#d29ec2]/50 dark:border-transparent">
                          {d.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#2d1b28]/60 dark:text-[#e6c3db]/60 italic py-1">No birthdays or milestones on this date.</p>
                )}
              </div>

              {/* Tasks Due */}
              <div className="hud-panel hud-corners p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wide">
                      Tasks Due Today
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#be7fab]/25 border border-[#be7fab]/45 px-2 py-0.5 rounded-full tabular-nums">
                    {tasksOnSelected.filter((t) => t.completed).length}/{tasksOnSelected.length} Done
                  </span>
                </div>

                <div className="space-y-1.5">
                  {tasksOnSelected.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTodo(t.id)}
                      className="p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-xs flex items-center gap-2 cursor-pointer hover:border-[#be7fab] transition-colors"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]/50 shrink-0" />
                      )}
                      <span className={`truncate ${t.completed ? 'line-through text-[#2d1b28]/50 dark:text-[#d29ec2]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                  {tasksOnSelected.length === 0 && (
                    <p className="text-xs text-[#2d1b28]/60 dark:text-[#e6c3db]/60 italic py-1">No tasks scheduled for this date.</p>
                  )}
                </div>
              </div>

              {/* Daily Habits */}
              <div className="hud-panel hud-corners p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wide">
                      Daily Habits
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#be7fab]/25 border border-[#be7fab]/45 px-2 py-0.5 rounded-full tabular-nums">
                    {habits.filter((h) => h.completedToday).length}/{habits.length} Done
                  </span>
                </div>

                <div className="space-y-1.5">
                  {habits.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      onClick={() => toggleHabit(h.id)}
                      className="p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-xs flex items-center justify-between cursor-pointer hover:border-[#be7fab] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {h.completedToday ? (
                          <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]/50 shrink-0" />
                        )}
                        <span className={`truncate ${h.completedToday ? 'line-through text-[#2d1b28]/50 dark:text-[#d29ec2]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                          {h.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-bold tabular-nums shrink-0">
                        {h.streak}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bills Due */}
              <div className="hud-panel hud-corners p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wide">
                      Bills Due on Date
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#be7fab]/20 px-2 py-0.5 rounded-full">
                    {billsOnSelected.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {billsOnSelected.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => toggleBillPaid(b.id)}
                      className="p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-xs flex items-center justify-between cursor-pointer hover:border-[#be7fab] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {b.isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]/50 shrink-0" />
                        )}
                        <span className={`truncate ${b.isPaid ? 'line-through text-[#2d1b28]/50 dark:text-[#d29ec2]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                          {b.title}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#2d1b28] dark:text-[#efd0e5] tabular-nums shrink-0">
                        ${b.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {billsOnSelected.length === 0 && (
                    <p className="text-xs text-[#2d1b28]/60 dark:text-[#e6c3db]/60 italic py-1">No bills due on this date.</p>
                  )}
                </div>
              </div>

              {/* Chores */}
              <div className="hud-panel hud-corners p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wide">
                      Cleaning Chores
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#be7fab]/25 border border-[#be7fab]/45 px-2 py-0.5 rounded-full tabular-nums">
                    {cleaningChores.filter((c) => c.completed).length}/{cleaningChores.length} Done
                  </span>
                </div>

                <div className="space-y-1.5">
                  {cleaningChores.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => toggleChore(c.id)}
                      className="p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-xs flex items-center gap-2 cursor-pointer hover:border-[#be7fab] transition-colors"
                    >
                      {c.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]/50 shrink-0" />
                      )}
                      <span className={`truncate ${c.completed ? 'line-through text-[#2d1b28]/50 dark:text-[#d29ec2]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                        {c.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY PLANNER */}
      {activePlannerTab === 'Weekly' && (
        <div className="hud-panel hud-corners p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Week Overview (Sunday – Saturday)
            </h3>
            <span className="text-xs text-[#be7fab] dark:text-[#daabcb] font-mono font-bold">
              Week 46 of {currentYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Sun 8', 'Mon 9', 'Tue 10', 'Wed 11', 'Thu 12 (Today)', 'Fri 13', 'Sat 14'].map((dayLabel, idx) => (
              <div
                key={dayLabel}
                className={`p-3 rounded-xl min-h-[260px] flex flex-col justify-between border transition-all ${
                  idx === 4
                    ? 'bg-[#be7fab]/15 border-[#be7fab] ring-1 ring-[#be7fab]/50 shadow-[0_0_20px_rgba(190,127,171,0.25)]'
                    : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border-[#d29ec2]/60 dark:border-[#be7fab]/25'
                }`}
              >
                <div className="pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 text-center">
                  <span className={`text-xs font-bold ${idx === 4 ? 'text-[#2d1b28] dark:text-[#efd0e5]' : 'text-[#2d1b28]/80 dark:text-[#e6c3db]'}`}>
                    {dayLabel}
                  </span>
                </div>

                <div className="flex-1 py-2 space-y-1.5 text-[11px]">
                  {idx === 4 ? (
                    <>
                      <div className="p-1.5 rounded-lg bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] font-semibold border border-[#be7fab]/50">
                        09:30 AM Q4 Roadmap
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#d29ec2]/30 dark:bg-[#d29ec2]/20 text-[#2d1b28] dark:text-[#efd0e5] font-semibold border border-[#d29ec2]/60 dark:border-[#d29ec2]/45">
                        03:30 PM Brand Guide
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#daabcb]/25 dark:bg-[#daabcb]/15 text-[#2d1b28] dark:text-[#efd0e5] font-semibold border border-[#daabcb]/60 dark:border-[#daabcb]/40">
                        Bills: Internet due
                      </div>
                    </>
                  ) : idx === 6 ? (
                    <div className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] font-semibold border border-[#be7fab]/45">
                      Mom's 60th Birthday Celebration!
                    </div>
                  ) : (
                    <div className="text-[#2d1b28]/45 dark:text-[#d29ec2]/50 italic text-[10px] text-center pt-8">
                      Standard focus
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const days = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'];
                    setSelectedPlannerDate(days[idx]);
                    setActivePlannerTab('Daily');
                  }}
                  className="w-full text-center text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20"
                >
                  Open Day →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY CALENDAR */}
      {activePlannerTab === 'Monthly' && (
        <div className="hud-panel hud-corners p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#be7fab]/20 border border-[#be7fab]/40 text-[#be7fab] dark:text-[#daabcb]">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h3 className="font-display text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentMonth(10);
                  setCurrentYear(2026);
                }}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#e6c3db]/70 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 hover:border-[#be7fab] dark:hover:border-[#efd0e5] text-[#2d1b28] dark:text-[#efd0e5]"
              >
                This Month
              </button>

              <button
                onClick={nextMonth}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80">
            Click any date number (e.g., <strong className="text-[#2d1b28] dark:text-[#efd0e5]">12</strong>) to open its Daily Planner, or click inside any square to type notes directly.
          </p>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#2d1b28]/70 dark:text-[#d29ec2] uppercase tracking-wider pb-1">
            <div className="text-[#be7fab]">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-[#be7fab]">Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-[#e6c3db]/25 dark:bg-[#120a10]/35 rounded-xl border border-dashed border-[#d29ec2]/60 dark:border-[#be7fab]/20" />
            ))}

            {[...Array(daysInCurrentMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = currentYear === 2026 && currentMonth === 10 && dayNum === 12;
              const isSelected = selectedPlannerDate === dateStr;

              const noteText = calendarNotes[dateStr] || '';
              const events = importantDates.filter((d) => d.date === dateStr);
              const dayBills = bills.filter((b) => b.dueDate === dateStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 rounded-xl flex flex-col justify-between transition-all border group ${
                    isToday
                      ? 'bg-[#be7fab]/20 border-[#be7fab] ring-1 ring-[#be7fab]/60 shadow-[0_0_16px_rgba(190,127,171,0.3)]'
                      : isSelected
                      ? 'bg-[#e6c3db]/80 dark:bg-[#241420] border-[#be7fab] dark:border-[#daabcb]'
                      : 'bg-[#e6c3db]/40 dark:bg-[#120a10]/75 hover:bg-[#e6c3db]/70 dark:hover:bg-[#1c0f19] border-[#d29ec2]/60 dark:border-[#be7fab]/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => jumpFromMonthToDaily(dayNum)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold transition-transform hover:scale-110 active:scale-90 ${
                        isToday
                          ? 'bg-[#be7fab] text-[#120a10] shadow-xs'
                          : 'text-[#2d1b28] dark:text-[#efd0e5] hover:bg-[#be7fab]/30'
                      }`}
                      title={`Jump to Daily Planner for ${dateStr}`}
                    >
                      {dayNum}
                    </button>

                    <div className="flex items-center gap-1">
                      {events.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#be7fab]" title={events.map((e) => e.title).join(', ')} />
                      )}
                      {dayBills.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#2d1b28] dark:bg-[#efd0e5]" title={dayBills.map((b) => b.title).join(', ')} />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 my-1">
                    <textarea
                      value={noteText}
                      onChange={(e) => updateCalendarNote(dateStr, e.target.value)}
                      placeholder="Type note..."
                      rows={2}
                      className="w-full h-full text-[10px] leading-tight text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/35 dark:placeholder:text-[#d29ec2]/35 bg-transparent resize-none focus:outline-none focus:bg-white/75 dark:focus:bg-[#120a10] rounded p-1 border border-transparent focus:border-[#be7fab]/50"
                    />
                  </div>

                  {events.length > 0 && (
                    <div className="text-[9px] font-bold text-[#120a10] bg-[#daabcb] px-1.5 py-0.5 rounded truncate">
                      {events[0].title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: YEARLY CALENDAR */}
      {activePlannerTab === 'Yearly' && (
        <div className="hud-panel hud-corners p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
            <h3 className="font-display text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Yearly Overview · {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentYear(currentYear - 1)}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">{currentYear}</span>
              <button
                onClick={() => setCurrentYear(currentYear + 1)}
                className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monthNames.map((mName, mIdx) => {
              const daysInM = new Date(currentYear, mIdx + 1, 0).getDate();
              const startDay = new Date(currentYear, mIdx, 1).getDay();

              return (
                <div key={mName} className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-2xl border border-[#d29ec2]/60 dark:border-[#be7fab]/30">
                  <div className="text-center font-display font-bold text-xs text-[#2d1b28] dark:text-[#efd0e5] pb-1 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                    {mName}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] text-[#2d1b28]/60 dark:text-[#d29ec2]/70 font-bold mt-1">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 mt-1 text-center">
                    {[...Array(startDay)].map((_, i) => (
                      <div key={`offset-${i}`} className="h-4" />
                    ))}
                    {[...Array(daysInM)].map((_, dIdx) => {
                      const dNum = dIdx + 1;
                      const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
                      const hasEvent = importantDates.some((e) => e.date === dateStr);
                      const isToday = currentYear === 2026 && mIdx === 10 && dNum === 12;

                      return (
                        <button
                          key={dNum}
                          onClick={() => {
                            setSelectedPlannerDate(dateStr);
                            setActivePlannerTab('Daily');
                          }}
                          className={`h-4 rounded text-[9px] font-semibold flex items-center justify-center transition-all ${
                            isToday
                              ? 'bg-[#be7fab] text-[#120a10] font-bold'
                              : hasEvent
                              ? 'bg-[#be7fab]/25 dark:bg-[#daabcb]/30 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab]/60 dark:border-[#daabcb]/60 font-bold'
                              : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:bg-[#be7fab]/25'
                          }`}
                          title={dateStr}
                        >
                          {dNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: IMPORTANT DATES */}
      {activePlannerTab === 'Important Dates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 hud-panel hud-corners washi-tape-top p-5">
            <div className="pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-4">
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
                <span>Register Milestone or Appointment</span>
              </h3>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
                Saved dates automatically appear on Monthly, Yearly, and Daily calendars
              </p>
            </div>

            <form onSubmit={handleAddImportantDate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Title / Event Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mom's Birthday, Doctor Checkup, Car Smog Check"
                  value={newDateTitle}
                  onChange={(e) => setNewDateTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDateValue}
                    onChange={(e) => setNewDateValue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Event Type
                  </label>
                  <select
                    value={newDateType}
                    onChange={(e) => setNewDateType(e.target.value as ImportantDate['type'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Reminder Days Before
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={newReminderDays}
                  onChange={(e) => setNewReminderDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
              >
                Save to Calendars
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 hud-panel hud-corners p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Registered Milestones & Reminders ({importantDates.length})
              </h3>
              <span className="text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
                Integrated across all views
              </span>
            </div>

            <div className="space-y-2.5">
              {importantDates.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border border-[#d29ec2]/60 dark:border-[#be7fab]/30 flex items-center justify-between hover:border-[#be7fab] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">{d.title}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#be7fab]/35">
                        {d.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
                      Date: <strong className="text-[#2d1b28] dark:text-[#efd0e5]">{d.date}</strong> · Reminder {d.reminderDaysBefore} days before
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlannerDate(d.date);
                        setActivePlannerTab('Daily');
                      }}
                      className="text-[11px] font-semibold text-[#120a10] bg-[#daabcb] hover:bg-[#efd0e5] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Jump to Day →
                    </button>
                    <button
                      onClick={() => deleteImportantDate(d.id)}
                      className="p-1.5 text-[#be7fab] dark:text-[#d29ec2]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors"
                      title="Remove date"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
