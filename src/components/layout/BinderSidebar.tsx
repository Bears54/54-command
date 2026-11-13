import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CalendarDays,
  Calendar,
  LayoutGrid,
  Heart,
  Wallet,
  Sparkles,
  Activity,
  UtensilsCrossed,
  Hammer,
  Film,
  Users,
  StickyNote,
  FolderArchive,
  Settings,
  Compass,
  Images,
  Music,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { PageId } from '../../types/binder';
import { DynamicIcon } from '../../utils/iconHelper';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const BinderSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activePage,
    setActivePage,
    customPages,
    addCustomPage,
    deleteCustomPage,
    todos,
    habits,
    bills,
  } = useBinder();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sprout');
  const [selectedColor] = useState('#be7fab');

  const pendingTodos = todos.filter((t) => !t.completed).length;
  const pendingHabits = habits.filter((h) => !h.completedToday).length;
  const unpaidBills = bills.filter((b) => !b.isPaid).length;

  const standardNavItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban Tasks', icon: <LayoutGrid className="w-4 h-4" />, badge: pendingTodos || undefined },
    { id: 'habits', label: 'Daily Habits', icon: <Heart className="w-4 h-4" />, badge: pendingHabits || undefined },
    { id: 'finance', label: 'Finance Hub', icon: <Wallet className="w-4 h-4" />, badge: unpaidBills || undefined },
    { id: 'cleaning', label: 'Cleaning', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'wellness', label: 'Wellness', icon: <Activity className="w-4 h-4" /> },
    { id: 'meals', label: 'Meal Planning', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'projects', label: 'Home Projects', icon: <Hammer className="w-4 h-4" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Film className="w-4 h-4" /> },
    { id: 'albums', label: 'Photo Albums', icon: <Images className="w-4 h-4" /> },
    { id: 'music', label: 'Offline Music', icon: <Music className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote className="w-4 h-4" /> },
    { id: 'documents', label: 'Document Hub', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'setup', label: 'Setup & Sync', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelectPage = (id: PageId) => {
    setActivePage(id);
    onClose();
  };

  const handleCreateCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    addCustomPage(newPageName, selectedIcon, selectedColor);
    setNewPageName('');
    setIsAddModalOpen(false);
    onClose();
  };

  const availableIcons = [
    'Sprout', 'Star', 'Coffee', 'Dumbbell', 'Book', 'Shopping', 'Music', 'Plane', 'Lightbulb', 'GraduationCap',
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sleek Dual-Theme Vertical Command Rail */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-[#e6c3db] dark:bg-[#160b14] border-r border-[#d29ec2] dark:border-[#be7fab]/40 flex flex-col transition-all duration-300 ease-in-out shadow-[8px_0_32px_rgba(45,27,40,0.22)] dark:shadow-[8px_0_32px_rgba(0,0,0,0.65)] lg:shadow-none lg:static lg:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Rail Header / Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-[#d29ec2] dark:border-[#be7fab]/30 flex items-center justify-between bg-white/75 dark:bg-[#1c0f19]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#be7fab] dark:bg-[#be7fab]/20 border border-[#be7fab] flex items-center justify-center text-[#120a10] dark:text-[#efd0e5] shadow-[0_0_16px_rgba(190,127,171,0.4)]">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight leading-none">
                LifeBinder
              </h1>
              <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 font-medium tracking-wide mt-1">
                Mission Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2d1b28] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold text-[#2d1b28]/70 dark:text-[#e6c3db]/70 tracking-wide">
            Command Modules
          </div>

          {standardNavItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectPage(item.id)}
                className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all text-left border ${
                  isActive
                    ? 'bg-white dark:bg-[#be7fab]/22 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab] shadow-[0_4px_16px_rgba(190,127,171,0.28)] dark:shadow-[0_0_18px_rgba(190,127,171,0.32)]'
                    : 'bg-transparent text-[#2d1b28]/85 dark:text-[#e6c3db]/85 border-transparent hover:bg-white/65 dark:hover:bg-[#1c0f19] hover:border-[#d29ec2] dark:hover:border-[#d29ec2]/30 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                }`}
              >
                {/* Glowing Left Active Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#be7fab] shadow-[0_0_10px_#be7fab]" />
                )}

                <div className="flex items-center gap-2.5 truncate pl-1">
                  <span
                    className={`shrink-0 ${
                      isActive
                        ? 'text-[#be7fab] dark:text-[#efd0e5]'
                        : 'text-[#be7fab] dark:text-[#daabcb] group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`shrink-0 text-[10px] font-bold font-mono tabular-nums px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5]/50'
                        : 'bg-white/90 dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#daabcb] border-[#d29ec2] dark:border-[#d29ec2]/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom Pages Section */}
          {customPages.length > 0 && (
            <div className="pt-4 space-y-1">
              <div className="px-3 pb-1 text-[11px] font-semibold text-[#2d1b28]/70 dark:text-[#e6c3db]/70 tracking-wide">
                Custom Panels
              </div>
              {customPages.map((page) => {
                const isActive = activePage === page.id;

                return (
                  <div
                    key={page.id}
                    className="group relative flex items-center justify-between gap-1"
                  >
                    <button
                      onClick={() => handleSelectPage(page.id)}
                      className={`relative flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all text-left border ${
                        isActive
                          ? 'bg-white dark:bg-[#be7fab]/22 text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab] shadow-[0_4px_16px_rgba(190,127,171,0.28)] dark:shadow-[0_0_18px_rgba(190,127,171,0.32)]'
                          : 'bg-transparent text-[#2d1b28]/85 dark:text-[#e6c3db]/85 border-transparent hover:bg-white/65 dark:hover:bg-[#1c0f19] hover:border-[#d29ec2] dark:hover:border-[#d29ec2]/30 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#be7fab] shadow-[0_0_10px_#be7fab]" />
                      )}
                      <DynamicIcon
                        name={page.icon}
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-[#be7fab] dark:text-[#efd0e5]'
                            : 'text-[#be7fab] dark:text-[#daabcb]'
                        }`}
                      />
                      <span className="truncate">{page.name}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPage(page.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[#2d1b28]/70 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-opacity"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Sidebar Action: Keep "+ Add New Page" button */}
        <div className="p-4 border-t border-[#d29ec2] dark:border-[#be7fab]/30 bg-white/75 dark:bg-[#1c0f19]/80">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] text-xs font-bold tracking-wide transition-all shadow-[0_0_16px_rgba(190,127,171,0.35)] active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Page</span>
          </button>
        </div>
      </aside>

      {/* Add New Page Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/40">
              <h2 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Create Command Module
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#2d1b28]/75 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Reading List, Travel 2027"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-xl text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none focus:ring-2 focus:ring-[#be7fab]"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1.5">
                  Pick Module Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSelectedIcon(ic)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        selectedIcon === ic
                          ? 'border-[#be7fab] bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.5)]'
                          : 'border-[#d29ec2] dark:border-[#d29ec2]/35 bg-[#e6c3db]/50 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] hover:border-[#be7fab]'
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.45)] transition-all"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
