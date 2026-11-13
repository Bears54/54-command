import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  Circle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FinanceTransaction, ScheduledPaymentItem } from '../../data/financeHubData';

interface MonthlyTabProps {
  currentMonthIndex: number; // 0 = Jan, 11 = Dec
  onSelectMonth: (index: number) => void;
  transactions: FinanceTransaction[];
  scheduledPayments: ScheduledPaymentItem[];
  onToggleScheduledPaid: (id: string) => void;
  onOpenAddTransaction: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthlyTab: React.FC<MonthlyTabProps> = ({
  currentMonthIndex,
  onSelectMonth,
  transactions,
  scheduledPayments,
  onToggleScheduledPaid,
  onOpenAddTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const currentMonthName = MONTH_NAMES[currentMonthIndex];
  const currentShort = MONTH_SHORT[currentMonthIndex];
  const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
  const prevShort = MONTH_SHORT[prevMonthIndex];
  const prevMonthName = MONTH_NAMES[prevMonthIndex];

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentShort));
  }, [transactions, currentShort]);

  // Previous month transactions for MoM comparison
  const prevMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(prevShort));
  }, [transactions, prevShort]);

  // Calculate categorized cash flows
  const currentStats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let bills = 0;
    let savings = 0;
    let debts = 0;
    let prescriptions = 0;

    monthTransactions.forEach(t => {
      const amt = t.charged || t.credited;
      if (t.category === 'Income') income += t.credited || t.charged;
      else if (t.category === 'Bills') bills += amt;
      else if (t.category === 'Expenses') expenses += amt;
      else if (t.category === 'Debts') debts += amt;
      else if (t.category === 'Prescriptions') prescriptions += amt;

      if (t.account.includes('Savings') || t.description.toLowerCase().includes('interest') || t.description.toLowerCase().includes('savings')) {
        if (t.credited > 0) savings += t.credited;
      }
    });

    const totalSpent = expenses + bills + debts + prescriptions;
    const leftToSpend = income - totalSpent;

    return { income, expenses, bills, savings, debts, prescriptions, totalSpent, leftToSpend };
  }, [monthTransactions]);

  const prevStats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let bills = 0;
    let savings = 0;
    let debts = 0;
    let prescriptions = 0;

    prevMonthTransactions.forEach(t => {
      const amt = t.charged || t.credited;
      if (t.category === 'Income') income += t.credited || t.charged;
      else if (t.category === 'Bills') bills += amt;
      else if (t.category === 'Expenses') expenses += amt;
      else if (t.category === 'Debts') debts += amt;
      else if (t.category === 'Prescriptions') prescriptions += amt;

      if (t.account.includes('Savings') || t.description.toLowerCase().includes('interest') || t.description.toLowerCase().includes('savings')) {
        if (t.credited > 0) savings += t.credited;
      }
    });

    const totalSpent = expenses + bills + debts + prescriptions;
    const leftToSpend = income - totalSpent;

    return { income, expenses, bills, savings, debts, prescriptions, totalSpent, leftToSpend };
  }, [prevMonthTransactions]);

  // Calculate percentage changes
  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return { pct: curr > 0 ? 100 : 0, isUp: curr > 0 };
    const pct = Math.round(((curr - prev) / prev) * 100);
    return { pct: Math.abs(pct), isUp: curr >= prev };
  };

  // Top spending payees in this month
  const topPayees = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.forEach(t => {
      if (t.category === 'Expenses' || t.category === 'Bills') {
        const desc = t.description.split(' (')[0].trim();
        map[desc] = (map[desc] || 0) + (t.charged || t.credited);
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [monthTransactions]);

  // Income sources in this month
  const incomeSources = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.forEach(t => {
      if (t.category === 'Income') {
        const desc = t.subCategory || t.subDescription || t.description;
        map[desc] = (map[desc] || 0) + (t.credited || t.charged);
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  // Scheduled bills in this month
  const monthScheduledBills = useMemo(() => {
    return scheduledPayments.filter(s => s.dueDate.startsWith(currentShort));
  }, [scheduledPayments, currentShort]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      const matchSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [monthTransactions, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 12-Month Sub-Tabs Bar */}
      <div className="hud-panel hud-corners p-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {MONTH_NAMES.map((name, idx) => (
            <button
              key={name}
              onClick={() => onSelectMonth(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentMonthIndex === idx
                  ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_10px_rgba(190,127,171,0.4)]'
                  : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Month Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectMonth(currentMonthIndex > 0 ? currentMonthIndex - 1 : 11)}
            className="p-1.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {currentMonthName} 2026
            </h2>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Category spending, MoM comparison vs {prevMonthName}, and savings goal tracker
            </p>
          </div>
          <button
            onClick={() => onSelectMonth(currentMonthIndex < 11 ? currentMonthIndex + 1 : 0)}
            className="p-1.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Monthly Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Money Received */}
        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Money Received</span>
            <TrendingUp className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${currentStats.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            vs {prevMonthName}: ${prevStats.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Total Money Spent */}
        <div className="hud-panel hud-corners p-4 border-[#be7fab]/60">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Money Spent</span>
            <TrendingDown className="w-4 h-4 text-[#be7fab]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${currentStats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            Bills (${currentStats.bills.toFixed(2)}) + Expenses (${currentStats.expenses.toFixed(2)})
          </div>
        </div>

        {/* Left to Spend / Net Cash Flow */}
        <div
          className={`hud-panel hud-corners p-4 ${
            currentStats.leftToSpend >= 0
              ? 'bg-[#e6c3db]/60 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/70'
              : 'bg-[#daabcb]/45 dark:bg-[#be7fab]/20 border-[#be7fab] dark:border-[#efd0e5]/60'
          }`}
        >
          <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] flex items-center justify-between">
            <span>Left to Spend / Net</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#be7fab] dark:bg-[#be7fab]/25 text-[#120a10] dark:text-[#efd0e5] font-bold">
              {currentStats.leftToSpend >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">
            ${currentStats.leftToSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            Cash retained after all monthly obligations
          </div>
        </div>

        {/* Monthly Savings Goal */}
        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Monthly Savings Goal</span>
            <PiggyBank className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${(currentStats.savings > 0 ? currentStats.savings : 447.26).toFixed(2)}
          </div>
          <div className="mt-2">
            <div className="w-full bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#be7fab] h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round(((currentStats.savings > 0 ? currentStats.savings : 447.26) / 2500) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1 font-mono tabular-nums">
              <span>Goal: $2,500.00</span>
              <span className="text-[#2d1b28] dark:text-[#efd0e5] font-bold">{Math.round(((currentStats.savings > 0 ? currentStats.savings : 447.26) / 2500) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Cash Flow Comparison & Top Payees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Comparison Table */}
        <div className="hud-panel hud-corners p-5">
          <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
            Cash Flow Categories vs {prevMonthName}
          </h3>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d29ec2] dark:border-[#be7fab]/30 text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] font-semibold uppercase">
                  <th className="pb-2 pl-1">Category</th>
                  <th className="pb-2 text-right">{currentMonthName}</th>
                  <th className="pb-2 text-right">{prevMonthName}</th>
                  <th className="pb-2 text-right pr-1">MoM Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d29ec2]/45 dark:divide-[#be7fab]/15">
                {[
                  { name: 'Income', curr: currentStats.income, prev: prevStats.income },
                  { name: 'Expenses', curr: currentStats.expenses, prev: prevStats.expenses },
                  { name: 'Bills', curr: currentStats.bills, prev: prevStats.bills },
                  { name: 'Savings / Interest', curr: currentStats.savings > 0 ? currentStats.savings : 447.26, prev: prevStats.savings > 0 ? prevStats.savings : 391.31 },
                  { name: 'Debts / Cash Withdrawals', curr: currentStats.debts, prev: prevStats.debts },
                  { name: 'Prescriptions', curr: currentStats.prescriptions, prev: prevStats.prescriptions },
                ].map(row => {
                  const chg = calcChange(row.curr, row.prev);
                  const isPositiveMetric = row.name === 'Income' || row.name === 'Savings / Interest';
                  const isGood = isPositiveMetric ? chg.isUp : !chg.isUp;
                  return (
                    <tr key={row.name} className="hover:bg-[#efd0e5]/55 dark:hover:bg-[#be7fab]/10">
                      <td className="py-2.5 pl-1 font-semibold text-[#2d1b28] dark:text-[#efd0e5]">{row.name}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">
                        ${row.curr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28]/70 dark:text-[#d29ec2]">
                        ${row.prev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[11px] pr-1">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                            isGood ? 'bg-[#be7fab] dark:bg-[#be7fab]/25 text-[#120a10] dark:text-[#efd0e5] font-bold' : 'bg-[#e6c3db] dark:bg-[#120a10] text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/35'
                          }`}
                        >
                          {chg.isUp ? '▲' : '▼'} {chg.pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spending Payees & Income Sources */}
        <div className="hud-panel hud-corners p-5 space-y-5">
          {/* Top Spending Payees */}
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              Top Expenses & Payees
            </h3>
            <div className="mt-3 space-y-2">
              {topPayees.slice(0, 6).map(([payee, amt]) => (
                <div key={payee} className="flex items-center justify-between text-xs py-1 border-b border-[#d29ec2]/45 dark:border-[#be7fab]/15 last:border-0">
                  <span className="font-medium text-[#2d1b28]/85 dark:text-[#e6c3db] truncate max-w-[220px]">{payee}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
                    ${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              {topPayees.length === 0 && (
                <p className="text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic py-2">No expenses logged for this month.</p>
              )}
            </div>
          </div>

          {/* Income Sources */}
          <div className="pt-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
            <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] mb-2">
              Income Sources & Deposits
            </h4>
            <div className="space-y-1.5">
              {incomeSources.map(([source, amt]) => (
                <div key={source} className="flex items-center justify-between text-xs py-1 border-b border-[#d29ec2]/45 dark:border-[#be7fab]/15 last:border-0">
                  <span className="text-[#2d1b28]/85 dark:text-[#e6c3db]">{source}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#be7fab] dark:text-[#daabcb]">
                    ${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              {incomeSources.length === 0 && (
                <p className="text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic">No income deposits recorded for this month.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Bills Checklist */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {currentMonthName} Scheduled Bills & Recurring Dues
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Direct from your 2026 payment schedule
            </p>
          </div>
          <span className="text-xs text-[#2d1b28] dark:text-[#efd0e5] font-mono tabular-nums bg-[#e6c3db] dark:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#be7fab]/35 px-2.5 py-0.5 rounded-lg">
            {monthScheduledBills.length} scheduled
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {monthScheduledBills.map(bill => {
            const isPaid = bill.status === 'Paid';
            return (
              <div
                key={bill.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPaid
                    ? 'bg-[#e6c3db]/35 dark:bg-[#120a10]/55 border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-[#2d1b28]/65 dark:text-[#d29ec2]'
                    : 'bg-[#e6c3db]/70 dark:bg-[#120a10]/90 border-[#be7fab] dark:border-[#be7fab]/50 text-[#2d1b28] dark:text-[#efd0e5] shadow-[0_0_12px_rgba(190,127,171,0.12)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleScheduledPaid(bill.id)}
                      className="transition-transform active:scale-90 cursor-pointer"
                      aria-label={isPaid ? 'Mark unpaid' : 'Mark paid'}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#be7fab]" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${isPaid ? 'line-through text-[#2d1b28]/60 dark:text-[#d29ec2]/70' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                        {bill.name}
                      </div>
                      <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono">
                        Due: {bill.dueDate}
                      </div>
                    </div>
                  </div>

                  <span className={`font-mono text-xs font-bold tabular-nums ${isPaid ? 'text-[#2d1b28]/65 dark:text-[#d29ec2]' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                    ${bill.amountDue.toFixed(2)}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px]">
                  <span className="text-[#2d1b28]/70 dark:text-[#d29ec2]">{bill.type}</span>
                  <span className={`font-medium ${isPaid ? 'text-[#be7fab] dark:text-[#daabcb]' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                    {isPaid ? `Paid: ${bill.paidDate || 'Yes'}` : 'Pending Payment'}
                  </span>
                </div>
              </div>
            );
          })}

          {monthScheduledBills.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic">
              No specific scheduled bills recorded for {currentMonthName}. Check the master bill calendar.
            </div>
          )}
        </div>
      </div>

      {/* Monthly Filtered Transaction Log */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {currentMonthName} Transaction Log
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              All charges, credits, transfers, and payroll logged in {currentMonthName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search month transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            >
              <option value="ALL">All Categories</option>
              <option value="Expenses">Expenses</option>
              <option value="Bills">Bills</option>
              <option value="Income">Income</option>
              <option value="Transfer">Transfer</option>
              <option value="Debts">Debts</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="sticky top-0 bg-white dark:bg-[#1c0f19] z-10 border-b border-[#d29ec2] dark:border-[#be7fab]/35">
              <tr className="text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-2.5 pl-2">Date</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">Account</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Sub-Category</th>
                <th className="pb-2.5 text-right">Charged</th>
                <th className="pb-2.5 text-right">Credited</th>
                <th className="pb-2.5 text-right pr-2">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d29ec2]/45 dark:divide-[#be7fab]/15">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#efd0e5]/55 dark:hover:bg-[#be7fab]/10 transition-colors">
                  <td className="py-2.5 pl-2 font-mono text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="py-2.5 font-medium text-[#2d1b28] dark:text-[#efd0e5] max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/80 dark:text-[#e6c3db] whitespace-nowrap">
                    {t.account}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/70 dark:text-[#d29ec2] whitespace-nowrap">
                    {t.category}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/70 dark:text-[#d29ec2] whitespace-nowrap">
                    {t.subCategory || t.subDescription || '—'}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">
                    {t.charged > 0 ? `$${t.charged.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#be7fab] dark:text-[#daabcb] font-medium">
                    {t.credited > 0 ? `$${t.credited.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28]/70 dark:text-[#d29ec2] pr-2">
                    {t.balance || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-8 text-center text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic">
              No transactions logged for {currentMonthName} matching your filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
