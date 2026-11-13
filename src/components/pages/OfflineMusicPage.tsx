import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Trash2,
  ListMusic,
  HardDrive,
  X,
  Disc3,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import {
  OfflinePlaylistRecord,
  OfflineTrackRecord,
  listPlaylists,
  savePlaylist,
  removePlaylistMoveTracksToLibrary,
  listTracks,
  saveTrack,
  removeTrack,
  extractAudioDuration,
  formatDuration,
} from '../../utils/offlineMediaDb';

const PLAYLIST_SEED_KEY = 'lifebinder_playlists_seeded_v1';

export const OfflineMusicPage: React.FC = () => {
  const { celebrate } = useBinder();

  const [playlists, setPlaylists] = useState<OfflinePlaylistRecord[]>([]);
  const [tracks, setTracks] = useState<OfflineTrackRecord[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all'); // 'all', 'library', or custom playlist id
  const [isLoading, setIsLoading] = useState(true);

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // UI state
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [confirmDeleteTrackId, setConfirmDeleteTrackId] = useState<string | null>(null);
  const [confirmDeletePlaylistId, setConfirmDeletePlaylistId] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const refreshLibrary = async () => {
    try {
      let loadedPlaylists = await listPlaylists();
      const loadedTracks = await listTracks();

      if (loadedPlaylists.length === 0 && !localStorage.getItem(PLAYLIST_SEED_KEY)) {
        const defaults: OfflinePlaylistRecord[] = [
          {
            id: 'pl-focus',
            name: 'Focus & Deep Work',
            description: 'Calm instrumental and ambient mixes for planning and deep focus.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'pl-workout',
            name: 'Workout Energy',
            description: 'Upbeat tracks for daily fitness routines.',
            createdAt: new Date(Date.now() + 10).toISOString(),
          },
        ];
        for (const pl of defaults) {
          await savePlaylist(pl);
        }
        localStorage.setItem(PLAYLIST_SEED_KEY, '1');
        loadedPlaylists = await listPlaylists();
      }

      setPlaylists(loadedPlaylists);
      setTracks(loadedTracks);
    } catch (err) {
      console.error('Failed to load offline music library', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLibrary();
  }, []);

  // Object URLs for offline tracks
  const trackUrls = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tracks) {
      map[t.id] = URL.createObjectURL(t.blob);
    }
    return map;
  }, [tracks]);

  useEffect(() => {
    return () => {
      Object.values(trackUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [trackUrls]);

  const visibleTracks = useMemo(() => {
    if (activePlaylistId === 'all') return tracks;
    return tracks.filter((t) => t.playlistId === activePlaylistId);
  }, [tracks, activePlaylistId]);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || null;
  const currentPlaylistName =
    activePlaylistId === 'all'
      ? 'Main Library (All Tracks)'
      : activePlaylistId === 'library'
      ? 'Unassigned Library'
      : playlists.find((p) => p.id === activePlaylistId)?.name || 'Playlist';

  // Sync audio element source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrackId || !trackUrls[currentTrackId]) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const targetSrc = trackUrls[currentTrackId];
    if (audio.src !== targetSrc) {
      audio.src = targetSrc;
      audio.load();
      setCurrentTime(0);
      if (isPlaying) {
        audio.play().catch((err) => console.error('Audio playback interrupted', err));
      }
    }
  }, [currentTrackId, trackUrls]);

  // Keep volume & mute synchronized
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = (trackId: string) => {
    const audio = audioRef.current;
    if (currentTrackId === trackId && audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((err) => console.error(err));
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrackId(trackId);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error(err));
      }
    }, 30);
  };

  const handleTogglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack && visibleTracks.length > 0) {
      playTrack(visibleTracks[0].id);
      return;
    }
    if (!currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.error(err));
      setIsPlaying(true);
    }
  };

  const handleNextTrack = (autoEnded = false) => {
    const pool = visibleTracks.length > 0 ? visibleTracks : tracks;
    if (pool.length === 0) return;

    if (autoEnded && repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.error(err));
      return;
    }

    if (isShuffle && pool.length > 1) {
      const candidates = pool.filter((t) => t.id !== currentTrackId);
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      playTrack(next.id);
      return;
    }

    const currentIdx = pool.findIndex((t) => t.id === currentTrackId);
    const nextIdx = currentIdx + 1;

    if (nextIdx >= pool.length) {
      if (repeatMode === 'all' || !autoEnded) {
        playTrack(pool[0].id);
      } else {
        setIsPlaying(false);
      }
    } else {
      playTrack(pool[nextIdx].id);
    }
  };

  const handlePrevTrack = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const pool = visibleTracks.length > 0 ? visibleTracks : tracks;
    if (pool.length === 0) return;
    const currentIdx = pool.findIndex((t) => t.id === currentTrackId);
    const prevIdx = currentIdx <= 0 ? pool.length - 1 : currentIdx - 1;
    playTrack(pool[prevIdx].id);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = parseFloat(e.target.value);
    setCurrentTime(nextSec);
    if (audioRef.current) {
      audioRef.current.currentTime = nextSec;
    }
  };

  const handleUploadAudioFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(
      (f) =>
        f.type.startsWith('audio/') ||
        /\.(mp3|m4a|wav|aac|ogg|flac)$/i.test(f.name)
    );
    if (files.length === 0) return;

    const targetPlaylist =
      activePlaylistId === 'all' ? 'library' : activePlaylistId;
    const baseTime = Date.now();
    let firstAddedId: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dur = await extractAudioDuration(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const trackId = `trk-${baseTime}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      if (!firstAddedId) firstAddedId = trackId;

      await saveTrack({
        id: trackId,
        playlistId: targetPlaylist,
        title: cleanTitle || `Audio Track ${i + 1}`,
        artist: 'Local Offline Audio',
        durationSeconds: dur,
        fileName: file.name,
        mimeType: file.type || 'audio/mpeg',
        sizeBytes: file.size,
        blob: file,
        createdAt: new Date(baseTime + i).toISOString(),
      });
    }

    await refreshLibrary();
    if (!currentTrackId && firstAddedId) {
      setCurrentTrackId(firstAddedId);
    }
    celebrate();
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newId = `pl-${Date.now()}`;
    await savePlaylist({
      id: newId,
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsPlaylistModalOpen(false);
    setActivePlaylistId(newId);
    await refreshLibrary();
    celebrate();
  };

  const handleDeletePlaylist = async (plId: string) => {
    await removePlaylistMoveTracksToLibrary(plId);
    if (activePlaylistId === plId) setActivePlaylistId('all');
    setConfirmDeletePlaylistId(null);
    await refreshLibrary();
  };

  const handleMoveTrackToPlaylist = async (track: OfflineTrackRecord, targetPlaylistId: string) => {
    await saveTrack({ ...track, playlistId: targetPlaylistId });
    await refreshLibrary();
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (currentTrackId === trackId) {
      const remaining = visibleTracks.filter((t) => t.id !== trackId);
      setCurrentTrackId(remaining.length > 0 ? remaining[0].id : null);
      setIsPlaying(false);
    }
    await removeTrack(trackId);
    setConfirmDeleteTrackId(null);
    await refreshLibrary();
  };

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const totalAudioMb = (tracks.reduce((acc, t) => acc + t.sizeBytes, 0) / (1024 * 1024)).toFixed(1);
  const progressPct =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Hidden native HTML5 Audio Engine */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || currentTrack?.durationSeconds || 0);
        }}
        onEnded={() => handleNextTrack(true)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/50 text-[#be7fab] dark:text-[#daabcb] shadow-[0_0_14px_rgba(190,127,171,0.3)]">
              <Music className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Offline Music Deck
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            {tracks.length} Audio Tracks · {playlists.length} Custom Playlists · {totalAudioMb} MB IndexedDB Local Playback
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/50 hover:bg-[#be7fab]/20 rounded-xl transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>

          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.45)] transition-all active:scale-95 whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Audio (.mp3, .m4a, .wav)</span>
          </button>

          <input
            ref={audioInputRef}
            type="file"
            accept=".mp3,.m4a,.wav,audio/*"
            multiple
            onChange={(e) => {
              handleUploadAudioFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* =====================================================================
          SLEEK ROSE-MAUVE HUD AUDIO PLAYER BAR (Pinned Top Deck)
         ===================================================================== */}
      <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 !border-[#be7fab] shadow-[0_0_28px_rgba(190,127,171,0.22)] dark:shadow-[0_0_28px_rgba(190,127,171,0.28)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Active Track Identity */}
          <div className="flex items-center gap-3.5 min-w-0 lg:w-1/3">
            <div
              className={`w-12 h-12 rounded-xl bg-[#e6c3db]/70 dark:bg-[#120a10] border border-[#be7fab] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(190,127,171,0.35)]`}
            >
              <Disc3
                className={`w-6 h-6 text-[#2d1b28] dark:text-[#efd0e5] ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '5s' }}
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#be7fab] dark:text-[#daabcb] font-bold">
                {currentTrack ? (isPlaying ? 'Now Playing Offline' : 'Paused · Offline Ready') : 'Audio Deck Standby'}
              </div>
              <h2 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                {currentTrack ? currentTrack.title : 'Select or upload a track to play'}
              </h2>
              <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono truncate">
                {currentTrack
                  ? `${currentTrack.fileName} · ${formatDuration(duration || currentTrack.durationSeconds)}`
                  : 'Supports .mp3, .m4a, .wav stored offline'}
              </div>
            </div>
          </div>

          {/* Primary Transport Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsShuffle((s) => !s)}
              className={`p-2 rounded-xl border transition-all ${
                isShuffle
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] shadow-[0_0_12px_rgba(190,127,171,0.55)]'
                  : 'bg-[#e6c3db]/65 dark:bg-[#120a10] text-[#be7fab] dark:text-[#daabcb] border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrevTrack}
              className="p-2.5 rounded-xl bg-[#e6c3db]/65 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#be7fab]/20 transition-all"
              title="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlayPause}
              className="w-12 h-12 rounded-2xl bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] flex items-center justify-center shadow-[0_0_22px_rgba(190,127,171,0.65)] transition-all active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-[#120a10]" />
              ) : (
                <Play className="w-5 h-5 fill-[#120a10] ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNextTrack(false)}
              className="p-2.5 rounded-xl bg-[#e6c3db]/65 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 hover:border-[#be7fab] dark:hover:border-[#efd0e5] hover:bg-[#be7fab]/20 transition-all"
              title="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={cycleRepeatMode}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-[10px] font-mono font-bold ${
                repeatMode !== 'off'
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] shadow-[0_0_12px_rgba(190,127,171,0.55)]'
                  : 'bg-[#e6c3db]/65 dark:bg-[#120a10] text-[#be7fab] dark:text-[#daabcb] border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              <span className="hidden sm:inline uppercase">{repeatMode}</span>
            </button>
          </div>

          {/* Volume Slider Control */}
          <div className="flex items-center justify-center lg:justify-end gap-2.5 lg:w-1/4">
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              aria-label="Volume"
              className="w-28 accent-[#be7fab] cursor-pointer"
            />

            <span className="text-[11px] font-mono text-[#2d1b28]/80 dark:text-[#e6c3db] tabular-nums w-9 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Glowing #be7fab Seekable Progress Bar */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums w-11">
            {formatDuration(currentTime)}
          </span>

          <div className="relative flex-1 h-3 flex items-center group">
            {/* Background track */}
            <div className="w-full h-2 rounded-full bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#be7fab] via-[#d29ec2] to-[#daabcb] dark:to-[#efd0e5] rounded-full shadow-[0_0_12px_rgba(190,127,171,0.85)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Interactive range overlay */}
            <input
              type="range"
              min="0"
              max={duration || currentTrack?.durationSeconds || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentTrack}
              aria-label="Seek track position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          <span className="text-xs font-mono font-bold text-[#be7fab] dark:text-[#daabcb] tabular-nums w-11 text-right">
            {formatDuration(duration || currentTrack?.durationSeconds || 0)}
          </span>
        </div>
      </div>

      {/* =====================================================================
          MAIN WORKSPACE: Playlists Column + Offline Track Library
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playlists Sidebar */}
        <div className="lg:col-span-4 hud-panel hud-corners p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
            <span className="flex items-center gap-2 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              <ListMusic className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
              <span>Playlists &amp; Library</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPlaylistModalOpen(true)}
              className="text-[11px] font-bold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Main Library (All) */}
            <button
              type="button"
              onClick={() => setActivePlaylistId('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                activePlaylistId === 'all'
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] font-bold shadow-[0_0_12px_rgba(190,127,171,0.45)]'
                  : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/80 text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab]'
              }`}
            >
              <span className="truncate">Main Library (All Tracks)</span>
              <span className="font-mono tabular-nums text-[11px]">{tracks.length}</span>
            </button>

            {/* General Library Unassigned */}
            <button
              type="button"
              onClick={() => setActivePlaylistId('library')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                activePlaylistId === 'library'
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] font-bold shadow-[0_0_12px_rgba(190,127,171,0.45)]'
                  : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/80 text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab]'
              }`}
            >
              <span className="truncate">General Uploads</span>
              <span className="font-mono tabular-nums text-[11px]">
                {tracks.filter((t) => t.playlistId === 'library').length}
              </span>
            </button>

            {/* Custom Playlists */}
            {playlists.map((pl) => {
              const count = tracks.filter((t) => t.playlistId === pl.id).length;
              const isSelected = activePlaylistId === pl.id;
              const isConfirming = confirmDeletePlaylistId === pl.id;

              return (
                <div
                  key={pl.id}
                  className={`flex items-center justify-between gap-1 px-3 py-2.5 rounded-xl text-xs border transition-all ${
                    isSelected
                      ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] font-bold shadow-[0_0_12px_rgba(190,127,171,0.45)]'
                      : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/80 text-[#2d1b28] dark:text-[#e6c3db] border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActivePlaylistId(pl.id)}
                    className="flex-1 text-left truncate font-semibold"
                  >
                    {pl.name}
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-[11px]">{count}</span>
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeletePlaylist(pl.id)}
                          className="px-1.5 py-0.5 rounded bg-[#120a10] text-[#efd0e5] text-[10px] font-bold"
                        >
                          Del
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePlaylistId(null)}
                          className="text-[10px] opacity-80"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePlaylistId(pl.id)}
                        className={`p-1 rounded transition-colors ${
                          isSelected
                            ? 'text-[#120a10]/70 hover:text-[#120a10]'
                            : 'text-[#be7fab] dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                        }`}
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
            <span>IndexedDB stores audio files offline across sessions.</span>
          </div>
        </div>

        {/* Track Queue & Audio Upload Zone */}
        <div
          className="lg:col-span-8 hud-panel hud-corners p-5 space-y-4"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingAudio(true);
          }}
          onDragLeave={() => setIsDraggingAudio(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingAudio(false);
            handleUploadAudioFiles(e.dataTransfer.files);
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {currentPlaylistName}
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                {visibleTracks.length} offline tracks · Click any track to play
              </p>
            </div>

            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#daabcb] hover:bg-[#efd0e5] text-[#120a10] rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Audio Files</span>
            </button>
          </div>

          {/* Drag-and-Drop Audio Upload Box */}
          <div
            onClick={() => audioInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
              isDraggingAudio
                ? 'border-[#be7fab] dark:border-[#efd0e5] bg-[#be7fab]/20'
                : 'border-[#d29ec2] dark:border-[#be7fab]/40 hover:border-[#be7fab] bg-[#e6c3db]/40 dark:bg-[#120a10]/70'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs">
              <Upload className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
              <span className="text-[#2d1b28] dark:text-[#efd0e5] font-semibold">
                Drop .mp3, .m4a, or .wav files here or click to upload into{' '}
                {activePlaylistId === 'all' ? 'Main Library' : currentPlaylistName}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[#e6c3db]/55 dark:bg-[#120a10]/60 animate-pulse" />
              ))}
            </div>
          ) : visibleTracks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Music className="w-9 h-9 text-[#be7fab] dark:text-[#daabcb] mx-auto opacity-75" />
              <div className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                No audio tracks in this view yet
              </div>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 max-w-md mx-auto">
                Upload .mp3, .m4a, or .wav files from your computer to build your personal offline music player.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleTracks.map((track, idx) => {
                const isActiveTrack = currentTrackId === track.id;
                const isConfirming = confirmDeleteTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActiveTrack
                        ? 'bg-[#be7fab]/20 border-[#be7fab] shadow-[0_0_16px_rgba(190,127,171,0.3)]'
                        : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/85 border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab]'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(track.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <button
                        type="button"
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                          isActiveTrack
                            ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5]'
                            : 'bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#be7fab]/35'
                        }`}
                      >
                        {isActiveTrack && isPlaying ? (
                          <Pause className="w-4 h-4 fill-[#120a10]" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#be7fab] dark:text-[#daabcb] tabular-nums font-bold">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                            {track.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono truncate">
                          {track.fileName} · {(track.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      <select
                        value={track.playlistId}
                        onChange={(e) => handleMoveTrackToPlaylist(track, e.target.value)}
                        className="px-2 py-1 text-[11px] bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-lg text-[#2d1b28] dark:text-[#e6c3db]"
                        title="Assign to playlist"
                      >
                        <option value="library">Main Library</option>
                        {playlists.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name}
                          </option>
                        ))}
                      </select>

                      <span className="text-xs font-mono font-bold text-[#be7fab] dark:text-[#daabcb] tabular-nums w-12 text-right">
                        {formatDuration(track.durationSeconds)}
                      </span>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrack(track.id)}
                            className="px-2 py-1 rounded bg-[#be7fab] text-[#120a10] text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTrackId(null)}
                            className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteTrackId(track.id)}
                          className="p-1.5 text-[#be7fab] dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                          title="Delete audio track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Create Offline Playlist
              </h3>
              <button
                type="button"
                onClick={() => setIsPlaylistModalOpen(false)}
                className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Morning Walk, Favorites, Chill Synth"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Vibe or purpose of this playlist"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsPlaylistModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] font-bold rounded-xl"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
