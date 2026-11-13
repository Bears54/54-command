import React from 'react';
import {
  Wallet,
  PiggyBank,
  CreditCard,
  Building,
  ShieldCheck,
  ArrowUpRight,
  Users,
  Home,
  Plus,
} from 'lucide-react';
import { AccountDetail } from '../../data/financeHubData';

interface AccountKanbanTabProps {
  accounts: AccountDetail[];
  onSelectAccount: (accountId: string) => void;
  onOpenAddTransaction: () => void;
}

export const AccountKanbanTab: React.FC<AccountKanbanTabProps> = ({
  accounts,
  onSelectAccount,
  onOpenAddTransaction,
}) => {
  // Aggregate KPIs
  const totalCash = accounts
    .filter(a => !a.isDebt)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalDebt = accounts
    .filter(a => a.isDebt && a.id !== 'rocket-mortgage-account')
    .reduce((sum, a) => sum + a.balance, 0);

  const netLiquid = totalCash - totalDebt;

  // Group accounts by Kanban categories
  const savingsAccounts = accounts.filter(a => a.category === 'Savings');
  const teamJoseAccounts = accounts.filter(a => a.category === 'Cash / Dedicated');
  const checkingAccounts = accounts.filter(a => a.category === 'Checking');
  const creditCardAccounts = accounts.filter(a => a.category === 'Credit Card');
  const mortgageAccounts = accounts.filter(a => a.category === 'Mortgage');

  return (
    <div className="space-y-6">
      {/* Top Banner KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Cash</span>
            <Wallet className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            4 bank & savings accounts
          </div>
        </div>

        <div className="hud-panel hud-corners p-4 border-[#be7fab]/60">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Debt Owed</span>
            <CreditCard className="w-4 h-4 text-[#be7fab]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            3 active credit cards
          </div>
        </div>

        <div className="hud-panel hud-corners p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Total Accounts</span>
            <Building className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            {accounts.length}
          </div>
          <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#d29ec2] mt-1">
            Across 5 categories
          </div>
        </div>

        <div className="hud-panel hud-corners p-4 bg-[#e6c3db]/60 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/70 shadow-[0_0_16px_rgba(190,127,171,0.2)]">
          <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] flex items-center justify-between">
            <span>Net Liquid Position</span>
            <ShieldCheck className="w-4 h-4 text-[#be7fab] dark:text-[#efd0e5]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            ${netLiquid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] mt-1">
            Live cash minus credit card debt
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#2d1b28]/75 dark:text-[#d29ec2]">
          Select any account card below to drill down into balances, APRs, limits, and full transaction ledger.
        </p>
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_10px_rgba(190,127,171,0.3)] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* Accounts Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Column 1: Savings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#be7fab] dark:border-[#efd0e5]">
            <div className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-[#be7fab] dark:text-[#efd0e5]" />
              <h3 className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wider">
                💰 Savings (1)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
              $156,556.59
            </span>
          </div>

          <div className="space-y-3">
            {savingsAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className="hud-panel hud-corners p-4 cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#e6c3db]/45 dark:hover:bg-[#be7fab]/12 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
                  Active High-Yield Savings · 3.44% APY
                </div>
                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                  <span>📅 Last: {account.lastActivityDate}</span>
                  <span className="font-medium text-[#2d1b28] dark:text-[#efd0e5]">{account.totalTxCount} txns</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Checking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#d29ec2] dark:border-[#daabcb]">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
              <h3 className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wider">
                🏛️ Checking (2)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
              $3,144.82
            </span>
          </div>

          <div className="space-y-3">
            {checkingAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className="hud-panel hud-corners p-4 cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#e6c3db]/45 dark:hover:bg-[#be7fab]/12 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
                  {account.role}
                </div>
                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                  <span>📅 Last: {account.lastActivityDate}</span>
                  <span className="font-medium text-[#2d1b28] dark:text-[#efd0e5]">{account.totalTxCount} txns</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Team Jose Account */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#d29ec2]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]" />
              <h3 className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wider">
                👥 Team Jose (1)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
              $3,593.25
            </span>
          </div>

          <div className="space-y-3">
            {teamJoseAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className="hud-panel hud-corners p-4 cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#e6c3db]/45 dark:hover:bg-[#be7fab]/12 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
                  💵 Cash you have · Opening: $2,593.25
                </div>
                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                  <span>Dedicated Bank</span>
                  <span className="font-medium text-[#2d1b28] dark:text-[#efd0e5]">+$1,000 Surplus</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Credit Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#be7fab]">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#be7fab]" />
              <h3 className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wider">
                💳 Credit Cards (3)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
              $256.31
            </span>
          </div>

          <div className="space-y-3">
            {creditCardAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className="hud-panel hud-corners p-4 cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#e6c3db]/45 dark:hover:bg-[#be7fab]/12 transition-all group border-[#be7fab]/70 dark:border-[#be7fab]/55"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1 flex items-center justify-between">
                  <span>Balance Owed</span>
                  <span className="text-[10px] font-mono text-[#2d1b28]/70 dark:text-[#d29ec2]">Limit: ${account.creditLimit?.toLocaleString()}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                  <span>Due: {account.paymentDueDate}</span>
                  <span className="font-medium text-[#be7fab]">{account.totalTxCount} txns</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 5: Residential Mortgage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#d29ec2] dark:border-[#e6c3db]">
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-[#be7fab] dark:text-[#e6c3db]" />
              <h3 className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] uppercase tracking-wider">
                🏡 Mortgage (1)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold">
              $70,327.47
            </span>
          </div>

          <div className="space-y-3">
            {mortgageAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className="hud-panel hud-corners p-4 cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#e6c3db]/45 dark:hover:bg-[#be7fab]/12 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] group-hover:text-[#be7fab] dark:group-hover:text-[#daabcb] transition-colors">
                    {account.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
                  10-Yr Fixed @ 2.000% APR · $1,400/mo
                </div>
                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#d29ec2]">
                  <span>Payoff: Dec 2030 (4 mo early)</span>
                  <span className="font-medium text-[#be7fab] dark:text-[#daabcb]">Amortization →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
