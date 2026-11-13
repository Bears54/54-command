import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
} from 'lucide-react';
import {
  AccountDetail,
  FinanceTransaction,
  initialMortgageAmortization,
} from '../../data/financeHubData';

interface AccountDetailPageProps {
  account: AccountDetail;
  onBack: () => void;
  transactions: FinanceTransaction[];
  onOpenAddTransaction: () => void;
}

export const AccountDetailPage: React.FC<AccountDetailPageProps> = ({
  account,
  onBack,
  transactions,
  onOpenAddTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAmortizationTab, setShowAmortizationTab] = useState(false);

  // Filter transactions belonging to this account
  const accountTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (account.id === 'pnc-checking' && t.account === 'PNC Checking') return true;
      if (account.id === 'pnc-credit-card' && t.account === 'PNC Credit Card') return true;
      if (account.id === 'us-bank-checking' && t.account === 'US Bank Checking') return true;
      if (account.id === 'us-bank-savings' && t.account === 'US Bank Savings') return true;
      if (account.id === 'us-bank-credit-card' && t.account === 'US Bank Credit Card') return true;
      if (account.id === 'sams-credit-card' && (t.account.includes("Sam's") || t.account.includes('Sams'))) return true;
      if (account.id === 'team-jose-account' && (t.account.includes('TeamJose') || t.account.includes('Team Jose') || t.description.toLowerCase().includes('jose'))) return true;
      if (account.id === 'rocket-mortgage-account' && (t.description.toLowerCase().includes('mortgage') || t.subCategory.toLowerCase().includes('mortgage'))) return true;
      return t.account === account.name;
    });
  }, [transactions, account]);

  // Filtered by search & category
  const filteredTransactions = useMemo(() => {
    return accountTransactions.filter(t => {
      const matchSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [accountTransactions, searchQuery, selectedCategory]);

  // Aggregate stats for this account
  const totalCharged = useMemo(() => {
    return accountTransactions.reduce((sum, t) => sum + (t.charged || 0), 0);
  }, [accountTransactions]);

  const totalCredited = useMemo(() => {
    return accountTransactions.reduce((sum, t) => sum + (t.credited || 0), 0);
  }, [accountTransactions]);

  // Credit card utilization if applicable
  const creditUtilization =
    account.creditLimit && account.creditLimit > 0
      ? Math.round((account.balance / account.creditLimit) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-white dark:bg-[#1c0f19] hover:bg-[#e6c3db]/60 dark:hover:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>Back to Accounts Kanban</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Transaction / Payment</span>
          </button>
        </div>
      </div>

      {/* Account Hero Card */}
      <div className="hud-panel hud-corners p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wider">
                {account.category} Account
              </span>
              <span className="text-[#be7fab]">·</span>
              <span className="text-xs font-mono text-[#2d1b28]/70 dark:text-[#d29ec2]">
                {account.accountNumber}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              {account.name}
            </h2>

            <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/85 leading-relaxed">
              {account.description}
            </p>
          </div>

          {/* Balance & Due Date Box */}
          <div className="p-4 bg-[#e6c3db]/55 dark:bg-[#120a10]/90 rounded-2xl border border-[#be7fab] dark:border-[#be7fab]/50 shadow-[0_0_18px_rgba(190,127,171,0.18)] min-w-[250px]">
            <div className="text-xs font-medium text-[#2d1b28]/75 dark:text-[#d29ec2]">
              {account.isDebt ? 'Current Balance Owed' : 'Available Liquid Balance'}
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {account.isDebt && account.creditLimit && (
              <div className="mt-3 pt-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <div className="flex justify-between items-center text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db] font-mono">
                  <span>Credit Limit: ${account.creditLimit.toLocaleString()}</span>
                  <span>{creditUtilization}% Used</span>
                </div>
                <div className="w-full bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/30 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${creditUtilization > 30 ? 'bg-[#2d1b28] dark:bg-[#efd0e5]' : 'bg-[#be7fab]'}`}
                    style={{ width: `${Math.min(100, creditUtilization)}%` }}
                  />
                </div>
              </div>
            )}

            {account.apr && (
              <div className="mt-2 text-[11px] text-[#2d1b28]/75 dark:text-[#d29ec2] flex items-center justify-between">
                <span>Rate / Terms:</span>
                <span className="font-mono font-semibold text-[#2d1b28] dark:text-[#efd0e5]">{account.apr}</span>
              </div>
            )}

            {account.paymentDueDate && (
              <div className="mt-1 text-[11px] text-[#2d1b28]/75 dark:text-[#d29ec2] flex items-center justify-between">
                <span>Payment Due Date:</span>
                <span className="font-mono font-semibold text-[#be7fab] dark:text-[#daabcb]">{account.paymentDueDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-6 pt-4 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[#2d1b28]/70 dark:text-[#d29ec2] font-semibold uppercase text-[10px]">Total Debited / Charged</div>
            <div className="font-mono text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-0.5 tabular-nums">
              ${totalCharged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-[#2d1b28]/70 dark:text-[#d29ec2] font-semibold uppercase text-[10px]">Total Credited / Paid</div>
            <div className="font-mono text-base font-bold text-[#be7fab] dark:text-[#daabcb] mt-0.5 tabular-nums">
              ${totalCredited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-[#2d1b28]/70 dark:text-[#d29ec2] font-semibold uppercase text-[10px]">Total Transactions</div>
            <div className="font-mono text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-0.5 tabular-nums">
              {accountTransactions.length} records
            </div>
          </div>
          <div>
            <div className="text-[#2d1b28]/70 dark:text-[#d29ec2] font-semibold uppercase text-[10px]">Last Statement / Activity</div>
            <div className="font-mono text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-0.5">
              {account.lastActivityDate || 'Current'}
            </div>
          </div>
        </div>
      </div>

      {/* Special Mortgage Amortization View if Rocket Mortgage */}
      {account.id === 'rocket-mortgage-account' && (
        <div className="hud-panel hud-corners p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                10-Year Fixed Mortgage Amortization Schedule
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
                Origination: May 2021 ($150,825.00 @ 2.000%) · Payoff with $12.21 extra principal: December 2030 (4 months ahead!)
              </p>
            </div>
            <button
              onClick={() => setShowAmortizationTab(!showAmortizationTab)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 hover:bg-[#be7fab] hover:text-[#120a10] dark:hover:bg-[#be7fab]/35 transition-colors cursor-pointer"
            >
              {showAmortizationTab ? 'Hide Amortization Table' : 'Show Full 120-Month Table'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/30">
              <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] uppercase font-semibold">Original Principal</span>
              <div className="font-mono text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums mt-0.5">$150,825.00</div>
              <span className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]">Loan term: 10 years (120 mo)</span>
            </div>
            <div className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#be7fab] dark:border-[#be7fab]/45">
              <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] uppercase font-semibold">Total Principal Paid</span>
              <div className="font-mono text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums mt-0.5">$80,497.53</div>
              <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-semibold">53.4% of mortgage principal cleared!</span>
            </div>
            <div className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/30">
              <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2] uppercase font-semibold">Monthly Extra Principal</span>
              <div className="font-mono text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums mt-0.5">$12.21 / mo</div>
              <span className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]">$3,504.27 extra paid to date</span>
            </div>
          </div>

          {showAmortizationTab && (
            <div className="mt-4 overflow-x-auto max-h-[450px]">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-white dark:bg-[#1c0f19] z-10 border-b border-[#d29ec2] dark:border-[#be7fab]/35">
                  <tr className="text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] font-semibold uppercase">
                    <th className="pb-2.5 pl-2">Mo #</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5 text-right">Payment</th>
                    <th className="pb-2.5 text-right">Interest</th>
                    <th className="pb-2.5 text-right">Principal</th>
                    <th className="pb-2.5 text-right">Remaining Balance</th>
                    <th className="pb-2.5 text-right pr-2">Statement Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d29ec2]/45 dark:divide-[#be7fab]/15 font-mono tabular-nums text-[#2d1b28]/80 dark:text-[#e6c3db]">
                  {initialMortgageAmortization.map((row) => (
                    <tr key={row.monthNum} className={`hover:bg-[#efd0e5]/55 dark:hover:bg-[#be7fab]/10 ${row.monthNum === 67 ? 'bg-[#e6c3db]/70 dark:bg-[#be7fab]/20 font-semibold text-[#2d1b28] dark:text-[#efd0e5]' : ''}`}>
                      <td className="py-2 pl-2 text-[#2d1b28]/70 dark:text-[#d29ec2] font-normal">{row.monthNum}</td>
                      <td className="py-2 font-sans font-medium text-[#2d1b28] dark:text-[#efd0e5]">{row.date}</td>
                      <td className="py-2 text-right">${row.payment.toFixed(2)}</td>
                      <td className="py-2 text-right text-[#2d1b28]/70 dark:text-[#d29ec2]">${row.actualInterest.toFixed(2)}</td>
                      <td className="py-2 text-right text-[#be7fab] dark:text-[#daabcb]">${row.actualPrincipal.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-[#2d1b28] dark:text-[#efd0e5]">${row.actualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 text-right text-[#2d1b28]/70 dark:text-[#d29ec2] pr-2">{row.statementDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Account Transaction History Table */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {account.name} Ledger History
            </h3>
            <p className="text-xs text-[#2d1b28]/70 dark:text-[#d29ec2]">
              Showing {filteredTransactions.length} transactions recorded for this account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#d29ec2] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              />
            </div>
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

        <div className="mt-4 overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="sticky top-0 bg-white dark:bg-[#1c0f19] z-10 border-b border-[#d29ec2] dark:border-[#be7fab]/35">
              <tr className="text-[#2d1b28]/70 dark:text-[#d29ec2] text-[11px] font-semibold uppercase tracking-wider">
                <th className="pb-2.5 pl-2">Date</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Sub-Category</th>
                <th className="pb-2.5">Notes</th>
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
                    {t.category}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/70 dark:text-[#d29ec2] whitespace-nowrap">
                    {t.subCategory || t.subDescription || '—'}
                  </td>
                  <td className="py-2.5 text-[#2d1b28]/65 dark:text-[#d29ec2]/80 text-[11px] max-w-[160px] truncate" title={t.notes}>
                    {t.notes || '—'}
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
              No transactions found for this account matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
