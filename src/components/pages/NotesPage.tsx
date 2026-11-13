import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pin,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { NoteItem } from '../../types/binder';

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, celebrate } = useBinder();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteItem['category']>('Personal');
  const [pinned, setPinned] = useState(false);

  const categories = ['All', 'Personal', 'Ideas', 'Journal', 'Recipes', 'Lists'];

  const filteredNotes = notes
    .filter((n) => {
      const matchesCat = selectedCat === 'All' || n.category === selectedCat;
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: title.trim(),
        content: content.trim(),
        category,
        pinned,
      });
      setEditingNoteId(null);
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        category,
        pinned,
      });
    }
    setTitle('');
    setContent('');
    setIsAddOpen(false);
    celebrate();
  };

  const startEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setPinned(note.pinned);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
            Notebook & Journal Logs
          </h2>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
            Journal entries, culinary recipes, mindful musings, and quick lists
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNoteId(null);
            setTitle('');
            setContent('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes and journal entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.4)] font-bold'
                  : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between transition-all relative group ${
              note.pinned ? '!border-[#be7fab] ring-1 ring-[#be7fab]/45 shadow-[0_0_24px_rgba(190,127,171,0.25)]' : ''
            }`}
          >
            {note.pinned && (
              <div className="absolute top-3 right-3 text-[#be7fab]" title="Pinned to top">
                <Pin className="w-4 h-4 fill-[#be7fab]" />
              </div>
            )}

            <div>
              <div className="pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 pr-6">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#be7fab]/40 uppercase tracking-wide">
                  {note.category}
                </span>
                <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-1.5 leading-snug">
                  {note.title}
                </h3>
              </div>

              {note.imageSrc && (
                <div className="mt-3 rounded-xl overflow-hidden border border-[#d29ec2] dark:border-[#be7fab]/40 bg-[#efd0e5]/40 dark:bg-[#120a10]">
                  <img
                    src={note.imageSrc}
                    alt={note.title}
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              <div className="my-3 text-xs text-[#2d1b28]/85 dark:text-[#e6c3db] leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                {note.content}
              </div>
            </div>

            <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[11px] text-[#2d1b28]/65 dark:text-[#d29ec2]/75">
              <span>Updated: {note.updatedAt}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                  className="p-1 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                  title={note.pinned ? 'Unpin' : 'Pin to top'}
                >
                  <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-[#be7fab] text-[#be7fab]' : ''}`} />
                </button>
                <button
                  onClick={() => startEditNote(note)}
                  className="p-1 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                  title="Edit note"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Note Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {editingNoteId ? 'Edit Notebook Entry' : 'New Notebook Entry'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Reflections, Artisan Bread Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoteItem['category'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Ideas">Ideas</option>
                    <option value="Journal">Journal</option>
                    <option value="Recipes">Recipes</option>
                    <option value="Lists">Lists</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="pinnedNote"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="rounded accent-[#be7fab]"
                  />
                  <label htmlFor="pinnedNote" className="text-xs font-medium text-[#2d1b28] dark:text-[#efd0e5]">
                    Pin note to top
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Content (Markdown / Multi-line prose)
                </label>
                <textarea
                  placeholder="Write your entry here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  {editingNoteId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
