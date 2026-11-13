import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import {
  FinanceTransaction,
  AccountDetail,
} from '../../data/financeHubData';

interface FinanceOverviewTabProps {
  transactions: FinanceTransaction[];
  accounts: AccountDetail[];
  onSelectMonth: (monthIndex: number) => void;
  onSelectAccount: (accountId: string) => void;
  onOpenAddTransaction: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const FinanceOverviewTab: React.FC<FinanceOverviewTabProps> = ({
  transactions,
  accounts,
  onSelectMonth,
  onSelectAccount,
  onOpenAddTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Calculate monthly stats from transactions
  const monthlyBreakdown = useMemo(() => {
    return MONTH_SHORT.map((short, idx) => {
      const monthTxs = transactions.filter(t => t.date.startsWith(short));
      let income = 0;
      let expenses = 0;
      let bills = 0;
      let debts = 0;

      monthTxs.forEach(t => {
        if (t.category === 'Income') {
          income += t.credited || t.charged;
        } else if (t.category === 'Bills') {
          bills += t.charged || t.credited;
        } else if (t.category === 'Expenses') {
          expenses += t.charged || t.credited;
        } else if (t.category === 'Debts') {
          debts += t.charged || t.credited;
        }
      });

      const totalOut = expenses + bills + debts;
      const net = income - totalOut;

      return {
        monthIndex: idx,
        fullName: MONTH_NAMES[idx],
        shortName: short,
        txCount: monthTxs.length,
        income,
        expenses,
        bills,
        debts,
        totalOut,
        net,
      };
    });
  }, [transactions]);

  // Aggregate totals
  const totalCash = accounts
    .filter(a => !a.isDebt)
    .reduce((acc, a) => acc + a.balance, 0);

  const totalDebtOwed = accounts
    .filter(a => a.isDebt && a.id !== 'rocket-mortgage-account')
    .reduce((acc, a) => acc + a.balance, 0);

  const netLiquid = totalCash - totalDebtOwed;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAccount =
        selectedAccountFilter === 'ALL' || t.account === selectedAccountFilter;

      const matchesCat =
        selectedCategoryFilter === 'ALL' || t.category === selectedCategoryFilter;

      return matchesSearch && matchesAccount && matchesCat;
    });
  }, [transactions, searchQuery, selectedAccountFilter, selectedCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Net Position & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash */}
        <div className="hud-panel hud-corners p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db]">
            <span>Total Cash & Liquid Reserves</span>
            <Wallet className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1 flex items-center gap-1">
            <span>4 bank & savings accounts</span>
            <span>·</span>
            <span className="text-[#2d1b28] dark:text-[#efd0e5] font-medium">Liquid</span>
          </div>
        </div>

        {/* Total Debt Owed */}
        <div className="hud-panel hud-corners p-4 border-[#be7fab]/60">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db]">
            <span>Active Credit Card Debt</span>
            <CreditCard className="w-4 h-4 text-[#be7fab]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${totalDebtOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1 flex items-center gap-1">
            <span>Across 3 cards</span>
            <span>·</span>
            <span className="text-[#2d1b28]/85 dark:text-[#e6c3db]">PNC, US Bank, Sam's</span>
          </div>
        </div>

        {/* Net Liquid Position */}
        <div className="hud-panel hud-corners p-4 bg-[#e6c3db]/60 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/70 shadow-[0_0_18px_rgba(190,127,171,0.22)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
            <span>Net Liquid Position</span>
            <ShieldCheck className="w-4 h-4 text-[#be7fab] dark:text-[#efd0e5]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${netLiquid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/90 mt-1">
            Live cash balance minus credit card debt
          </div>
        </div>

        {/* 2026 Savings Goal Progress */}
        <div className="hud-panel hud-corners p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db]">
            <span>2026 Annual Savings Goal</span>
            <PiggyBank className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            $21,968.19
          </div>
          <div className="mt-2">
            <div className="w-full bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#be7fab] h-full rounded-full transition-all shadow-[0_0_8px_rgba(190,127,171,0.6)]"
                style={{ width: '87.9%' }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1 font-mono tabular-nums">
              <span>Goal: $25,000.00</span>
              <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">87.9% Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Cash Flow Visual Ledger */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              2026 Full-Year Cash Flow & Monthly Breakdown
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Select any monthly tab to inspect categories, comparison with previous month, and budget goals
            </p>
          </div>
          <span className="text-xs text-[#2d1b28] dark:text-[#efd0e5] font-medium bg-[#e6c3db] dark:bg-[#be7fab]/20 border border-[#be7fab] dark:border-[#be7fab]/40 px-2.5 py-1 rounded-lg">
            Fiscal Year 2026
          </span>
        </div>

        {/* Monthly Table Strip */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#d29ec2] dark:border-[#be7fab]/30 text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Month</th>
                <th className="pb-3 text-right">Income</th>
                <th className="pb-3 text-right">Bills</th>
                <th className="pb-3 text-right">Expenses</th>
                <th className="pb-3 text-right">Net Cash Flow</th>
                <th className="pb-3 text-center">Activity</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d29ec2]/45 dark:divide-[#be7fab]/15">
              {monthlyBreakdown.map((m) => (
                <tr
                  key={m.shortName}
                  className="group hover:bg-[#efd0e5]/60 dark:hover:bg-[#be7fab]/10 transition-colors cursor-pointer"
                  onClick={() => onSelectMonth(m.monthIndex)}
                >
                  <td className="py-2.5 pl-2 font-semibold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#be7fab] shadow-[0_0_6px_rgba(190,127,171,0.8)]" />
                    <span>{m.fullName}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5] font-medium">
                    ${m.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28]/80 dark:text-[#e6c3db]">
                    ${m.bills.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-[#2d1b28]/70 dark:text-[#d29ec2]">
                    ${m.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 text-right font-mono tabular-nums font-semibold ${
                      m.net >= 0 ? 'text-[#2d1b28] dark:text-[#efd0e5]' : 'text-[#be7fab]'
                    }`}
                  >
                    {m.net >= 0 ? '+' : ''}${m.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-center text-[#2d1b28]/70 dark:text-[#d29ec2] font-mono text-[11px]">
                    {m.txCount} txns
                  </td>
                  <td className="py-2.5 text-right pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMonth(m.monthIndex);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] bg-[#e6c3db] dark:bg-[#be7fab]/20 hover:bg-[#be7fab] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-md transition-colors cursor-pointer"
                    >
                      Open Tab →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Snapshots Quick Cards */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Household Accounts Overview
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Click any account card to view balance history, payment due date, APR, and transaction ledger
            </p>
          </div>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg shadow-[0_0_10px_rgba(190,127,171,0.3)] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Transaction</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {accounts.map(account => (
            <div
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              className="p-3.5 rounded-xl bg-[#e6c3db]/45 dark:bg-[#120a10]/70 border border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab] dark:hover:border-[#efd0e5]/70 hover:bg-[#e6c3db]/75 dark:hover:bg-[#be7fab]/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#be7fab] dark:text-[#d29ec2] uppercase tracking-wider">
                    {account.category}
                  </span>
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5] transition-colors" />
              </div>

              <div className="mt-3">
                <div className="font-mono text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 mt-0.5">
                  {account.isDebt ? 'Balance Owed' : 'Available Balance'}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                <span>{account.apr || account.accountNumber}</span>
                <span className="font-medium text-[#be7fab] dark:text-[#daabcb] group-hover:underline">View Ledger →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Transaction Log with Full Filter & Search */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Master Transaction Tracker Log
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Searching {transactions.length} verified records across all household accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#2d1b28] dark:text-[#e6c3db] font-mono tabular-nums bg-[#e6c3db] dark:bg-[#be7fab]/15 border border-[#d29ec2] dark:border-[#be7fab]/35 px-2.5 py-1 rounded-lg">
              {filteredTransactions.length} results
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-4">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#d29ec2] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, notes, or sub-category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            />
          </div>

          {/* Account Filter */}
          <select
            value={selectedAccountFilter}
            onChange={(e) => setSelectedAccountFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
          >
            <option value="ALL">All Accounts</option>
            <option value="PNC Checking">PNC Checking</option>
            <option value="PNC Credit Card">PNC Credit Card</option>
            <option value="US Bank Savings">US Bank Savings</option>
            <option value="US Bank Checking">US Bank Checking</option>
            <option value="US Bank Credit Card">US Bank Credit Card</option>
            <option value="Sam's Credit Card">Sam's Credit Card</option>
            <option value="PNC Money Market">PNC Money Market</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
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

        {/* Transactions Table */}
        <div className="mt-4 overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
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
              {filteredTransactions.slice(0, 50).map((t) => (
                <tr key={t.id} className="hover:bg-[#efd0e5]/55 dark:hover:bg-[#be7fab]/10 transition-colors">
                  <td className="py-2.5 pl-2 font-mono text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="py-2.5 font-medium text-[#2d1b28] dark:text-[#efd0e5] max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/80 dark:text-[#e6c3db] whitespace-nowrap">
                    <span
                      onClick={() => {
                        const acc = accounts.find(a => a.name.includes(t.account.replace("Sam's Credit Card", "Sam's Club")));
                        if (acc) onSelectAccount(acc.id);
                      }}
                      className="hover:text-[#be7fab] dark:hover:text-[#efd0e5] hover:underline cursor-pointer"
                    >
                      {t.account}
                    </span>
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
            <div className="py-12 text-center text-xs text-[#2d1b28]/65 dark:text-[#d29ec2] italic">
              No transactions found matching your search and filter criteria.
            </div>
          )}

          {filteredTransactions.length > 50 && (
            <div className="py-3 text-center text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20">
              Showing first 50 of {filteredTransactions.length} matching transactions. Use filters above to narrow your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
