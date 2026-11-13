import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const MiniCalendar: React.FC = () => {
  const { importantDates, bills, setActivePage, setSelectedPlannerDate, setActivePlannerTab } = useBinder();

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

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

  const getDayDots = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvent = importantDates.some((d) => d.date === formatted);
    const hasBill = bills.some((b) => b.dueDate === formatted);
    return { hasEvent, hasBill };
  };

  const formattedSelected = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const eventsOnSelected = importantDates.filter((d) => d.date === formattedSelected);
  const billsOnSelected = bills.filter((b) => b.dueDate === formattedSelected);

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#d29ec2] dark:border-[#d29ec2]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 border border-[#be7fab]/50 text-[#be7fab] dark:text-[#daabcb]">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const now = new Date();
              setCurrentMonth(now.getMonth());
              setCurrentYear(now.getFullYear());
              setSelectedDay(now.getDate());
            }}
            className="text-[10px] font-bold text-[#2d1b28] dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] px-2 py-0.5 rounded-md hover:bg-[#be7fab]/20 transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-md hover:bg-[#be7fab]/20"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-md hover:bg-[#be7fab]/20"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="my-2.5">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#2d1b28]/70 dark:text-[#e6c3db]/75 pb-1">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className={idx === 0 || idx === 6 ? 'text-[#be7fab]' : ''}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="h-7" />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              currentYear === today.getFullYear() &&
              currentMonth === today.getMonth() &&
              dayNum === today.getDate();
            const isSelected = selectedDay === dayNum;
            const { hasEvent, hasBill } = getDayDots(dayNum);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-7 rounded-lg text-xs font-semibold font-mono tabular-nums flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.55)] font-bold'
                    : isToday
                    ? 'bg-[#e6c3db] dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] ring-1 ring-[#be7fab] font-bold'
                    : 'text-[#2d1b28] dark:text-[#efd0e5] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/20'
                }`}
              >
                <span>{dayNum}</span>
                <div className="flex gap-0.5 absolute bottom-0.5">
                  {hasEvent && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#120a10]' : 'bg-[#2d1b28] dark:bg-[#efd0e5]'}`} />
                  )}
                  {hasBill && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#120a10]' : 'bg-[#be7fab]'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="pt-2.5 border-t border-[#d29ec2] dark:border-[#d29ec2]/25 bg-[#e6c3db]/75 dark:bg-[#120a10]/60 -mx-4 -mb-4 p-3 rounded-b-2xl">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-[#2d1b28] dark:text-[#e6c3db]">
            {monthNames[currentMonth].slice(0, 3)} {selectedDay} Agenda:
          </span>
          <button
            onClick={() => {
              const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
              setSelectedPlannerDate(formatted);
              setActivePlannerTab('Daily');
              setActivePage('planner');
            }}
            className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline flex items-center gap-0.5"
          >
            Open Day <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {eventsOnSelected.length === 0 && billsOnSelected.length === 0 ? (
          <p className="text-[11px] text-[#2d1b28]/65 dark:text-[#e6c3db]/60 italic">No scheduled events or bills</p>
        ) : (
          <div className="space-y-1">
            {eventsOnSelected.map((ev) => (
              <div key={ev.id} className="text-[11px] text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#be7fab] shrink-0" />
                <span className="font-medium truncate">{ev.title}</span>
              </div>
            ))}
            {billsOnSelected.map((b) => (
              <div key={b.id} className="text-[11px] text-[#2d1b28] dark:text-[#daabcb] flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#be7fab] dark:bg-[#d29ec2] shrink-0" />
                <span className="font-medium truncate">Due: {b.title} (${b.amount.toFixed(2)})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
