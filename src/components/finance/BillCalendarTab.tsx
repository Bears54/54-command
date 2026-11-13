import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
} from 'lucide-react';
import { ScheduledPaymentItem } from '../../data/financeHubData';

interface BillCalendarTabProps {
  scheduledPayments: ScheduledPaymentItem[];
  onTogglePaid: (id: string) => void;
  onOpenAddBill: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const BillCalendarTab: React.FC<BillCalendarTabProps> = ({
  scheduledPayments,
  onTogglePaid,
  onOpenAddBill,
}) => {
  // Default to November 2026 as in the attached workbook
  const [selectedMonth, setSelectedMonth] = useState(10); // 10 = November (0-indexed)
  const [selectedYear] = useState(2026);

  // Filters
  const [showIncome, setShowIncome] = useState(true);
  const [showBills, setShowBills] = useState(true);
  const [showDebts, setShowDebts] = useState(true);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  const monthShort = MONTH_SHORT[selectedMonth];
  const monthName = MONTH_NAMES[selectedMonth];

  // Calendar math for grid
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday

  // Filter payments for this month
  const monthItems = useMemo(() => {
    return scheduledPayments.filter(item => {
      const matchesMonth = item.dueDate.startsWith(monthShort);
      if (!matchesMonth) return false;

      if (!showIncome && item.type === 'Income') return false;
      if (!showBills && item.type === 'Bill') return false;
      if (!showDebts && item.type === 'Debt') return false;
      if (showUnpaidOnly && item.status === 'Paid') return false;

      return true;
    });
  }, [scheduledPayments, monthShort, showIncome, showBills, showDebts, showUnpaidOnly]);

  // Map items by day number (1 - 31)
  const itemsByDay = useMemo(() => {
    const map: Record<number, ScheduledPaymentItem[]> = {};
    monthItems.forEach(item => {
      const parts = item.dueDate.split(' ');
      if (parts.length >= 2) {
        const dayNum = parseInt(parts[1].replace(',', ''));
        if (!isNaN(dayNum)) {
          if (!map[dayNum]) map[dayNum] = [];
          map[dayNum].push(item);
        }
      }
    });
    return map;
  }, [monthItems]);

  // Upcoming within next 5 days (from Nov 12, 2026)
  const upcomingNext5Days = useMemo(() => {
    return scheduledPayments.filter(item => {
      if (item.status === 'Paid') return false;
      if (!item.dueDate.includes('Nov')) return false;
      const parts = item.dueDate.split(' ');
      if (parts.length >= 2) {
        const day = parseInt(parts[1].replace(',', ''));
        return day >= 12 && day <= 20;
      }
      return false;
    });
  }, [scheduledPayments]);

  // Month totals
  const totalIncome = monthItems
    .filter(i => i.type === 'Income')
    .reduce((sum, i) => sum + i.amountDue, 0);

  const totalBills = monthItems
    .filter(i => i.type === 'Bill' || i.type === 'Debt')
    .reduce((sum, i) => sum + i.amountDue, 0);

  const totalPaid = monthItems
    .filter(i => i.status === 'Paid' && (i.type === 'Bill' || i.type === 'Debt'))
    .reduce((sum, i) => sum + (i.amountPaid || i.amountDue), 0);

  const stillToPay = totalBills - totalPaid;

  return (
    <div className="space-y-6">
      {/* Top Banner / Month Selector & Settings */}
      <div className="hud-panel hud-corners p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMonth(prev => (prev > 0 ? prev - 1 : 11))}
                className="p-1.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-[#be7fab] dark:text-[#daabcb]" />
                <span>{monthName} {selectedYear} Bill Calendar</span>
              </h2>
              <button
                onClick={() => setSelectedMonth(prev => (prev < 11 ? prev + 1 : 0))}
                className="p-1.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
              Interactive due-date schedule with paid checks, income deposits, and forecast cash flow
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddBill}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Due Date / Bill</span>
            </button>
          </div>
        </div>

        {/* Legend & Filter Toggles Strip */}
        <div className="mt-4 pt-3 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[#2d1b28]/80 dark:text-[#e6c3db]">
            <span className="font-semibold text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] uppercase tracking-wider">Legend:</span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2d1b28] dark:bg-[#efd0e5]" />
              <span>Income</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#be7fab]" />
              <span>Bill</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#daabcb]" />
              <span>Debt / Transfer</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-[#be7fab]" />
              <span>Paid</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Circle className="w-3 h-3 text-[#be7fab] dark:text-[#d29ec2]" />
              <span>Upcoming</span>
            </span>
          </div>

          {/* Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db] cursor-pointer">
              <input
                type="checkbox"
                checked={showIncome}
                onChange={(e) => setShowIncome(e.target.checked)}
                className="rounded accent-[#be7fab]"
              />
              <span>Income</span>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db] cursor-pointer">
              <input
                type="checkbox"
                checked={showBills}
                onChange={(e) => setShowBills(e.target.checked)}
                className="rounded accent-[#be7fab]"
              />
              <span>Bills</span>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db] cursor-pointer">
              <input
                type="checkbox"
                checked={showDebts}
                onChange={(e) => setShowDebts(e.target.checked)}
                className="rounded accent-[#be7fab]"
              />
              <span>Debts</span>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-[#2d1b28] dark:text-[#efd0e5] cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={showUnpaidOnly}
                onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                className="rounded accent-[#be7fab]"
              />
              <span className="font-semibold">Unpaid Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Grid & Side Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Monthly Calendar View (3 Cols on Desktop) */}
        <div className="lg:col-span-3 hud-panel hud-corners p-4 sm:p-5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] uppercase tracking-wider pb-2 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[105px] p-1.5 bg-[#e6c3db]/25 dark:bg-[#120a10]/40 rounded-lg opacity-45" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayItems = itemsByDay[day] || [];
              const isToday = selectedYear === 2026 && selectedMonth === 10 && day === 12;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[85px] sm:min-h-[105px] p-1.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-[#e6c3db] dark:bg-[#be7fab]/20 border-[#be7fab] dark:border-[#efd0e5] ring-1 ring-[#be7fab]'
                      : dayItems.length > 0
                        ? 'bg-[#efd0e5]/45 dark:bg-[#120a10]/85 border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] dark:hover:border-[#daabcb]'
                        : 'bg-[#e6c3db]/30 dark:bg-[#120a10]/45 border-[#d29ec2]/50 dark:border-[#be7fab]/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isToday ? 'text-[#120a10] bg-[#be7fab] dark:bg-[#efd0e5] px-1.5 rounded' : 'text-[#2d1b28] dark:text-[#e6c3db]'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-semibold text-[#2d1b28] dark:text-[#efd0e5] uppercase">Today</span>
                    )}
                  </div>

                  {/* Items for this day */}
                  <div className="my-1 space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                    {dayItems.map(item => {
                      const isPaid = item.status === 'Paid';
                      const isIncome = item.type === 'Income';

                      return (
                        <div
                          key={item.id}
                          onClick={() => onTogglePaid(item.id)}
                          className={`group flex items-center justify-between gap-1 p-1 rounded text-[10px] cursor-pointer transition-colors ${
                            isPaid
                              ? 'bg-white/75 dark:bg-[#1c0f19] text-[#2d1b28]/60 dark:text-[#d29ec2]/75 border border-[#d29ec2]/60 dark:border-[#be7fab]/20 opacity-85'
                              : isIncome
                                ? 'bg-white dark:bg-[#efd0e5]/15 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab] dark:border-[#efd0e5]/45 font-semibold'
                                : 'bg-[#e6c3db] dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab] dark:border-[#be7fab]/55 font-semibold'
                          }`}
                          title={`${item.name} - $${item.amountDue.toFixed(2)} (${item.status}) - Click to toggle status`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            {isPaid ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#be7fab] shrink-0" />
                            ) : (
                              <Circle className="w-2.5 h-2.5 text-[#be7fab] dark:text-[#daabcb] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5] shrink-0" />
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className="font-mono tabular-nums shrink-0 font-bold">
                            ${Math.round(item.amountDue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Daily count pill if multiple */}
                  {dayItems.length > 2 && (
                    <div className="text-[9px] text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono text-right">
                      {dayItems.length} items
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Upcoming Next 5 Days & Weekly Forecast */}
        <div className="space-y-6">
          {/* Upcoming within 5 days */}
          <div className="hud-panel hud-corners p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
                <span>Upcoming (Next 5 Days)</span>
              </h3>
              <span className="text-[10px] font-mono text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/25 px-1.5 py-0.5 rounded border border-[#be7fab] dark:border-[#be7fab]/45 font-bold">
                From Nov 12
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {upcomingNext5Days.map(item => (
                <div
                  key={item.id}
                  className="p-2.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-lg border border-[#d29ec2] dark:border-[#be7fab]/35 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono">
                      📅 Due: {item.dueDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                      ${item.amountDue.toFixed(2)}
                    </div>
                    <button
                      onClick={() => onTogglePaid(item.id)}
                      className="text-[10px] text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}

              {upcomingNext5Days.length === 0 && (
                <p className="text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic py-2">
                  No upcoming bills due in the next 5 days.
                </p>
              )}
            </div>
          </div>

          {/* Monthly Forecast Summary */}
          <div className="hud-panel hud-corners p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              {monthName} Forecast & Totals
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#2d1b28]/80 dark:text-[#e6c3db]">Total Income:</span>
                <span className="font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#2d1b28]/80 dark:text-[#e6c3db]">Total Scheduled Bills:</span>
                <span className="font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${totalBills.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#2d1b28]/80 dark:text-[#e6c3db]">Paid So Far:</span>
                <span className="font-mono font-semibold text-[#be7fab] dark:text-[#daabcb] tabular-nums">
                  ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <span className="font-semibold text-[#2d1b28] dark:text-[#e6c3db]">Still To Pay:</span>
                <span className="font-mono font-bold text-[#be7fab] tabular-nums">
                  ${stillToPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-[#2d1b28] dark:text-[#efd0e5]">Net Left Over:</span>
                <span className="font-mono font-bold tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">
                  ${(totalIncome - totalBills).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
