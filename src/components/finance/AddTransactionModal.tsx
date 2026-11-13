import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FinanceTransaction, AccountDetail } from '../../data/financeHubData';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  accounts: AccountDetail[];
  initialAccount?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  initialAccount,
}) => {
  const [date, setDate] = useState('Nov 12, 2026');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'charged' | 'credited'>('charged');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(initialAccount || 'PNC Checking');
  const [category, setCategory] = useState('Expenses');
  const [subCategory, setSubCategory] = useState('Shopping');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!description.trim() || isNaN(num) || num <= 0) return;

    onAddTransaction({
      date,
      charged: type === 'charged' ? num : 0,
      credited: type === 'credited' ? num : 0,
      description: description.trim(),
      category,
      subDescription: subCategory,
      account,
      notes: notes.trim(),
      balance: '',
      subCategory,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
      <div className="hud-panel hud-corners w-full max-w-md p-6 shadow-[0_0_30px_rgba(190,127,171,0.3)] relative bg-white dark:bg-[#1c0f19]">
        <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
          <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
            Log New Transaction
          </h3>
          <button onClick={onClose} className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Type Toggle: Charged (Out) vs Credited (In) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#e6c3db]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 rounded-xl">
            <button
              type="button"
              onClick={() => setType('charged')}
              className={`py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'charged'
                  ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_10px_rgba(190,127,171,0.35)]'
                  : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              Money Out (Charged)
            </button>
            <button
              type="button"
              onClick={() => setType('credited')}
              className={`py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'credited'
                  ? 'bg-[#be7fab] dark:bg-[#efd0e5] text-[#120a10] font-bold shadow-[0_0_10px_rgba(190,127,171,0.35)]'
                  : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              Money In (Credited)
            </button>
          </div>

          <div>
            <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
              Description / Payee
            </label>
            <input
              type="text"
              placeholder="e.g. Costco, Kwik Trip, Payroll, Erie Insurance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="49.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5] font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Date
              </label>
              <input
                type="text"
                placeholder="Nov 12, 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Account ({accounts.length} linked)
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              >
                <option value="PNC Checking">PNC Checking</option>
                <option value="PNC Credit Card">PNC Credit Card</option>
                <option value="US Bank Savings">US Bank Savings</option>
                <option value="US Bank Checking">US Bank Checking</option>
                <option value="US Bank Credit Card">US Bank Credit Card</option>
                <option value="Sam's Credit Card">Sam's Credit Card</option>
                <option value="TeamJose Account">Team Jose Account</option>
                <option value="PNC Money Market">PNC Money Market</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              >
                <option value="Expenses">Expenses</option>
                <option value="Bills">Bills</option>
                <option value="Income">Income</option>
                <option value="Transfer">Transfer</option>
                <option value="Debts">Debts</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
              Sub-Category
            </label>
            <input
              type="text"
              placeholder="e.g. Groceries, Gas & Fuel, Shopping, Mortgage, Utilities"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Additional memo or reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
            />
          </div>

          <div className="pt-3 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-semibold rounded-lg shadow-[0_0_12px_rgba(190,127,171,0.35)] cursor-pointer"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
