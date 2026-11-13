import React, { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Droplets,
  Wind,
  PenLine,
  X,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Check,
  Sparkles,
  ArrowUpRight,
  ChevronUp,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

type ActiveModal = 'water' | 'meditation' | 'journal' | null;

const MEDITATION_TOTAL_SECONDS = 5 * 60;

export const TodayQuickActionMenu: React.FC = () => {
  const {
    habitCards,
    setWaterGlassesForHabit,
    addHabitCard,
    addNote,
    setActivePage,
    celebrate,
  } = useBinder();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Meditation timer state (5 minutes = 300 seconds)
  const [medSecondsLeft, setMedSecondsLeft] = useState(MEDITATION_TOTAL_SECONDS);
  const [medRunning, setMedRunning] = useState(false);
  const [breathTick, setBreathTick] = useState(0);

  // Journal entry state
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalPinned, setJournalPinned] = useState(false);
  const journalTextareaRef = useRef<HTMLTextAreaElement>(null);

  const waterHabit = habitCards.find((h) => h.isWaterHabit);
  const currentWater = waterHabit?.waterGlasses ?? 0;

  const showToastMessage = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Play soft completion bell when 5-min meditation finishes
  const playMeditationChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      [432, 540, 648].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);
        gain.gain.setValueAtTime(0.18, now + idx * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 1.25);
      });
    } catch {
      // Ignore if AudioContext is blocked
    }
  };

  // Meditation countdown & gentle breathing cycle
  useEffect(() => {
    if (!medRunning) return;
    const id = window.setInterval(() => {
      setBreathTick((b) => (b + 1) % 14);
      setMedSecondsLeft((prev) => {
        if (prev <= 1) {
          setMedRunning(false);
          playMeditationChime();
          celebrate();
          showToastMessage('5-minute meditation complete. Well centered!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [medRunning, celebrate]);

  // Auto-focus journal box when Journal Entry modal opens
  useEffect(() => {
    if (activeModal !== 'journal') return;
    const timer = window.setTimeout(() => {
      journalTextareaRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, [activeModal]);

  const handleSetWaterGlasses = (nextCount: number) => {
    const clamped = Math.max(0, Math.min(8, nextCount));
    if (waterHabit) {
      setWaterGlassesForHabit(waterHabit.id, clamped);
    } else {
      addHabitCard({
        title: 'Drink 8 Glasses of Water',
        column: clamped === 8 ? 'done' : 'todo',
        category: 'Wellness',
        isWaterHabit: true,
        waterGlasses: clamped,
        streak: 1,
      });
    }
    if (clamped > currentWater) {
      celebrate();
      showToastMessage(`Water intake logged: ${clamped}/8 glasses`);
    }
  };

  const handleOpenMeditation = () => {
    setIsMenuOpen(false);
    setMedSecondsLeft(MEDITATION_TOTAL_SECONDS);
    setBreathTick(0);
    setMedRunning(true);
    setActiveModal('meditation');
  };

  const handleOpenJournal = () => {
    setIsMenuOpen(false);
    const todayLabel = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setJournalTitle(`Daily Reflection · ${todayLabel}`);
    setJournalContent('');
    setJournalPinned(false);
    setActiveModal('journal');
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    addNote({
      title: journalTitle.trim() || 'Daily Journal Entry',
      content: journalContent.trim(),
      category: 'Journal',
      pinned: journalPinned,
    });
    celebrate();
    setActiveModal(null);
    setJournalContent('');
    showToastMessage('Journal entry saved to Notebook & Journal Logs!');
  };

  const medMins = Math.floor(medSecondsLeft / 60);
  const medSecs = medSecondsLeft % 60;
  const medFormatted = `${String(medMins).padStart(2, '0')}:${String(medSecs).padStart(2, '0')}`;
  const medProgress = Math.round(
    ((MEDITATION_TOTAL_SECONDS - medSecondsLeft) / MEDITATION_TOTAL_SECONDS) * 100
  );

  const breathPhase =
    breathTick < 4 ? 'Inhale deeply...' : breathTick < 8 ? 'Hold gently...' : 'Exhale slowly...';

  return (
    <>
      {/* Confirmation Toast */}
      {toast && (
        <div className="fixed bottom-36 lg:bottom-20 left-4 lg:left-72 z-40 max-w-xs flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1c0f19] border border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_8px_24px_rgba(45,27,40,0.2)] dark:shadow-[0_0_24px_rgba(190,127,171,0.45)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#be7fab] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Floating Quick Action Menu (Today Dashboard) */}
      <div className="fixed bottom-24 lg:bottom-5 left-4 lg:left-72 z-30 lg:z-40 select-none">
        {/* Expanded Pop-Up Quick Action Card */}
        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Today Quick Actions"
            className="mb-2.5 w-64 hud-panel hud-corners p-3 bg-white/95 dark:bg-[#1c0f19]/95 backdrop-blur-md border border-[#be7fab] shadow-[0_12px_36px_rgba(45,27,40,0.24)] dark:shadow-[0_0_32px_rgba(190,127,171,0.4)] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#be7fab] dark:text-[#daabcb] flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                <span>Quick Action Menu</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-0.5 rounded text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20"
                aria-label="Close quick action menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Log Water Intake */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveModal('water');
              }}
              className="w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#efd0e5]/65 dark:bg-[#120a10]/90 hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#be7fab]/40 hover:border-[#be7fab] text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-[#be7fab] text-[#120a10] shrink-0">
                  <Droplets className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                    Log Water Intake
                  </div>
                  <div className="text-[10px] font-mono text-[#be7fab] dark:text-[#daabcb]">
                    {currentWater} / 8 glasses today
                  </div>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-[#be7fab] shrink-0" />
            </button>

            {/* 2. Start 5-min Meditation */}
            <button
              type="button"
              onClick={handleOpenMeditation}
              className="w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#efd0e5]/65 dark:bg-[#120a10]/90 hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#be7fab]/40 hover:border-[#be7fab] text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-[#daabcb] text-[#120a10] shrink-0">
                  <Wind className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                    Start 5-min Meditation
                  </div>
                  <div className="text-[10px] font-mono text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                    Guided breath &amp; reset
                  </div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-[#be7fab] shrink-0" />
            </button>

            {/* 3. Journal Entry */}
            <button
              type="button"
              onClick={handleOpenJournal}
              className="w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#efd0e5]/65 dark:bg-[#120a10]/90 hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#be7fab]/40 hover:border-[#be7fab] text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-[#d29ec2] text-[#120a10] shrink-0">
                  <PenLine className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                    Journal Entry
                  </div>
                  <div className="text-[10px] font-mono text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                    Capture reflection &amp; save
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#be7fab] shrink-0" />
            </button>
          </div>
        )}

        {/* Collapsed Floating Pill Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all active:scale-95 ${
            isMenuOpen
              ? 'bg-[#be7fab] text-[#120a10] border-[#efd0e5] shadow-[0_0_24px_rgba(190,127,171,0.65)]'
              : 'bg-white/95 dark:bg-[#1c0f19]/95 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab]/70 hover:border-[#be7fab] shadow-[0_0_18px_rgba(190,127,171,0.3)]'
          }`}
        >
          <span
            className={`p-1 rounded-lg ${
              isMenuOpen
                ? 'bg-[#120a10]/15 text-[#120a10]'
                : 'bg-[#be7fab] text-[#120a10]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold tracking-tight">Quick Action</span>
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Modal 1: Log Water Intake */}
      {activeModal === 'water' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-panel hud-corners w-full max-w-sm p-5 bg-white dark:bg-[#1c0f19] border border-[#be7fab] shadow-[0_0_40px_rgba(190,127,171,0.45)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#be7fab] text-[#120a10]">
                  <Droplets className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    Log Water Intake
                  </h3>
                  <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono">
                    Syncs directly to Daily Habits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 rounded-2xl bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35">
              <div className="text-3xl font-extrabold font-mono text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                {currentWater} <span className="text-base text-[#be7fab]">/ 8 glasses</span>
              </div>
              <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono mt-0.5">
                {currentWater * 8} oz of 64 oz daily target
              </div>

              {/* 8 Interactive Water Glass Taps */}
              <div className="grid grid-cols-8 gap-1.5 px-4 mt-3">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const filled = idx < currentWater;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetWaterGlasses(idx + 1)}
                      className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                        filled
                          ? 'bg-[#be7fab] border-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.45)]'
                          : 'bg-white dark:bg-[#1c0f19] border-[#d29ec2] dark:border-[#be7fab]/35 text-[#be7fab]/45 hover:border-[#be7fab]'
                      }`}
                      title={`Set ${idx + 1} glass${idx > 0 ? 'es' : ''}`}
                    >
                      <Droplets className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetWaterGlasses(currentWater - 1)}
                disabled={currentWater <= 0}
                className="p-2.5 rounded-xl bg-[#e6c3db]/75 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 text-[#2d1b28] dark:text-[#efd0e5] disabled:opacity-35"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetWaterGlasses(currentWater + 1)}
                disabled={currentWater >= 8}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-45 text-[#120a10] text-xs font-bold shadow-[0_0_15px_rgba(190,127,171,0.45)] transition-all active:scale-95"
              >
                +1 Glass (8 oz)
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-2.5 rounded-xl bg-[#e6c3db]/75 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: 5-Minute Meditation HUD */}
      {activeModal === 'meditation' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/60 dark:bg-[#120a10]/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-panel hud-corners w-full max-w-sm p-6 bg-white dark:bg-[#1c0f19] border border-[#be7fab] shadow-[0_0_45px_rgba(190,127,171,0.5)] text-center space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab] text-[#120a10]">
                  <Wind className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  5-Min Mindful Meditation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Animated Breathing Halo */}
            <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
              <div
                className={`absolute inset-2 rounded-full bg-radial from-[#be7fab]/35 via-[#daabcb]/15 to-transparent border-2 border-[#be7fab]/70 transition-all duration-1000 ${
                  medRunning && breathTick < 8 ? 'scale-105 opacity-100' : 'scale-95 opacity-75'
                }`}
              />
              <div className="relative z-10">
                <div className="text-4xl font-extrabold font-mono text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {medFormatted}
                </div>
                <div className="text-xs font-semibold text-[#be7fab] dark:text-[#daabcb] mt-1">
                  {medSecondsLeft === 0
                    ? 'Session Complete'
                    : medRunning
                    ? breathPhase
                    : 'Paused'}
                </div>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] transition-all duration-500"
                style={{ width: `${medProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (medSecondsLeft === 0) setMedSecondsLeft(MEDITATION_TOTAL_SECONDS);
                  setMedRunning((r) => !r);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] text-xs font-bold shadow-[0_0_16px_rgba(190,127,171,0.45)] transition-all"
              >
                {medRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{medSecondsLeft === 0 ? 'Restart 5:00' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMedRunning(false);
                  setMedSecondsLeft(MEDITATION_TOTAL_SECONDS);
                  setBreathTick(0);
                }}
                className="p-2.5 rounded-xl bg-[#e6c3db]/75 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 text-[#2d1b28] dark:text-[#efd0e5]"
                title="Reset 5-minute meditation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Quick Journal Entry */}
      {activeModal === 'journal' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/60 dark:bg-[#120a10]/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border border-[#be7fab] shadow-[0_0_45px_rgba(190,127,171,0.45)]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#be7fab] text-[#120a10]">
                  <PenLine className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    New Journal Entry
                  </h3>
                  <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                    Saves straight to Notebook &amp; Journal Logs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJournal} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Entry Title
                </label>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Daily Reflection..."
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none focus:border-[#be7fab]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Thoughts, Gratitude &amp; Intentions
                </label>
                <textarea
                  ref={journalTextareaRef}
                  rows={5}
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="What is top of mind right now? Gratitude, wins, or focus..."
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] border-2 border-[#be7fab] rounded-xl text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/55 resize-none focus:outline-none focus:ring-2 focus:ring-[#be7fab]/35"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-[#2d1b28] dark:text-[#e6c3db] font-semibold">
                  <input
                    type="checkbox"
                    checked={journalPinned}
                    onChange={(e) => setJournalPinned(e.target.checked)}
                    className="rounded accent-[#be7fab]"
                  />
                  <span>Pin entry to top</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setActivePage('notes');
                  }}
                  className="text-[11px] font-bold text-[#be7fab] dark:text-[#daabcb] hover:underline flex items-center gap-1"
                >
                  <span>Open Journal Tab</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/55 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 text-[#2d1b28]/75 dark:text-[#e6c3db] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] font-bold shadow-[0_0_16px_rgba(190,127,171,0.45)] transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
