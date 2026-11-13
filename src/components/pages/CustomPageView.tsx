import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Save,
  StickyNote,
  Check,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { DynamicIcon } from '../../utils/iconHelper';

interface CustomPageViewProps {
  pageId: string;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({ pageId }) => {
  const { customPages, updateCustomPage, deleteCustomPage, setActivePage, celebrate } = useBinder();
  const page = customPages.find((p) => p.id === pageId);

  const [newItemText, setNewItemText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);

  if (!page) {
    return (
      <div className="hud-panel hud-corners p-8 text-center space-y-4">
        <h3 className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5]">Section Not Found</h3>
        <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80">This custom section may have been removed.</p>
        <button
          onClick={() => setActivePage('today')}
          className="px-4 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl"
        >
          Return to Today
        </button>
      </div>
    );
  }

  const toggleItem = (itemId: string) => {
    const updated = page.items.map((it) => {
      if (it.id === itemId) {
        const next = !it.done;
        if (next) celebrate();
        return { ...it, done: next };
      }
      return it;
    });
    updateCustomPage(page.id, { items: updated });
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: `ci-${Date.now()}`,
      text: newItemText.trim(),
      done: false,
    };
    updateCustomPage(page.id, { items: [...page.items, newItem] });
    setNewItemText('');
    celebrate();
  };

  const deleteItem = (itemId: string) => {
    const updated = page.items.filter((it) => it.id !== itemId);
    updateCustomPage(page.id, { items: updated });
  };

  const saveNotes = () => {
    updateCustomPage(page.id, { notes: notesDraft });
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#120a10] bg-[#be7fab] shadow-[0_0_16px_rgba(190,127,171,0.5)]">
            <DynamicIcon name={page.icon} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              {page.name}
            </h2>
            <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
              Custom Command Section · Created {page.createdAt}
            </p>
          </div>
        </div>

        {confirmDeleteSection ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteCustomPage(page.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Delete</span>
            </button>
            <button
              onClick={() => setConfirmDeleteSection(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDeleteSection(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db]/75 dark:bg-[#be7fab]/20 hover:bg-[#be7fab]/35 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/45 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
            <span>Delete Section</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Notes Pad */}
        <div className="hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <StickyNote className="w-4 h-4" />
                </span>
                <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Section Notes &amp; Outline
                </h3>
              </div>

              {!isEditingNotes ? (
                <button
                  onClick={() => {
                    setNotesDraft(page.notes);
                    setIsEditingNotes(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="p-1 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="flex items-center gap-1 text-xs font-bold text-[#120a10] bg-[#be7fab] px-2.5 py-1 rounded-lg"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={8}
                className="w-full p-3 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl font-sans focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5] leading-relaxed"
                autoFocus
              />
            ) : (
              <div className="p-3 bg-[#e6c3db]/55 dark:bg-[#120a10]/75 rounded-xl border border-[#d29ec2]/50 dark:border-[#be7fab]/25 text-xs text-[#2d1b28]/90 dark:text-[#e6c3db] leading-relaxed whitespace-pre-wrap min-h-[160px]">
                {page.notes || 'No notes added yet. Click edit to jot down ideas.'}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20 text-[10px] text-[#2d1b28]/60 dark:text-[#d29ec2]/75 mt-4">
            Custom HUD notepad
          </div>
        </div>

        {/* Checklist */}
        <div className="hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 mb-3">
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Action Items ({page.items.filter((i) => i.done).length}/{page.items.length})
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/40">
                Checklist
              </span>
            </div>

            <div className="space-y-2 my-3 max-h-72 overflow-y-auto pr-1">
              {page.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all group border ${
                    item.done
                      ? 'bg-[#e6c3db]/70 dark:bg-[#be7fab]/12 border-[#be7fab]/40 dark:border-[#be7fab]/35 text-[#2d1b28]/60 dark:text-[#e6c3db]/65 line-through'
                      : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/80 border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5]'
                  }`}
                >
                  <div
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#be7fab]/65 dark:text-[#d29ec2]/55 group-hover:text-[#be7fab] dark:group-hover:text-[#efd0e5] shrink-0" />
                    )}
                    <span className="text-xs font-medium leading-snug truncate">{item.text}</span>
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {page.items.length === 0 && (
                <p className="text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 italic py-4 text-center">
                  No items in this checklist yet. Add one below!
                </p>
              )}
            </div>

            <form onSubmit={addItem} className="flex items-center gap-2 mt-4 pt-3 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
