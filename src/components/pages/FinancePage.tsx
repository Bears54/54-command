import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Calendar,
  CreditCard,
  BarChart3,
  Columns3,
  Plus,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

// Sub-components
import { FinanceOverviewTab } from '../finance/FinanceOverviewTab';
import { MonthlyTab } from '../finance/MonthlyTab';
import { BillCalendarTab } from '../finance/BillCalendarTab';
import { BillKanbanTab } from '../finance/BillKanbanTab';
import { AccountKanbanTab } from '../finance/AccountKanbanTab';
import { AccountDetailPage } from '../finance/AccountDetailPage';
import { AddTransactionModal } from '../finance/AddTransactionModal';
import { AddScheduledBillModal } from '../finance/AddScheduledBillModal';

// Initial Dataset
import {
  initialAccountDetails,
  initialTransactions,
  initialScheduledPayments,
  AccountDetail,
  FinanceTransaction,
  ScheduledPaymentItem,
} from '../../data/financeHubData';

type FinanceSubTab = 'overview' | 'monthly' | 'calendar' | 'bill-kanban' | 'accounts';

const STORAGE_PREFIX = 'lifebinder_finance_v2';

export const FinancePage: React.FC = () => {
  const { celebrate } = useBinder();

  // Active top-level subtab
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('overview');

  // Active month in monthly tab (0 = Jan, 8 = Sep, 10 = Nov, 11 = Dec)
  const [activeMonthIndex, setActiveMonthIndex] = useState(10); // default to November 2026

  // Selected account for drill-down dedicated sub-page (null if on kanban board)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  // Persistent state for transactions, accounts, and scheduled payments
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_txs`);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [accounts, setAccounts] = useState<AccountDetail[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_accounts`);
      return saved ? JSON.parse(saved) : initialAccountDetails;
    } catch {
      return initialAccountDetails;
    }
  });

  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPaymentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_scheduled`);
      return saved ? JSON.parse(saved) : initialScheduledPayments;
    } catch {
      return initialScheduledPayments;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_txs`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save finance transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_accounts`, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_scheduled`, JSON.stringify(scheduledPayments));
    } catch (e) {
      console.error('Failed to save scheduled payments', e);
    }
  }, [scheduledPayments]);

  // Toggle paid status of a scheduled bill
  const handleToggleScheduledPaid = (id: string) => {
    setScheduledPayments(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isNowPaid = item.status !== 'Paid';
          if (isNowPaid) celebrate();
          return {
            ...item,
            status: isNowPaid ? 'Paid' : 'Upcoming',
            paidDate: isNowPaid ? 'Nov 12, 2026' : '',
            amountPaid: isNowPaid ? item.amountDue : 0,
          };
        }
        return item;
      })
    );
  };

  // Add new transaction
  const handleAddTransaction = (newTx: Omit<FinanceTransaction, 'id'>) => {
    const tx: FinanceTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions(prev => [tx, ...prev]);

    // Update account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.name === newTx.account || (newTx.account.includes("Sam's") && acc.id === 'sams-credit-card')) {
          const delta = newTx.credited - newTx.charged;
          return {
            ...acc,
            balance: acc.isDebt ? acc.balance - delta : acc.balance + delta,
            totalTxCount: (acc.totalTxCount || 0) + 1,
            lastActivityDate: newTx.date,
          };
        }
        return acc;
      })
    );

    celebrate();
  };

  // Add new scheduled bill
  const handleAddScheduledBill = (newBill: Omit<ScheduledPaymentItem, 'id'>) => {
    const bill: ScheduledPaymentItem = {
      ...newBill,
      id: `sched-${Date.now()}`,
    };
    setScheduledPayments(prev => [bill, ...prev]);
    celebrate();
  };

  // Selected account detail object
  const activeAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#efd0e5] shadow-[0_0_12px_rgba(190,127,171,0.28)]">
              <Wallet className="w-5 h-5 text-[#be7fab] dark:text-[#daabcb]" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              2026 Household Finance Hub
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1.5">
            Cash Flow Telemetry · Monthly Tabs, Bill Calendar, Bill Kanban &amp; Dedicated Account Portfolios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-white dark:bg-[#1c0f19] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
            <span>Log Transaction</span>
          </button>
          <button
            onClick={() => setIsAddBillOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_14px_rgba(190,127,171,0.35)] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Ribbon (HUD Command Tabs) */}
      <div className="hud-panel hud-corners p-1.5">
        <nav className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => {
              setActiveSubTab('overview');
              setSelectedAccountId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'overview' && !selectedAccountId
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_12px_rgba(190,127,171,0.4)]'
                : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db]/70 dark:hover:bg-[#be7fab]/15'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview Tracker</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('monthly');
              setSelectedAccountId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'monthly' && !selectedAccountId
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_12px_rgba(190,127,171,0.4)]'
                : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db]/70 dark:hover:bg-[#be7fab]/15'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Tabs (Jan–Dec)</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('calendar');
              setSelectedAccountId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'calendar' && !selectedAccountId
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_12px_rgba(190,127,171,0.4)]'
                : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db]/70 dark:hover:bg-[#be7fab]/15'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bill Calendar</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('bill-kanban');
              setSelectedAccountId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'bill-kanban' && !selectedAccountId
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_12px_rgba(190,127,171,0.4)]'
                : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db]/70 dark:hover:bg-[#be7fab]/15'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Bill Kanban Board</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('accounts');
              setSelectedAccountId(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'accounts' || selectedAccountId
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_12px_rgba(190,127,171,0.4)]'
                : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db]/70 dark:hover:bg-[#be7fab]/15'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Account Kanban &amp; Cards</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      {selectedAccountId && activeAccount ? (
        <AccountDetailPage
          account={activeAccount}
          onBack={() => setSelectedAccountId(null)}
          transactions={transactions}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />
      ) : activeSubTab === 'overview' ? (
        <FinanceOverviewTab
          transactions={transactions}
          accounts={accounts}
          onSelectMonth={(mIdx) => {
            setActiveMonthIndex(mIdx);
            setActiveSubTab('monthly');
          }}
          onSelectAccount={(accId) => setSelectedAccountId(accId)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />
      ) : activeSubTab === 'monthly' ? (
        <MonthlyTab
          currentMonthIndex={activeMonthIndex}
          onSelectMonth={(idx) => setActiveMonthIndex(idx)}
          transactions={transactions}
          scheduledPayments={scheduledPayments}
          onToggleScheduledPaid={handleToggleScheduledPaid}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />
      ) : activeSubTab === 'calendar' ? (
        <BillCalendarTab
          scheduledPayments={scheduledPayments}
          onTogglePaid={handleToggleScheduledPaid}
          onOpenAddBill={() => setIsAddBillOpen(true)}
        />
      ) : activeSubTab === 'bill-kanban' ? (
        <BillKanbanTab
          scheduledPayments={scheduledPayments}
          onTogglePaid={handleToggleScheduledPaid}
          onOpenAddBill={() => setIsAddBillOpen(true)}
        />
      ) : (
        <AccountKanbanTab
          accounts={accounts}
          onSelectAccount={(accId) => setSelectedAccountId(accId)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
      />

      {/* Add Scheduled Bill Modal */}
      <AddScheduledBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        onAddScheduledBill={handleAddScheduledBill}
      />
    </div>
  );
};
