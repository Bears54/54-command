import React, { useState, useRef } from 'react';
import {
  Film,
  Tv,
  BookOpen,
  Radio,
  Plus,
  Star,
  Trash2,
  Search,
  X,
  Sparkles,
  Minus,
  Camera,
  Wand2,
  Loader2,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { WatchlistMediaItem } from '../../types/binder';
import { getDefaultPosterForMedia } from '../../data/watchlistInitialData';
import { generateCoverImage } from '../../utils/coverImageApi';

export const WatchlistPage: React.FC = () => {
  const { watchlistMedia: watchlist, setWatchlistMedia: setWatchlist, celebrate } = useBinder();

  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<WatchlistMediaItem['type']>('Series');
  const [newPlatform, setNewPlatform] = useState('Netflix');
  const [newStatus] = useState<WatchlistMediaItem['status']>('In Progress');
  const [newCurrent, setNewCurrent] = useState<number>(1);
  const [newTotal, setNewTotal] = useState<number>(8);
  const [newSeasons, setNewSeasons] = useState<number>(1);
  const [newUnit, setNewUnit] = useState('episodes');
  const [newRating, setNewRating] = useState<number>(5);
  const [newGenre, setNewGenre] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPosterPreview, setNewPosterPreview] = useState<string | undefined>(undefined);

  const posterInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);
  const [isGeneratingNewPoster, setIsGeneratingNewPoster] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateCoverForMedia = async (
    item: WatchlistMediaItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (generatingCoverId) return;
    setGeneratingCoverId(item.id);
    try {
      const { imageDataUrl } = await generateCoverImage({
        title: item.title,
        kind: 'watchlist',
        subtitle: `${item.type} · ${item.genre}${item.platform ? ` · ${item.platform}` : ''}`,
      });
      setWatchlist((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, imageSrc: imageDataUrl } : m))
      );
      celebrate();
      showToast(`Generated cover poster for "${item.title}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate cover image.';
      showToast(msg);
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleGenerateNewModalPoster = async () => {
    const titleVal = newTitle.trim() || `${newType} Poster`;
    if (isGeneratingNewPoster) return;
    setIsGeneratingNewPoster(true);
    try {
      const { imageDataUrl } = await generateCoverImage({
        title: titleVal,
        kind: 'watchlist',
        subtitle: `${newType} · ${newGenre || 'Cinema'} · ${newPlatform}`,
      });
      setNewPosterPreview(imageDataUrl);
      celebrate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate cover image.';
      showToast(msg);
    } finally {
      setIsGeneratingNewPoster(false);
    }
  };

  const handlePosterUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setWatchlist((prev) =>
          prev.map((item) => (item.id === id ? { ...item, imageSrc: dataUrl } : item))
        );
        celebrate();
        showToast('Cover poster updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setNewPosterPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProgress = (id: string, delta: number) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = Math.max(0, Math.min(item.totalProgress, item.currentProgress + delta));
          const isNowFinished = nextVal >= item.totalProgress;
          if (isNowFinished && item.status !== 'Finished') {
            celebrate();
            showToast(`Completed "${item.title}"!`);
          }
          return {
            ...item,
            currentProgress: nextVal,
            status: isNowFinished ? 'Finished' : nextVal > 0 ? 'In Progress' : item.status,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateSeason = (id: string, delta: number) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextSeason = Math.max(1, (item.seasonsCount || 1) + delta);
          return { ...item, seasonsCount: nextSeason };
        }
        return item;
      })
    );
  };

  const handleToggleFinished = (id: string) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isDone = item.status === 'Finished';
          if (!isDone) {
            celebrate();
            showToast(`Marked "${item.title}" as Finished!`);
          }
          return {
            ...item,
            status: isDone ? 'In Progress' : 'Finished',
            currentProgress: isDone ? Math.max(0, item.totalProgress - 1) : item.totalProgress,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setWatchlist((prev) => prev.filter((i) => i.id !== id));
    showToast('Removed from watchlist');
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const genreVal = newGenre.trim() || 'Entertainment';
    const defaultPoster = getDefaultPosterForMedia(newType, genreVal, newTitle.trim());

    const newItem: WatchlistMediaItem = {
      id: `w-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      platform: newPlatform.trim() || undefined,
      status: newStatus,
      currentProgress: Number(newCurrent) || 0,
      totalProgress: Number(newTotal) || 1,
      seasonsCount: newType === 'Series' ? Number(newSeasons) || 1 : undefined,
      unit:
        newUnit.trim() ||
        (newType === 'Book' ? 'pages' : newType === 'Movie' ? 'movie' : 'episodes'),
      rating: Number(newRating) || 5,
      genre: genreVal,
      notes: newNotes.trim() || undefined,
      imageSrc: newPosterPreview || defaultPoster,
    };

    setWatchlist([newItem, ...watchlist]);
    celebrate();
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewGenre('');
    setNewNotes('');
    setNewPosterPreview(undefined);
    showToast(`Added "${newItem.title}" to Watchlist!`);
  };

  const filteredItems = watchlist.filter((item) => {
    const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
    const matchesType = activeType === 'All' || item.type === activeType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.platform && item.platform.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getMediaIcon = (type: WatchlistMediaItem['type']) => {
    switch (type) {
      case 'Series':
        return <Tv className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />;
      case 'Movie':
        return <Film className="w-4 h-4 text-[#2d1b28] dark:text-[#efd0e5]" />;
      case 'Book':
        return <BookOpen className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]" />;
      case 'Podcast':
        return <Radio className="w-4 h-4 text-[#be7fab]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-lg dark:shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/50 shadow-[0_0_14px_rgba(190,127,171,0.3)]">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Picture Watchlist · Movies &amp; TV Shows
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1">
            Visual poster grid with tappable cover upload, season &amp; episode telemetry, and ratings
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.4)] transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Movie/Show</span>
        </button>
      </div>

      {/* Filter Ribbon & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="hud-panel p-1 max-w-fit flex items-center gap-1 text-xs font-semibold overflow-x-auto">
          {['All', 'In Progress', 'Want to Watch', 'Finished'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeStatus === st
                  ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_10px_rgba(190,127,171,0.4)]'
                  : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hud-panel p-1 flex items-center gap-1 text-xs font-semibold overflow-x-auto">
            {['All', 'Series', 'Movie', 'Book', 'Podcast'].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setActiveType(tp)}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs whitespace-nowrap ${
                  activeType === tp
                    ? 'bg-[#daabcb] text-[#120a10] font-bold'
                    : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#be7fab] dark:text-[#daabcb]/60" />
            <input
              type="text"
              placeholder="Search movies, shows, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
            />
          </div>
        </div>
      </div>

      {/* Visual Poster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const percent =
            item.totalProgress > 0
              ? Math.min(100, Math.round((item.currentProgress / item.totalProgress) * 100))
              : 0;
          const isComplete = item.status === 'Finished' || percent === 100;
          const posterSrc =
            item.imageSrc || getDefaultPosterForMedia(item.type, item.genre, item.title);

          return (
            <div
              key={item.id}
              className={`hud-panel hud-corners overflow-hidden flex flex-col justify-between transition-all rounded-2xl border group ${
                isComplete
                  ? 'border-[#be7fab] shadow-[0_0_24px_rgba(190,127,171,0.28)]'
                  : 'border-[#d29ec2]/40'
              }`}
            >
              {/* Prominent Tappable Cover Photo / Poster Upload Area */}
              <div
                onClick={() => posterInputRefs.current[item.id]?.click()}
                className="relative aspect-3/4 w-full bg-[#120a10] overflow-hidden border-b border-[#be7fab]/30 cursor-pointer"
                title="Tap cover to upload or swap poster image"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    posterInputRefs.current[item.id] = el;
                  }}
                  onChange={(e) => handlePosterUpload(item.id, e)}
                  className="hidden"
                />

                {posterSrc ? (
                  <img
                    src={posterSrc}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-5 bg-linear-to-br from-[#241420] via-[#1c0f19] to-[#be7fab]/25">
                    <div className="p-3 rounded-2xl bg-[#be7fab]/15 border border-[#be7fab]/45 mb-2">
                      {getMediaIcon(item.type)}
                    </div>
                    <span className="font-display text-sm font-bold text-[#efd0e5] text-center">
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Bottom Contrast Scrim for crisp badge legibility */}
                <div
                  className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(18, 10, 16, 0.92) 0%, rgba(18, 10, 16, 0.35) 60%, transparent 100%)',
                  }}
                />

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#120a10]/85 border border-[#be7fab]/45 text-[#efd0e5] text-[10px] font-bold uppercase tracking-wider font-mono">
                  {item.type}
                  {item.platform ? ` · ${item.platform}` : ''}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#120a10]/85 text-[#e6c3db]/75 hover:text-[#efd0e5] border border-[#be7fab]/35 transition-colors"
                  title="Remove title"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Bottom overlay status + Cover actions */}
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5">
                  {item.seasonsCount ? (
                    <span className="px-2 py-0.5 rounded bg-[#be7fab] text-[#120a10] text-[10px] font-mono font-bold shrink-0">
                      Season {item.seasonsCount}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#1c0f19]/90 border border-[#be7fab]/45 text-[#efd0e5] text-[10px] font-mono font-bold shrink-0">
                      {percent}%
                    </span>
                  )}

                  <div className="flex items-center gap-1 min-w-0">
                    <button
                      type="button"
                      disabled={generatingCoverId === item.id}
                      onClick={(e) => handleGenerateCoverForMedia(item, e)}
                      className="px-2 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-60 text-[#120a10] border border-[#efd0e5]/50 text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(190,127,171,0.5)] transition-colors whitespace-nowrap"
                      title="Generate AI cover poster"
                    >
                      {generatingCoverId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      <span>{generatingCoverId === item.id ? 'Gen...' : 'Generate Cover Image'}</span>
                    </button>

                    <span className="px-2 py-1 rounded-lg bg-[#120a10]/90 border border-[#be7fab]/50 text-[#daabcb] group-hover:text-[#efd0e5] text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0">
                      <Camera className="w-3 h-3" />
                      <span>{item.imageSrc ? 'Swap' : 'Upload'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono truncate font-bold">
                        {item.genre}
                      </div>
                      <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug mt-0.5 truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Season & Episode / Progress Controls */}
                  <div className="my-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                        {item.currentProgress} / {item.totalProgress} {item.unit}
                      </span>
                      <span className="text-[11px] font-bold text-[#be7fab] dark:text-[#daabcb]">{percent}%</span>
                    </div>

                    <div className="w-full h-2 bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/25 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(190,127,171,0.65)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateProgress(item.id, -1)}
                          disabled={item.currentProgress <= 0}
                          className="px-2 py-1 rounded bg-[#e6c3db]/65 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] disabled:opacity-30 transition-colors"
                          title="Previous episode / unit"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateProgress(item.id, 1)}
                          disabled={item.currentProgress >= item.totalProgress}
                          className="px-2 py-1 rounded bg-[#be7fab]/20 border border-[#be7fab]/45 hover:bg-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] disabled:opacity-30 transition-colors flex items-center gap-0.5 font-bold"
                          title="Advance progress"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px] font-mono">+1 {item.unit.slice(0, 2)}</span>
                        </button>
                        {item.type === 'Series' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateSeason(item.id, 1)}
                            className="px-2 py-1 rounded bg-[#e6c3db]/65 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] text-[#be7fab] dark:text-[#daabcb] text-[10px] font-mono font-bold"
                            title="Advance Season"
                          >
                            +S
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFinished(item.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                          isComplete
                            ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab]'
                            : 'bg-[#e6c3db]/65 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab]'
                        }`}
                      >
                        {isComplete ? '✓ Finished' : 'Done'}
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating ? 'fill-[#be7fab] dark:fill-[#daabcb] text-[#be7fab] dark:text-[#daabcb]' : 'text-[#d29ec2]/45 dark:text-[#be7fab]/25'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-[#2d1b28]/70 dark:text-[#e6c3db]/70 ml-1 font-mono">
                      {item.rating}/5
                    </span>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/85 italic bg-[#e6c3db]/45 dark:bg-[#120a10]/70 p-2.5 rounded-xl border border-[#d29ec2]/55 dark:border-[#be7fab]/25 leading-relaxed line-clamp-2">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono tabular-nums">
                  <span className="capitalize">{item.status}</span>
                  <span>{Math.max(0, item.totalProgress - item.currentProgress)} left</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/65 bg-white/75 dark:bg-[#1c0f19]/60 rounded-2xl border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35">
            No titles found matching this filter. Click &quot;+ Add Movie/Show&quot; or ask Gemini AI!
          </div>
        )}
      </div>

      {/* Modal: + Add Movie/Show */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <Tv className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Add Movie or TV Show
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="mt-4 space-y-3">
              {/* Optional Poster Cover Upload or AI Cover Generation */}
              <div className="space-y-1.5">
                <label className="block relative h-36 w-full rounded-xl border border-dashed border-[#be7fab]/50 bg-[#e6c3db]/45 dark:bg-[#120a10] overflow-hidden cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] transition-colors">
                  {newPosterPreview ? (
                    <img
                      src={newPosterPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#be7fab] dark:text-[#daabcb] gap-1 px-4 text-center">
                      <Camera className="w-5 h-5" />
                      <span className="text-xs font-semibold">
                        Tap to Upload Cover Poster (Optional — default artwork auto-applied)
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewPosterUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  disabled={isGeneratingNewPoster}
                  onClick={handleGenerateNewModalPoster}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#be7fab]/20 hover:bg-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] border border-[#be7fab]/50 text-[11px] font-bold transition-colors"
                >
                  {isGeneratingNewPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isGeneratingNewPoster ? 'Generating Cover Image...' : 'Generate Cover Image'}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ted Lasso, Dune Prophecy, Wicked"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 focus:outline-none focus:ring-1 focus:ring-[#be7fab] font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const t = e.target.value as WatchlistMediaItem['type'];
                      setNewType(t);
                      if (t === 'Book') setNewUnit('pages');
                      else if (t === 'Series') setNewUnit('episodes');
                      else setNewUnit('movie');
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="Series">TV Series</option>
                    <option value="Movie">Movie</option>
                    <option value="Book">Book</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Platform / Service
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix, HBO, Apple TV+"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 p-2.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2]/60 dark:border-[#be7fab]/35">
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">
                    Current
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">
                    Total
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTotal}
                    onChange={(e) => setNewTotal(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">
                    Seasons
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSeasons}
                    onChange={(e) => setNewSeasons(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-md text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Genre / Theme
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Drama, Thriller, Sci-Fi"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Impressions &amp; Notes
                </label>
                <textarea
                  placeholder="Key thoughts, who recommended it, quotes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg resize-none text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Save Movie / Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
