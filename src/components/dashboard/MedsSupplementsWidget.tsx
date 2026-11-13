import React from 'react';
import { Pill, Sparkles, CheckCircle2, Circle, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const MedsSupplementsWidget: React.FC = () => {
  const {
    medications,
    toggleMedication,
    supplements,
    toggleSupplement,
    setActivePage,
    setActiveWellnessTab,
  } = useBinder();

  const activeMeds = medications.filter((m) => m.status !== 'Paused');
  const totalItems = activeMeds.length + supplements.length;
  const takenCount =
    activeMeds.filter((m) => m.takenToday).length +
    supplements.filter((s) => s.takenToday).length;
  const needRefillCount = medications.filter((m) => m.status === 'Need Refill').length;
  const pct = totalItems > 0 ? Math.round((takenCount / totalItems) * 100) : 0;

  const openWellnessMedsTab = () => {
    setActiveWellnessTab('meds-supplements');
    setActivePage('wellness');
  };

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 space-y-3">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#d29ec2] dark:border-[#be7fab]/25">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 p-1.5 rounded-lg bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb] shrink-0">
            <Pill className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug">
              Today&apos;s Meds &amp; Vitamins
            </h3>
            <p className="text-[10px] font-mono text-[#2d1b28]/75 dark:text-[#e6c3db]/75 tabular-nums">
              {takenCount}/{totalItems} Taken Today · {pct}%
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openWellnessMedsTab}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#120a10] bg-[#daabcb] hover:bg-[#be7fab] dark:hover:bg-[#efd0e5] rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Open Medications, Prescriptions & Supplements"
        >
          <span>Manage Rx</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Progress Strip */}
      <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-[#be7fab] to-[#d29ec2] dark:to-[#efd0e5] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(190,127,171,0.5)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      {needRefillCount > 0 && (
        <button
          type="button"
          onClick={openWellnessMedsTab}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#be7fab]/20 border border-[#be7fab]/60 text-[11px] text-[#2d1b28] dark:text-[#efd0e5] hover:bg-[#be7fab]/30 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#efd0e5]" />
            <span>
              {needRefillCount} Prescription{needRefillCount > 1 ? 's' : ''} Need Refill
            </span>
          </span>
          <span className="text-[10px] font-mono text-[#2d1b28] dark:text-[#daabcb] font-bold">Review →</span>
        </button>
      )}

      {/* Meds Checklist */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {activeMeds.map((med) => (
          <button
            key={med.id}
            type="button"
            onClick={() => toggleMedication(med.id)}
            className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl border text-left transition-all ${
              med.takenToday
                ? 'bg-[#efd0e5]/55 dark:bg-[#be7fab]/12 border-[#be7fab]/35 opacity-80'
                : 'bg-[#e6c3db]/70 dark:bg-[#120a10]/85 border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {med.takenToday ? (
                <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[#be7fab]/70 dark:text-[#d29ec2]/55 shrink-0" />
              )}
              <div className="min-w-0">
                <div
                  className={`text-xs font-bold truncate ${
                    med.takenToday ? 'line-through text-[#2d1b28]/60 dark:text-[#d29ec2]/70' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                  }`}
                >
                  {med.name}
                </div>
                <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono truncate">
                  Rx · {med.dosage}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#2d1b28] dark:text-[#daabcb] shrink-0 uppercase">
              {med.status === 'Need Refill' ? 'Refill' : med.takenToday ? 'Done' : 'Rx'}
            </span>
          </button>
        ))}

        {/* Supplements Checklist */}
        {supplements.map((sup) => (
          <button
            key={sup.id}
            type="button"
            onClick={() => toggleSupplement(sup.id)}
            className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl border text-left transition-all ${
              sup.takenToday
                ? 'bg-[#efd0e5]/55 dark:bg-[#be7fab]/12 border-[#be7fab]/35 opacity-80'
                : 'bg-[#e6c3db]/70 dark:bg-[#120a10]/85 border-[#d29ec2] dark:border-[#be7fab]/25 hover:border-[#be7fab]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {sup.takenToday ? (
                <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[#be7fab]/70 dark:text-[#d29ec2]/55 shrink-0" />
              )}
              <div className="min-w-0">
                <div
                  className={`text-xs font-semibold truncate ${
                    sup.takenToday ? 'line-through text-[#2d1b28]/60 dark:text-[#d29ec2]/70' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                  }`}
                >
                  {sup.name}
                </div>
                <div className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono truncate">
                  {sup.timing} · {sup.dosage}
                </div>
              </div>
            </div>
            <Sparkles className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]/80 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
