import React from 'react';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const BillsDueWidget: React.FC = () => {
  const { bills, toggleBillPaid, setActivePage } = useBinder();

  const todayStr = '2026-11-12';
  const dueTodayBills = bills.filter(b => b.dueDate === todayStr);
  const otherUpcomingBills = bills.filter(b => b.dueDate > todayStr && !b.isPaid).slice(0, 2);

  const displayBills = dueTodayBills.length > 0 ? dueTodayBills : otherUpcomingBills;
  const unpaidCount = dueTodayBills.filter(b => !b.isPaid).length;

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
            <Wallet className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Bills Due Today
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
              Direct bill payments &amp; scheduled drafts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unpaidCount > 0 ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab]/50 tabular-nums font-mono">
              {unpaidCount} Pending
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#daabcb]/15 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#d29ec2]/40">
              All Settled
            </span>
          )}
          <button
            onClick={() => setActivePage('finance')}
            className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] transition-colors shadow-[0_0_12px_rgba(190,127,171,0.35)]"
          >
            <span>Finance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="my-3 space-y-2">
        {displayBills.map(bill => (
          <div
            key={bill.id}
            className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border ${
              bill.isPaid
                ? 'bg-[#efd0e5]/50 dark:bg-[#120a10]/50 text-[#2d1b28]/60 dark:text-[#e6c3db]/55 border-[#d29ec2]/60 dark:border-[#be7fab]/20'
                : 'bg-[#e6c3db]/70 dark:bg-[#241420]/90 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => toggleBillPaid(bill.id)}
                className="shrink-0 transition-transform active:scale-90"
                aria-label={bill.isPaid ? 'Mark bill unpaid' : 'Mark bill paid'}
              >
                {bill.isPaid ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#be7fab] fill-[#be7fab]/25" />
                ) : (
                  <Circle className="w-4.5 h-4.5 text-[#be7fab]/70 dark:text-[#d29ec2]/70 group-hover:text-[#be7fab]" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold truncate ${bill.isPaid ? 'line-through text-[#2d1b28]/55 dark:text-[#e6c3db]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                    {bill.title}
                  </span>
                  {bill.autopay && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#daabcb] border border-[#be7fab]/40 uppercase font-mono">
                      Auto
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70">
                  {bill.category} · Due {bill.dueDate === todayStr ? 'Today (Nov 12)' : bill.dueDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-display text-xs sm:text-sm font-bold tabular-nums font-mono ${
                bill.isPaid ? 'text-[#2d1b28]/55 dark:text-[#e6c3db]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'
              }`}>
                ${bill.amount.toFixed(2)}
              </span>
              <button
                onClick={() => setActivePage('finance')}
                title="Direct link to bill details in Finance Hub"
                className="p-1 text-[#2d1b28]/70 dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {displayBills.length === 0 && (
          <p className="text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 italic py-2">No bills due today or upcoming this week.</p>
        )}
      </div>

      {/* Footer link to Finance Hub */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
        <span>November budget tracking</span>
        <button
          onClick={() => setActivePage('finance')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold"
        >
          View full ledger →
        </button>
      </div>
    </div>
  );
};
