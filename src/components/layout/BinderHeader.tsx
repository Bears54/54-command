import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Menu,
  RefreshCw,
  Download,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Sun,
  Moon,
  Hammer,
  StickyNote,
  UtensilsCrossed,
  Film,
  ArrowRight,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import {
  GlobalSearchCategory,
  GlobalSearchResult,
  searchGlobalItems,
} from '../../utils/fuzzySearch';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenGemini: () => void;
}

const renderHighlightedTitle = (title: string, matchedIndices: number[]) => {
  if (!matchedIndices.length) return title;
  const hitSet = new Set(matchedIndices);
  return title.split('').map((ch, idx) =>
    hitSet.has(idx) ? (
      <mark
        key={idx}
        className="bg-[#be7fab]/35 dark:bg-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] rounded-[2px] px-[0.5px] font-bold"
      >
        {ch}
      </mark>
    ) : (
      <React.Fragment key={idx}>{ch}</React.Fragment>
    )
  );
};

export const BinderHeader: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenGemini,
}) => {
  const {
    theme,
    toggleTheme,
    activePage,
    setActivePage,
    setActiveMealsTab,
    customPages,
    cloudBackupMeta,
    backupToCloud,
    exportBackupJSON,
    userProfile,
    homeProjects,
    notes,
    recipes,
    watchlistMedia,
  } = useBinder();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);

  // Global fuzzy search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'All' | GlobalSearchCategory
  >('All');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allMatches = useMemo(
    () =>
      searchGlobalItems(searchQuery, {
        homeProjects,
        notes,
        recipes,
        watchlistMedia,
      }),
    [searchQuery, homeProjects, notes, recipes, watchlistMedia]
  );

  const filteredMatches = useMemo(() => {
    if (activeCategoryFilter === 'All') return allMatches;
    return allMatches.filter((item) => item.category === activeCategoryFilter);
  }, [allMatches, activeCategoryFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<'All' | GlobalSearchCategory, number> = {
      All: allMatches.length,
      Project: 0,
      Note: 0,
      Recipe: 0,
      Watchlist: 0,
    };
    for (const item of allMatches) {
      counts[item.category]++;
    }
    return counts;
  }, [allMatches]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, activeCategoryFilter]);

  // Close dropdown on outside click & bind "/" shortcut to focus search
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (e.key === '/' && !isTypingTarget) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleSelectResult = (item: GlobalSearchResult) => {
    if (item.mealsSubTab) {
      setActiveMealsTab(item.mealsSubTab);
    }
    setActivePage(item.targetPage);
    setIsSearchOpen(false);
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
      return;
    }
    if (!filteredMatches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearchOpen(true);
      setHighlightedIndex((prev) => (prev + 1) % filteredMatches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsSearchOpen(true);
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? filteredMatches.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && isSearchOpen) {
      e.preventDefault();
      const chosen = filteredMatches[highlightedIndex] || filteredMatches[0];
      if (chosen) handleSelectResult(chosen);
    }
  };

  const getCategoryIcon = (category: GlobalSearchCategory) => {
    switch (category) {
      case 'Project':
        return <Hammer className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
      case 'Note':
        return <StickyNote className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
      case 'Recipe':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
      case 'Watchlist':
        return <Film className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'today': return 'Daily Command Center';
      case 'planner': return 'Daily & Weekly Planner';
      case 'kanban': return 'Kanban Task Board';
      case 'habits': return 'Daily Habits & Streaks';
      case 'finance': return 'Finance Hub & Accounts';
      case 'cleaning': return 'Home Cleaning & Rooms';
      case 'wellness': return 'Wellness & Vitality Hub';
      case 'meals': return 'Meal Planning & Groceries';
      case 'projects': return 'Active Home Projects';
      case 'watchlist': return 'Entertainment Watchlist';
      case 'albums': return 'Offline Photo Albums';
      case 'music': return 'Offline Music Deck';
      case 'contacts': return 'Personal Directory';
      case 'notes': return 'Notebook & Journal';
      case 'documents': return 'Document Vault & Files';
      case 'setup': return 'Setup & Cross-Device Sync';
      default: {
        const cp = customPages.find((p) => p.id === activePage);
        return cp ? cp.name : 'Custom Page';
      }
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await backupToCloud();
    setIsSyncing(false);
    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 2400);
  };

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1c0f19]/90 backdrop-blur-md border-b border-[#d29ec2] dark:border-[#be7fab]/45 px-4 sm:px-6 py-3 transition-colors shadow-[0_4px_20px_rgba(45,27,40,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Active Sector Title & Date */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] bg-[#efd0e5] dark:bg-[#120a10] hover:bg-[#be7fab] rounded-xl transition-colors border border-[#d29ec2] dark:border-[#be7fab]/50 shrink-0"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight truncate">
                {getPageTitle()}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#2d1b28]/75 dark:text-[#e6c3db] font-medium flex items-center gap-1.5 mt-0.5 font-mono tabular-nums">
              <CalendarIcon className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
              <span className="truncate">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Global Fuzzy Search Bar */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-md min-w-[150px] sm:min-w-[240px]"
        >
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Fuzzy search Projects, Notes, Recipes, Watchlist..."
              aria-label="Global fuzzy search across Projects, Notes, Recipes, and Watchlist"
              className="w-full pl-9 pr-12 py-2 text-xs font-medium bg-[#efd0e5]/60 dark:bg-[#120a10]/85 text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/55 dark:placeholder:text-[#d29ec2]/60 border border-[#d29ec2] dark:border-[#be7fab]/45 focus:border-[#be7fab] focus:outline-none focus:ring-2 focus:ring-[#be7fab]/30 rounded-xl transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 rounded-md text-[#2d1b28]/70 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center justify-center absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#2d1b28]/65 dark:text-[#daabcb]/80 bg-white/80 dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded">
                /
              </kbd>
            )}
          </div>

          {/* Fuzzy Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div
              role="listbox"
              aria-label="Global search results"
              className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1c0f19] border border-[#be7fab] rounded-2xl shadow-[0_16px_40px_rgba(45,27,40,0.2)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.75)] overflow-hidden"
            >
              {/* Category Filter Strip */}
              <div className="flex items-center gap-1 px-3 py-2 bg-[#e6c3db]/70 dark:bg-[#120a10]/80 border-b border-[#d29ec2] dark:border-[#be7fab]/30 overflow-x-auto">
                {(['All', 'Project', 'Note', 'Recipe', 'Watchlist'] as const).map(
                  (cat) => {
                    const active = activeCategoryFilter === cat;
                    const count = categoryCounts[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                          active
                            ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-xs'
                            : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:bg-[#be7fab]/20'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  }
                )}
              </div>

              {/* Result Items */}
              {filteredMatches.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-[#e6c3db] dark:divide-[#be7fab]/20">
                  {filteredMatches.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => handleSelectResult(item)}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                          isHighlighted
                            ? 'bg-[#efd0e5]/80 dark:bg-[#be7fab]/20'
                            : 'hover:bg-[#efd0e5]/45 dark:hover:bg-[#be7fab]/12'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="mt-0.5 p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 shrink-0">
                            {getCategoryIcon(item.category)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                              {renderHighlightedTitle(item.title, item.matchedIndices)}
                            </div>
                            <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] truncate">
                              {item.subtitle}
                            </div>
                            <div className="text-[10px] font-mono text-[#be7fab] dark:text-[#daabcb] mt-0.5">
                              {item.category} · {item.meta}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
                    No matches for “{searchQuery}”
                  </p>
                  <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db] mt-1">
                    Try partial words, abbreviations, or switch the category filter above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme Switch, Cloud Sync, Export, Gemini AI Button (#be7fab), Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark / Light Mode Toggle Switch with Glowing Sun / Moon Icon */}
          <button
            type="button"
            role="switch"
            aria-checked={!isDark}
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#e6c3db] dark:bg-[#120a10] border border-[#be7fab] hover:border-[#be7fab] shadow-[0_0_14px_rgba(190,127,171,0.35)] dark:shadow-[0_0_16px_rgba(190,127,171,0.45)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.85)]'
                  : 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.65)]'
              }`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="hidden lg:inline text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {isDark ? 'Dark' : 'Light'}
            </span>
            <span
              className={`hidden sm:flex items-center w-8 h-4 rounded-full p-0.5 transition-colors border ${
                isDark
                  ? 'bg-[#1c0f19] border-[#be7fab]/60 justify-start'
                  : 'bg-white border-[#be7fab] justify-end'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#be7fab] shadow-[0_0_6px_#be7fab]" />
            </span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title={`Last backup: ${cloudBackupMeta.lastBackupTime || 'Just now'}. Click to backup now.`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] bg-[#efd0e5]/65 dark:bg-[#120a10]/80 hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#d29ec2]/45 rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">
              {isSyncing ? 'Syncing...' : 'Cloud Synced'}
            </span>
          </button>

          <button
            onClick={exportBackupJSON}
            title="Export full LifeBinder backup to JSON file"
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] bg-[#efd0e5]/65 dark:bg-[#120a10]/80 hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#d29ec2]/45 rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
            <span>Export</span>
          </button>

          {/* Built-in Gemini AI Assistant Button in #be7fab */}
          <button
            onClick={onOpenGemini}
            title="Open Gemini AI Assistant"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.45)] border border-[#daabcb] dark:border-[#efd0e5]/50 transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gemini AI</span>
          </button>

          {/* Profile Avatar */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#d29ec2] dark:border-[#d29ec2]/30">
            <div className="w-8 h-8 rounded-full bg-[#be7fab]/25 border border-[#be7fab] shadow-[0_0_12px_rgba(190,127,171,0.35)] flex items-center justify-center text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              SM
            </div>
            <div className="hidden 2xl:block text-left">
              <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-tight">
                {userProfile.name}
              </div>
              <div className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-medium">
                Command Rail
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Success Toast */}
      {syncToast && (
        <div className="absolute right-6 top-16 z-50 flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] rounded-xl shadow-[0_0_24px_rgba(190,127,171,0.45)] text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-150 border border-[#be7fab]">
          <CheckCircle2 className="w-4 h-4 text-[#be7fab]" />
          <span>LifeBinder data saved cleanly.</span>
        </div>
      )}
    </header>
  );
};
