import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ScheduledPaymentItem } from '../../data/financeHubData';

interface AddScheduledBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScheduledBill: (item: Omit<ScheduledPaymentItem, 'id'>) => void;
}

export const AddScheduledBillModal: React.FC<AddScheduledBillModalProps> = ({
  isOpen,
  onClose,
  onAddScheduledBill,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Bill');
  const [amountDue, setAmountDue] = useState('');
  const [dueDate, setDueDate] = useState('Nov 14, 2026');
  const [day, setDay] = useState('Sat');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountDue);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    onAddScheduledBill({
      name: name.trim(),
      type,
      scheduledAmount: amt,
      dueDate,
      amountDue: amt,
      status: 'Upcoming',
      paidDate: '',
      amountPaid: 0,
      date: dueDate,
      day: day || 'Fri',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
      <div className="hud-panel hud-corners w-full max-w-sm p-6 shadow-[0_0_30px_rgba(190,127,171,0.3)] relative bg-white dark:bg-[#1c0f19]">
        <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
          <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
            Add Scheduled Bill / Due Date
          </h3>
          <button onClick={onClose} className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
              Bill / Payee Name
            </label>
            <input
              type="text"
              placeholder="e.g. Spectrum, We Energies, Mortgage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Amount Due ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5] font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              >
                <option value="Bill">Bill</option>
                <option value="Debt">Debt / Transfer</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Due Date
              </label>
              <input
                type="text"
                placeholder="Nov 14, 2026"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                Day of Week
              </label>
              <input
                type="text"
                placeholder="Sat"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              />
            </div>
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
              Add Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
