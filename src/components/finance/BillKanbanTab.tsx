import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { ScheduledPaymentItem } from '../../data/financeHubData';

interface BillKanbanTabProps {
  scheduledPayments: ScheduledPaymentItem[];
  onTogglePaid: (id: string) => void;
  onOpenAddBill: () => void;
}

export const BillKanbanTab: React.FC<BillKanbanTabProps> = ({
  scheduledPayments,
  onTogglePaid,
  onOpenAddBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Bill' | 'Income' | 'Debt'>('ALL');

  // Filter items
  const billItems = useMemo(() => {
    return scheduledPayments.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [scheduledPayments, searchQuery, typeFilter]);

  // Sorting into 3 Kanban columns:
  const dueSoonColumn = useMemo(() => {
    return billItems.filter(item => {
      if (item.status === 'Paid') return false;
      if (
        item.dueDate.includes('Nov 12') ||
        item.dueDate.includes('Nov 13') ||
        item.dueDate.includes('Nov 14') ||
        item.dueDate.includes('Nov 15') ||
        item.dueDate.includes('Nov 16')
      ) {
        return true;
      }
      return item.status === 'Overdue';
    });
  }, [billItems]);

  const upcomingColumn = useMemo(() => {
    return billItems.filter(item => {
      if (item.status === 'Paid') return false;
      if (
        item.dueDate.includes('Nov 12') ||
        item.dueDate.includes('Nov 13') ||
        item.dueDate.includes('Nov 14') ||
        item.dueDate.includes('Nov 15') ||
        item.dueDate.includes('Nov 16')
      ) {
        return false;
      }
      return item.status === 'Upcoming';
    });
  }, [billItems]);

  const paidColumn = useMemo(() => {
    return billItems.filter(item => item.status === 'Paid');
  }, [billItems]);

  // Aggregate KPI metrics from the workbook
  const totalScheduled = 61578.00;
  const totalBillsCount = 115;
  const amountPaidYtd = 46651.58;
  const remainingBalance = 10678.85;

  return (
    <div className="space-y-6">
      {/* KPI Top Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Amount Scheduled</span>
            <Calendar className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${totalScheduled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            Full year 2026 scheduled
          </div>
        </div>

        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Bills Tracked</span>
            <Clock className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            {totalBillsCount}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            15 upcoming · 0 overdue
          </div>
        </div>

        <div className="hud-panel hud-corners p-4 bg-[#e6c3db]/60 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/65">
          <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] flex items-center justify-between">
            <span>Amount Paid (YTD)</span>
            <CheckCircle2 className="w-4 h-4 text-[#be7fab] dark:text-[#efd0e5]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${amountPaidYtd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] mt-1">
            96 payments completed
          </div>
        </div>

        <div className="hud-panel hud-corners p-4 border-[#be7fab]/60">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Remaining Balance</span>
            <DollarSign className="w-4 h-4 text-[#be7fab]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            Outstanding across 2026
          </div>
        </div>
      </div>

      {/* Toolbar / Search / Add Bill */}
      <div className="hud-panel hud-corners p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#d29ec2] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search bill or payee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'Bill' | 'Income' | 'Debt')}
            className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
          >
            <option value="ALL">All Types</option>
            <option value="Bill">Bills Only</option>
            <option value="Debt">Debts & Transfers</option>
            <option value="Income">Income Deposits</option>
          </select>
        </div>

        <button
          onClick={onOpenAddBill}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Scheduled Bill</span>
        </button>
      </div>

      {/* Kanban 3-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Due Soon / Overdue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#be7fab] dark:border-[#efd0e5]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#be7fab] dark:bg-[#efd0e5] shadow-[0_0_8px_rgba(190,127,171,0.7)]" />
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                ⚠️ Due Soon & Overdue
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold text-[#be7fab] dark:text-[#daabcb]">
              {dueSoonColumn.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[300px]">
            {dueSoonColumn.map(item => (
              <div
                key={item.id}
                className="hud-panel hud-corners p-3.5 border-[#be7fab] dark:border-[#efd0e5]/55 hover:border-[#2d1b28] dark:hover:border-[#efd0e5] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-[#2d1b28] dark:text-[#efd0e5]">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono">
                      📅 Due: {item.dueDate}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                    ${item.amountDue.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between">
                  <span className="text-[10px] text-[#120a10] font-semibold bg-[#e6c3db] dark:bg-[#efd0e5] px-2 py-0.5 rounded">
                    {item.dueDate.includes('Nov 12') ? 'Due Today!' : 'Due in < 5 Days'}
                  </span>
                  <button
                    onClick={() => onTogglePaid(item.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#be7fab]" />
                    <span>Mark Paid</span>
                  </button>
                </div>
              </div>
            ))}

            {dueSoonColumn.length === 0 && (
              <div className="p-6 text-center text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl italic">
                No bills due immediately in the next 5 days.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Upcoming / To Pay */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#d29ec2] dark:border-[#daabcb]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#daabcb]" />
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                ⏳ Upcoming / To Pay
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold text-[#be7fab] dark:text-[#daabcb]">
              {upcomingColumn.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[300px]">
            {upcomingColumn.map(item => (
              <div
                key={item.id}
                className="hud-panel hud-corners p-3.5 hover:border-[#be7fab] dark:hover:border-[#daabcb] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-[#2d1b28] dark:text-[#efd0e5]">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono">
                      📅 Due: {item.dueDate}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                    ${item.amountDue.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between">
                  <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                    {item.type} · Scheduled
                  </span>
                  <button
                    onClick={() => onTogglePaid(item.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-colors cursor-pointer"
                  >
                    <Circle className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#be7fab]" />
                    <span>Mark Paid</span>
                  </button>
                </div>
              </div>
            ))}

            {upcomingColumn.length === 0 && (
              <div className="p-6 text-center text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl italic">
                No future scheduled bills found.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Paid / Recent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#be7fab]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#be7fab]" />
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                ✅ Paid / Recent (Completed)
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold text-[#be7fab] dark:text-[#daabcb]">
              {paidColumn.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[300px] max-h-[700px] overflow-y-auto">
            {paidColumn.slice(0, 30).map(item => (
              <div
                key={item.id}
                className="hud-panel p-3.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/65 border-[#d29ec2] dark:border-[#be7fab]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#be7fab] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/75 line-through">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#d29ec2] font-mono">
                        Paid: {item.paidDate || item.dueDate}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#be7fab] dark:text-[#daabcb] tabular-nums">
                    ${(item.amountPaid || item.amountDue).toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/15 flex items-center justify-between text-[10px]">
                  <span className="text-[#be7fab] dark:text-[#daabcb] font-medium">Payment settled</span>
                  <button
                    onClick={() => onTogglePaid(item.id)}
                    className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] text-[10px] cursor-pointer"
                  >
                    Unmark
                  </button>
                </div>
              </div>
            ))}

            {paidColumn.length > 30 && (
              <div className="text-center py-2 text-[11px] text-[#2d1b28]/65 dark:text-[#d29ec2]">
                Showing recent 30 of {paidColumn.length} paid records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
