import React, { useState } from 'react';
import {
  Pill,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  RefreshCw,
  Edit2,
  X,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { MedicationItem, SupplementItem } from '../../types/wellness';

export const MedicationsSupplementsView: React.FC = () => {
  const {
    medications,
    toggleMedication,
    addMedication,
    updateMedication,
    deleteMedication,
    supplements,
    toggleSupplement,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    setActivePage,
    celebrate,
  } = useBinder();

  const [timingFilter, setTimingFilter] = useState<'All' | SupplementItem['timing']>('All');

  // Add/Edit Medication modal
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medRx, setMedRx] = useState('');
  const [medPharmacy, setMedPharmacy] = useState('Froedtert Community Pharmacy');
  const [medRefillDate, setMedRefillDate] = useState('Dec 15, 2026');
  const [medPrescriber, setMedPrescriber] = useState('');
  const [medStatus, setMedStatus] = useState<MedicationItem['status']>('Active');

  // Add/Edit Supplement modal
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supDosage, setSupDosage] = useState('');
  const [supTiming, setSupTiming] = useState<SupplementItem['timing']>('Morning');
  const [supPurpose, setSupPurpose] = useState('');

  const activeMeds = medications.filter((m) => m.status !== 'Paused');
  const totalDailyCount = activeMeds.length + supplements.length;
  const takenCount =
    activeMeds.filter((m) => m.takenToday).length +
    supplements.filter((s) => s.takenToday).length;
  const needRefillMeds = medications.filter((m) => m.status === 'Need Refill');

  const openAddMed = () => {
    setEditingMedId(null);
    setMedName('');
    setMedDosage('');
    setMedFreq('');
    setMedRx('');
    setMedPharmacy('Froedtert Community Pharmacy');
    setMedRefillDate('Dec 15, 2026');
    setMedPrescriber('');
    setMedStatus('Active');
    setIsMedModalOpen(true);
  };

  const openEditMed = (med: MedicationItem) => {
    setEditingMedId(med.id);
    setMedName(med.name);
    setMedDosage(med.dosage);
    setMedFreq(med.frequency);
    setMedRx(med.rxNumber || '');
    setMedPharmacy(med.pharmacy || '');
    setMedRefillDate(med.refillDate || '');
    setMedPrescriber(med.prescriber || '');
    setMedStatus(med.status);
    setIsMedModalOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    const payload = {
      name: medName.trim(),
      dosage: medDosage.trim(),
      frequency: medFreq.trim(),
      rxNumber: medRx.trim() || undefined,
      pharmacy: medPharmacy.trim() || undefined,
      refillDate: medRefillDate.trim() || undefined,
      prescriber: medPrescriber.trim() || undefined,
      status: medStatus,
    };

    if (editingMedId) {
      updateMedication(editingMedId, payload);
      celebrate();
    } else {
      addMedication(payload);
    }
    setIsMedModalOpen(false);
  };

  const openAddSup = () => {
    setEditingSupId(null);
    setSupName('');
    setSupDosage('');
    setSupTiming('Morning');
    setSupPurpose('');
    setIsSupModalOpen(true);
  };

  const openEditSup = (sup: SupplementItem) => {
    setEditingSupId(sup.id);
    setSupName(sup.name);
    setSupDosage(sup.dosage);
    setSupTiming(sup.timing);
    setSupPurpose(sup.purpose);
    setIsSupModalOpen(true);
  };

  const handleSaveSup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    const payload = {
      name: supName.trim(),
      dosage: supDosage.trim(),
      timing: supTiming,
      purpose: supPurpose.trim(),
    };
    if (editingSupId) {
      updateSupplement(editingSupId, payload);
      celebrate();
    } else {
      addSupplement(payload);
    }
    setIsSupModalOpen(false);
  };

  const handleCycleStatus = (med: MedicationItem) => {
    const order: MedicationItem['status'][] = ['Active', 'Need Refill', 'Paused'];
    const next = order[(order.indexOf(med.status) + 1) % order.length];
    updateMedication(med.id, { status: next });
  };

  const handleMarkRefilled = (med: MedicationItem) => {
    updateMedication(med.id, {
      status: 'Active',
      refillDate: 'Dec 28, 2026',
    });
    celebrate();
  };

  const filteredSupplements =
    timingFilter === 'All'
      ? supplements
      : supplements.filter((s) => s.timing === timingFilter);

  return (
    <div className="space-y-6">
      {/* Top Sync Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hud-panel hud-corners washi-tape-top p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/75 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Today&apos;s Daily Protocol</span>
            <CheckCircle2 className="w-4 h-4 text-[#be7fab]" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            {takenCount} / {totalDailyCount}
          </div>
          <div className="text-[11px] text-[#be7fab] dark:text-[#daabcb] mt-1 font-mono font-semibold">
            Auto-synced to Daily Command Center
          </div>
        </div>

        <div className="hud-panel hud-corners washi-tape-top p-4">
          <div className="text-xs font-semibold text-[#2d1b28]/75 dark:text-[#e6c3db] flex items-center justify-between">
            <span>Pharmacy Refill Radar</span>
            <AlertCircle className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
            {needRefillMeds.length} Due
          </div>
          <div className="text-[11px] text-[#2d1b28]/65 dark:text-[#d29ec2]/80 mt-1">
            {medications.length} active Rx profiles monitored
          </div>
        </div>

        <div className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between border-[#be7fab]! bg-[#e6c3db]/45 dark:bg-[#be7fab]/10">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
            <span>Command Center Feed</span>
            <Activity className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          </div>
          <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/85 my-1">
            Check-offs here immediately update your Today dashboard checklist.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('today')}
            className="self-start text-[11px] font-bold px-3 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] text-white dark:text-[#120a10] transition-colors"
          >
            View on Today Dashboard →
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications & Pharmacy Prescriptions */}
        <div className="hud-panel hud-corners p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                <Pill className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Medications &amp; Pharmacy Prescriptions
                </h3>
                <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                  Daily checklist, Rx numbers, prescriber &amp; refill tracker
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddMed}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] dark:bg-[#daabcb] hover:bg-[#d29ec2] dark:hover:bg-[#efd0e5] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rx / Med</span>
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  med.takenToday
                    ? 'bg-[#e6c3db]/65 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/45'
                    : 'bg-[#efd0e5]/40 dark:bg-[#120a10]/85 border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleMedication(med.id)}
                      className="mt-0.5 shrink-0"
                      title={med.takenToday ? 'Mark not taken' : 'Mark taken today'}
                    >
                      {med.takenToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#be7fab] fill-[#be7fab]/25" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#be7fab]/65 dark:text-[#d29ec2]/55 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            med.takenToday ? 'line-through text-[#2d1b28]/55 dark:text-[#d29ec2]/70' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                          }`}
                        >
                          {med.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] font-mono font-semibold">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">{med.frequency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(med)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        med.status === 'Need Refill'
                          ? 'bg-[#be7fab] text-white dark:text-[#120a10] border-[#be7fab] dark:border-[#efd0e5]'
                          : med.status === 'Active'
                          ? 'bg-[#e6c3db] dark:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab]/50'
                          : 'bg-[#efd0e5]/60 dark:bg-[#1c0f19] text-[#2d1b28]/65 dark:text-[#d29ec2]/70 border-[#d29ec2] dark:border-[#be7fab]/25'
                      }`}
                      title="Click to cycle status (Active / Need Refill / Paused)"
                    >
                      {med.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditMed(med)}
                      className="p-1 text-[#2d1b28]/65 dark:text-[#d29ec2]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                      title="Edit prescription"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMedication(med.id)}
                      className="p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/15 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#2d1b28]/75 dark:text-[#d29ec2]/85 font-mono">
                  <span>
                    {med.pharmacy || 'Pharmacy'} · {med.rxNumber || 'OTC / Rx'}
                    {med.prescriber ? ` · ${med.prescriber}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2d1b28] dark:text-[#efd0e5] font-semibold">Refill: {med.refillDate || 'Ongoing'}</span>
                    {med.status === 'Need Refill' && (
                      <button
                        type="button"
                        onClick={() => handleMarkRefilled(med)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#be7fab] dark:bg-[#daabcb] hover:bg-[#d29ec2] dark:hover:bg-[#efd0e5] text-white dark:text-[#120a10] font-bold"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Mark Refilled</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Supplements */}
        <div className="hud-panel hud-corners p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Daily Supplements
                </h3>
                <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                  Vitamins, minerals, collagen &amp; targeted nutrition timing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddSup}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] dark:bg-[#daabcb] hover:bg-[#d29ec2] dark:hover:bg-[#efd0e5] rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplement</span>
            </button>
          </div>

          {/* Timing filter bar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['All', 'Morning', 'Midday', 'Evening', 'Bedtime'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimingFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  timingFilter === t
                    ? 'bg-[#be7fab] text-white dark:text-[#120a10]'
                    : 'bg-[#efd0e5]/55 dark:bg-[#120a10]/80 text-[#2d1b28]/80 dark:text-[#e6c3db] border border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredSupplements.map((sup) => (
              <div
                key={sup.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  sup.takenToday
                    ? 'bg-[#e6c3db]/65 dark:bg-[#be7fab]/12 border-[#be7fab] dark:border-[#be7fab]/45'
                    : 'bg-[#efd0e5]/40 dark:bg-[#120a10]/85 border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSupplement(sup.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {sup.takenToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#be7fab] fill-[#be7fab]/25" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#be7fab]/65 dark:text-[#d29ec2]/55 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            sup.takenToday ? 'line-through text-[#2d1b28]/55 dark:text-[#d29ec2]/70' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                          }`}
                        >
                          {sup.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] font-mono font-semibold">
                          {sup.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
                        {sup.timing} · <em className="text-[#be7fab] dark:text-[#daabcb]">{sup.purpose}</em>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sup.takenToday
                          ? 'text-white dark:text-[#120a10] bg-[#be7fab] dark:bg-[#daabcb]'
                          : 'text-[#2d1b28]/75 dark:text-[#e6c3db]/75 bg-[#efd0e5]/65 dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/30'
                      }`}
                    >
                      {sup.takenToday ? 'Taken' : 'Pending'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditSup(sup)}
                      className="p-1 text-[#2d1b28]/65 dark:text-[#d29ec2]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                      title="Edit supplement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSupplement(sup.id)}
                      className="p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                      title="Delete supplement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Medication Modal */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative bg-white dark:bg-[#1c0f19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {editingMedId ? 'Edit Pharmacy Prescription' : 'Add Medication / Prescription'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMedModalOpen(false)}
                className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Levothyroxine, Atorvastatin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 75 mcg Tablet"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Rx Number</label>
                  <input
                    type="text"
                    placeholder="RX-12345"
                    value={medRx}
                    onChange={(e) => setMedRx(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Frequency &amp; Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Once daily morning with water"
                  value={medFreq}
                  onChange={(e) => setMedFreq(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Pharmacy</label>
                  <input
                    type="text"
                    value={medPharmacy}
                    onChange={(e) => setMedPharmacy(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Refill Date</label>
                  <input
                    type="text"
                    value={medRefillDate}
                    onChange={(e) => setMedRefillDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Prescriber</label>
                  <input
                    type="text"
                    placeholder="Dr. Mitchell, MD"
                    value={medPrescriber}
                    onChange={(e) => setMedPrescriber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Status</label>
                  <select
                    value={medStatus}
                    onChange={(e) => setMedStatus(e.target.value as MedicationItem['status'])}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Need Refill">Need Refill</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg"
                >
                  {editingMedId ? 'Save Changes' : 'Save Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Supplement Modal */}
      {isSupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 shadow-2xl relative bg-white dark:bg-[#1c0f19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {editingSupId ? 'Edit Supplement' : 'Add Daily Supplement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSupModalOpen(false)}
                className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSup} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Supplement Name</label>
                <input
                  type="text"
                  placeholder="e.g. Magnesium Glycinate, Zinc, CoQ10"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 400 mg"
                    value={supDosage}
                    onChange={(e) => setSupDosage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Timing</label>
                  <select
                    value={supTiming}
                    onChange={(e) => setSupTiming(e.target.value as SupplementItem['timing'])}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Midday">Midday</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Purpose / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Sleep recovery, joint comfort, immune"
                  value={supPurpose}
                  onChange={(e) => setSupPurpose(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg"
                >
                  {editingSupId ? 'Save Changes' : 'Save Supplement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
