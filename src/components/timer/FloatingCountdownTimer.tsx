import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Bell,
  Volume2,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const FloatingCountdownTimer: React.FC = () => {
  const { celebrate } = useBinder();
  const [isOpen, setIsOpen] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [isAlertRinging, setIsAlertRinging] = useState(false);

  const presets = [10, 15, 20, 30, 60];

  const playAlertChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const now = ctx.currentTime;
      [
        { freq: 523.25, time: now },
        { freq: 659.25, time: now + 0.15 },
        { freq: 783.99, time: now + 0.3 },
        { freq: 1046.50, time: now + 0.45 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.65);
      });
    } catch (e) {
      console.error('Audio playback error', e);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsAlertRinging(true);
            playAlertChime();
            celebrate();
            setTimeout(() => setIsAlertRinging(false), 5000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, celebrate]);

  const selectPreset = (mins: number) => {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setCustomMinutes(mins.toString());
    setIsRunning(false);
    setIsAlertRinging(false);
  };

  const applyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0) {
      const secs = val * 60;
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
      setIsRunning(false);
      setIsAlertRinging(false);
    }
  };

  const toggleRun = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(totalSeconds);
    }
    setIsRunning(!isRunning);
    setIsAlertRinging(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
    setIsAlertRinging(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0
    ? Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100)
    : 0;

  return (
    <div className="fixed bottom-24 lg:bottom-5 right-4 lg:right-5 z-30 lg:z-40 select-none">
      {/* Collapsed HUD Timer Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all active:scale-95 ${
            isAlertRinging
              ? 'bg-[#be7fab] text-[#120a10] animate-bounce border-[#efd0e5]'
              : isRunning
              ? 'bg-white/95 dark:bg-[#1c0f19]/95 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab] ring-2 ring-[#be7fab]/35 shadow-[0_0_20px_rgba(190,127,171,0.4)]'
              : 'bg-white/95 dark:bg-[#1c0f19]/95 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#be7fab]/55 hover:border-[#be7fab] shadow-[0_0_15px_rgba(190,127,171,0.2)]'
          }`}
          title="Open Floating Focus Countdown Timer"
        >
          <div className="relative">
            <Timer className={`w-4 h-4 ${isAlertRinging ? 'text-[#120a10]' : 'text-[#be7fab] dark:text-[#daabcb]'} ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#be7fab] dark:bg-[#efd0e5] animate-ping" />
            )}
          </div>
          <span className={`font-bold text-sm tabular-nums tracking-wide font-mono ${isAlertRinging ? 'text-[#120a10]' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
            {formatTime(secondsRemaining)}
          </span>
          <ChevronUp className={`w-3.5 h-3.5 ${isAlertRinging ? 'text-[#120a10]' : 'text-[#be7fab] dark:text-[#e6c3db]'}`} />
        </button>
      )}

      {/* Expanded HUD Timer Card */}
      {isOpen && (
        <div className="hud-panel hud-corners washi-tape-top w-80 p-4 shadow-[0_12px_36px_rgba(45,27,40,0.25)] dark:shadow-[0_0_40px_rgba(0,0,0,0.7)] border-[#be7fab] relative animate-in fade-in zoom-in-95 duration-150 bg-white dark:bg-[#1c0f19]">
          <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
                <Timer className="w-4 h-4" />
              </span>
              <span className="font-display text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                Focus Countdown Timer
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={playAlertChime}
                title="Test alert chime"
                className="p-1 text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                title="Minimize timer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isAlertRinging && (
            <div className="my-2 p-2 rounded-xl bg-[#be7fab]/25 border border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-bold flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb] animate-bounce" />
                Time is up! Great focus session!
              </span>
              <button
                onClick={() => setIsAlertRinging(false)}
                className="text-[10px] text-[#2d1b28] dark:text-[#efd0e5] font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Central Digital Timer Display */}
          <div className="my-3 text-center py-2.5 bg-[#e6c3db]/75 dark:bg-[#120a10] rounded-2xl border border-[#d29ec2] dark:border-[#be7fab]/40 shadow-inner">
            <div className="text-4xl font-extrabold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums tracking-wider font-mono">
              {formatTime(secondsRemaining)}
            </div>
            <div className="text-[10px] font-semibold text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5 font-mono uppercase">
              {isRunning ? 'Session Active · Focused' : secondsRemaining === 0 ? 'Completed' : 'Standby / Ready'}
            </div>

            <div className="w-5/6 mx-auto h-2 bg-white dark:bg-[#241420] border border-[#d29ec2] dark:border-[#be7fab]/25 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-linear-to-r from-[#be7fab] to-[#d29ec2] dark:to-[#efd0e5] transition-all duration-300 shadow-[0_0_8px_rgba(190,127,171,0.7)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 my-2.5">
            <button
              onClick={toggleRun}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isRunning
                  ? 'bg-[#d29ec2] hover:bg-[#daabcb] text-[#120a10]'
                  : 'bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] shadow-[0_0_15px_rgba(190,127,171,0.4)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{secondsRemaining === 0 ? 'Restart' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-2 text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] bg-[#e6c3db] dark:bg-[#241420] hover:bg-[#d29ec2] rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/45 transition-all"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25">
            <div className="text-[10px] font-bold text-[#2d1b28]/75 dark:text-[#e6c3db]/75 uppercase tracking-wider mb-1.5 font-mono">
              One-Click Presets (Min)
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map(mins => (
                <button
                  key={mins}
                  onClick={() => selectPreset(mins)}
                  className={`py-1 text-xs font-bold font-mono rounded-lg border transition-all ${
                    totalSeconds === mins * 60
                      ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] shadow-[0_0_10px_rgba(190,127,171,0.4)] font-extrabold'
                      : 'bg-[#e6c3db]/60 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={applyCustomMinutes} className="mt-2.5 flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="240"
              placeholder="Custom mins"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#be7fab] tabular-nums font-mono text-[#2d1b28] dark:text-[#efd0e5]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg transition-colors"
            >
              Set
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
