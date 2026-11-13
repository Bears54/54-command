import React, { useState, useEffect } from 'react';
import { StickyNote, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const QuickNotesWidget: React.FC = () => {
  const { quickNotes, updateQuickNotes, setActivePage } = useBinder();
  const [localText, setLocalText] = useState(quickNotes);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setLocalText(quickNotes);
  }, [quickNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);
    updateQuickNotes(val);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1200);
  };

  const clearScratchpad = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setLocalText('');
    updateQuickNotes('');
    setConfirmClear(false);
  };

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/45">
            <StickyNote className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Quick Notes Scratchpad
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
              Instant command memo · Auto-saves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedIndicator && (
            <span className="text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/25 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#be7fab]/50">
              <Check className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" /> Saved
            </span>
          )}
          <button
            onClick={() => setActivePage('notes')}
            className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] transition-colors shadow-[0_0_12px_rgba(190,127,171,0.35)]"
          >
            <span>Notebook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editable Scratchpad Textarea */}
      <div className="my-2.5 flex-1 min-h-[140px] relative">
        <textarea
          value={localText}
          onChange={handleChange}
          placeholder="Jot down quick thoughts, telemetry, quotes, or reminders here..."
          className="w-full h-full min-h-[140px] p-3 text-xs text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db]/55 dark:bg-[#120a10]/85 rounded-xl border border-[#d29ec2] dark:border-[#d29ec2]/35 focus:outline-none focus:ring-2 focus:ring-[#be7fab]/50 focus:border-[#be7fab] resize-none font-sans leading-relaxed tracking-wide shadow-inner placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40"
        />
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
        <button
          onClick={clearScratchpad}
          className={`transition-colors flex items-center gap-1 text-[11px] font-medium ${
            confirmClear ? 'text-[#2d1b28] dark:text-[#efd0e5] font-bold underline' : 'hover:text-[#be7fab] dark:hover:text-[#daabcb]'
          }`}
        >
          <RotateCcw className="w-3 h-3" /> {confirmClear ? 'Confirm Clear?' : 'Clear pad'}
        </button>
        <button
          onClick={() => setActivePage('notes')}
          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-semibold"
        >
          Organize in notebook →
        </button>
      </div>
    </div>
  );
};
