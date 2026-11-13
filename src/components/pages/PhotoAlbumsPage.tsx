import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Images,
  FolderPlus,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Edit2,
  FolderInput,
  Star,
  Check,
  Camera,
  HardDrive,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import {
  OfflineAlbumRecord,
  OfflinePhotoRecord,
  listAlbums,
  saveAlbum,
  removeAlbumAndPhotos,
  listPhotos,
  savePhoto,
  removePhoto,
} from '../../utils/offlineMediaDb';

const ALBUM_SEED_KEY = 'lifebinder_albums_seeded_v1';

export const PhotoAlbumsPage: React.FC = () => {
  const { celebrate } = useBinder();

  const [albums, setAlbums] = useState<OfflineAlbumRecord[]>([]);
  const [photos, setPhotos] = useState<OfflinePhotoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Add / Edit Album Modal
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<OfflineAlbumRecord | null>(null);
  const [albumName, setAlbumName] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumCoverBlob, setAlbumCoverBlob] = useState<Blob | null>(null);
  const [albumCoverPreviewUrl, setAlbumCoverPreviewUrl] = useState<string | null>(null);

  // Confirm delete states (no window.confirm)
  const [confirmDeleteAlbumId, setConfirmDeleteAlbumId] = useState<string | null>(null);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  // Lightbox state
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [captionSavedNotice, setCaptionSavedNotice] = useState(false);
  const [moveTargetAlbumId, setMoveTargetAlbumId] = useState<string>('');
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const multiUploadInputRef = useRef<HTMLInputElement | null>(null);
  const quickAlbumUploadRef = useRef<HTMLInputElement | null>(null);
  const [quickUploadAlbumId, setQuickUploadAlbumId] = useState<string | null>(null);

  // Load IndexedDB data
  const refreshMedia = async () => {
    try {
      let loadedAlbums = await listAlbums();
      const loadedPhotos = await listPhotos();

      if (loadedAlbums.length === 0 && !localStorage.getItem(ALBUM_SEED_KEY)) {
        const now = new Date().toISOString();
        const defaults: OfflineAlbumRecord[] = [
          {
            id: 'alb-highlights',
            name: 'Memories & Highlights',
            description: 'Everyday snapshots, milestones, and favorite moments saved offline.',
            createdAt: now,
          },
          {
            id: 'alb-home',
            name: 'Home & Projects',
            description: 'Renovation progress, room inspiration, and DIY build photos.',
            createdAt: new Date(Date.now() + 10).toISOString(),
          },
        ];
        for (const a of defaults) {
          await saveAlbum(a);
        }
        localStorage.setItem(ALBUM_SEED_KEY, '1');
        loadedAlbums = await listAlbums();
      }

      setAlbums(loadedAlbums);
      setPhotos(loadedPhotos);
    } catch (err) {
      console.error('Failed loading IndexedDB photo albums', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMedia();
  }, []);

  // Manage Blob Object URLs cleanly
  const photoUrls = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of photos) {
      map[p.id] = URL.createObjectURL(p.blob);
    }
    return map;
  }, [photos]);

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoUrls]);

  useEffect(() => {
    return () => {
      if (albumCoverPreviewUrl) URL.revokeObjectURL(albumCoverPreviewUrl);
    };
  }, [albumCoverPreviewUrl]);

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId) || null;
  const albumPhotos = useMemo(() => {
    if (!selectedAlbumId) return [];
    return photos.filter((p) => p.albumId === selectedAlbumId);
  }, [photos, selectedAlbumId]);

  const lightboxIndex = albumPhotos.findIndex((p) => p.id === lightboxPhotoId);
  const lightboxPhoto = lightboxIndex >= 0 ? albumPhotos[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxPhoto) {
      setCaptionDraft(lightboxPhoto.caption || '');
      setMoveTargetAlbumId(lightboxPhoto.albumId);
      setConfirmDeletePhotoId(null);
    }
  }, [lightboxPhoto]);

  // Keyboard navigation in Lightbox
  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (e.key === 'Escape') {
        setLightboxPhotoId(null);
      } else if (!isTyping && e.key === 'ArrowRight' && albumPhotos.length > 1) {
        const nextIdx = (lightboxIndex + 1) % albumPhotos.length;
        setLightboxPhotoId(albumPhotos[nextIdx].id);
      } else if (!isTyping && e.key === 'ArrowLeft' && albumPhotos.length > 1) {
        const prevIdx = (lightboxIndex - 1 + albumPhotos.length) % albumPhotos.length;
        setLightboxPhotoId(albumPhotos[prevIdx].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxPhoto, lightboxIndex, albumPhotos]);

  const openCreateAlbumModal = () => {
    setEditingAlbum(null);
    setAlbumName('');
    setAlbumDesc('');
    setAlbumCoverBlob(null);
    setAlbumCoverPreviewUrl(null);
    setIsAlbumModalOpen(true);
  };

  const openEditAlbumModal = (alb: OfflineAlbumRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAlbum(alb);
    setAlbumName(alb.name);
    setAlbumDesc(alb.description || '');
    setAlbumCoverBlob(null);
    setAlbumCoverPreviewUrl(null);
    setIsAlbumModalOpen(true);
  };

  const handleSaveAlbumModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;

    const albumId = editingAlbum ? editingAlbum.id : `alb-${Date.now()}`;
    let coverPhotoId = editingAlbum?.coverPhotoId;

    if (albumCoverBlob) {
      const newCoverId = `ph-${Date.now()}-cover`;
      await savePhoto({
        id: newCoverId,
        albumId,
        title: `${albumName.trim()} Cover`,
        caption: 'Album cover photo',
        fileName: 'cover.jpg',
        mimeType: albumCoverBlob.type || 'image/jpeg',
        sizeBytes: albumCoverBlob.size,
        blob: albumCoverBlob,
        createdAt: new Date().toISOString(),
      });
      coverPhotoId = newCoverId;
    }

    const record: OfflineAlbumRecord = {
      id: albumId,
      name: albumName.trim(),
      description: albumDesc.trim() || undefined,
      createdAt: editingAlbum?.createdAt || new Date().toISOString(),
      coverPhotoId,
    };

    await saveAlbum(record);
    localStorage.setItem(ALBUM_SEED_KEY, '1');
    await refreshMedia();
    setIsAlbumModalOpen(false);
    if (!editingAlbum) setSelectedAlbumId(albumId);
    celebrate();
  };

  const handleUploadFilesToAlbum = async (targetAlbumId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    let firstUploadedId: string | undefined;
    const baseTime = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = `ph-${baseTime}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      if (!firstUploadedId) firstUploadedId = photoId;

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      await savePhoto({
        id: photoId,
        albumId: targetAlbumId,
        title: cleanTitle || 'Photo',
        caption: '',
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        blob: file,
        createdAt: new Date(baseTime + i).toISOString(),
      });
    }

    const targetAlbum = albums.find((a) => a.id === targetAlbumId);
    if (targetAlbum && !targetAlbum.coverPhotoId && firstUploadedId) {
      await saveAlbum({ ...targetAlbum, coverPhotoId: firstUploadedId });
    }

    await refreshMedia();
    celebrate();
  };

  const handleDeleteAlbum = async (albumId: string) => {
    await removeAlbumAndPhotos(albumId);
    if (selectedAlbumId === albumId) setSelectedAlbumId(null);
    setConfirmDeleteAlbumId(null);
    await refreshMedia();
  };

  const handleSetAlbumCover = async (albumId: string, photoId: string) => {
    const alb = albums.find((a) => a.id === albumId);
    if (!alb) return;
    await saveAlbum({ ...alb, coverPhotoId: photoId });
    await refreshMedia();
    celebrate();
  };

  const handleSaveCaption = async () => {
    if (!lightboxPhoto) return;
    await savePhoto({ ...lightboxPhoto, caption: captionDraft.trim() });
    await refreshMedia();
    setCaptionSavedNotice(true);
    setTimeout(() => setCaptionSavedNotice(false), 1800);
  };

  const handleMovePhoto = async () => {
    if (!lightboxPhoto || !moveTargetAlbumId || moveTargetAlbumId === lightboxPhoto.albumId) return;
    await savePhoto({ ...lightboxPhoto, albumId: moveTargetAlbumId });

    // Update destination cover if empty
    const destAlbum = albums.find((a) => a.id === moveTargetAlbumId);
    if (destAlbum && !destAlbum.coverPhotoId) {
      await saveAlbum({ ...destAlbum, coverPhotoId: lightboxPhoto.id });
    }

    // Advance lightbox or close
    const remaining = albumPhotos.filter((p) => p.id !== lightboxPhoto.id);
    setLightboxPhotoId(remaining.length > 0 ? remaining[0].id : null);
    await refreshMedia();
    celebrate();
  };

  const handleDeletePhoto = async (photoId: string) => {
    const idx = albumPhotos.findIndex((p) => p.id === photoId);
    const remaining = albumPhotos.filter((p) => p.id !== photoId);
    await removePhoto(photoId);

    // Clear cover reference if deleted photo was cover
    const parentAlbum = albums.find((a) => a.coverPhotoId === photoId);
    if (parentAlbum) {
      const fallbackCover = photos.find((p) => p.albumId === parentAlbum.id && p.id !== photoId);
      await saveAlbum({ ...parentAlbum, coverPhotoId: fallbackCover?.id });
    }

    if (lightboxPhotoId === photoId) {
      if (remaining.length > 0) {
        setLightboxPhotoId(remaining[Math.min(idx, remaining.length - 1)].id);
      } else {
        setLightboxPhotoId(null);
      }
    }
    setConfirmDeletePhotoId(null);
    await refreshMedia();
  };

  const getAlbumCoverUrl = (alb: OfflineAlbumRecord): string | null => {
    if (alb.coverPhotoId && photoUrls[alb.coverPhotoId]) {
      return photoUrls[alb.coverPhotoId];
    }
    const firstPhoto = photos.find((p) => p.albumId === alb.id);
    return firstPhoto ? photoUrls[firstPhoto.id] || null : null;
  };

  const totalSizeMb = (photos.reduce((acc, p) => acc + p.sizeBytes, 0) / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Hidden input for uploading photos to a specific album directly from gallery grid */}
      <input
        ref={quickAlbumUploadRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (quickUploadAlbumId) {
            handleUploadFilesToAlbum(quickUploadAlbumId, e.target.files);
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/50 text-[#be7fab] dark:text-[#daabcb] shadow-[0_0_14px_rgba(190,127,171,0.3)]">
              <Images className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              {activeAlbum ? activeAlbum.name : 'Offline Photo Albums'}
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            {albums.length} Albums · {photos.length} Photos Stored Locally ({totalSizeMb} MB IndexedDB)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeAlbum ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedAlbumId(null)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] hover:text-[#be7fab] dark:hover:text-[#efd0e5] bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl transition-colors whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>All Albums</span>
              </button>

              <button
                type="button"
                onClick={() => multiUploadInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.45)] transition-all active:scale-95 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload Photos</span>
              </button>

              <input
                ref={multiUploadInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleUploadFilesToAlbum(activeAlbum.id, e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </>
          ) : (
            <button
              type="button"
              onClick={openCreateAlbumModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.45)] transition-all active:scale-95 whitespace-nowrap"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Add New Album</span>
            </button>
          )}
        </div>
      </div>

      {/* Offline Vault Summary Bar */}
      <div className="hud-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#2d1b28]/85 dark:text-[#e6c3db]">
          <HardDrive className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
          <span>
            Local Browser Vault Active · Photos load instantly offline from IndexedDB
          </span>
        </div>
        {activeAlbum?.description && (
          <span className="text-[#be7fab] dark:text-[#daabcb] font-mono text-[11px] truncate max-w-md font-semibold">
            {activeAlbum.description}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="hud-panel h-64 animate-pulse border-[#d29ec2] dark:border-[#be7fab]/30 bg-white/60 dark:bg-[#1c0f19]/60"
            />
          ))}
        </div>
      ) : !activeAlbum ? (
        /* ================= ALBUMS GRID ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {albums.map((album) => {
            const count = photos.filter((p) => p.albumId === album.id).length;
            const coverUrl = getAlbumCoverUrl(album);
            const isConfirmingDelete = confirmDeleteAlbumId === album.id;

            return (
              <div
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className="hud-panel hud-corners overflow-hidden flex flex-col justify-between cursor-pointer group transition-all hover:border-[#be7fab]"
              >
                {/* Album Cover Thumbnail */}
                <div className="relative aspect-4/3 w-full bg-[#e6c3db]/60 dark:bg-[#120a10] border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30 overflow-hidden">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-5 bg-linear-to-br from-[#efd0e5] via-[#e6c3db] to-[#daabcb]/50 dark:from-[#241420] dark:via-[#1c0f19] dark:to-[#be7fab]/20 text-center">
                      <Camera className="w-8 h-8 text-[#be7fab] dark:text-[#daabcb] mb-2 opacity-80" />
                      <span className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                        Empty Album · Tap to Upload
                      </span>
                    </div>
                  )}

                  <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(18, 10, 16, 0.88) 0%, transparent 100%)',
                    }}
                  />

                  <span className="absolute bottom-2.5 left-3 text-[11px] font-mono font-bold text-[#efd0e5] tabular-nums">
                    {count} {count === 1 ? 'photo' : 'photos'}
                  </span>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickUploadAlbumId(album.id);
                        quickAlbumUploadRef.current?.click();
                      }}
                      className="p-1.5 rounded-lg bg-[#120a10]/85 border border-[#be7fab]/45 text-[#efd0e5] hover:bg-[#be7fab] hover:text-[#120a10] transition-colors"
                      title="Upload photos to this album"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openEditAlbumModal(album, e)}
                      className="p-1.5 rounded-lg bg-[#120a10]/85 border border-[#be7fab]/45 text-[#daabcb] hover:text-[#efd0e5] transition-colors"
                      title="Edit album details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Album Info Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                      {album.name}
                    </h3>
                    <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1 line-clamp-2 min-h-[2rem]">
                      {album.description || 'Custom offline photo collection.'}
                    </p>
                  </div>

                  <div
                    className="mt-3 pt-2.5 border-t border-[#d29ec2]/55 dark:border-[#be7fab]/20 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                    >
                      Open Album →
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="px-2 py-0.5 rounded bg-[#be7fab] text-[#120a10] text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAlbumId(null)}
                          className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAlbumId(album.id)}
                        className="p-1 text-[#be7fab] dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded transition-colors"
                        title="Delete album"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= SELECTED ALBUM PHOTO GRID ================= */
        <div
          className="space-y-5"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFiles(true);
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFiles(false);
            handleUploadFilesToAlbum(activeAlbum.id, e.dataTransfer.files);
          }}
        >
          {/* Drag & Drop Multi-Upload Dropzone */}
          <div
            onClick={() => multiUploadInputRef.current?.click()}
            className={`hud-panel p-5 border-2 border-dashed cursor-pointer text-center transition-all ${
              isDraggingFiles
                ? 'border-[#be7fab] dark:border-[#efd0e5] bg-[#be7fab]/25 shadow-[0_0_24px_rgba(190,127,171,0.45)]'
                : 'border-[#d29ec2] dark:border-[#be7fab]/45 hover:border-[#be7fab] bg-white/80 dark:bg-[#1c0f19]/75'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
              <span className="p-2.5 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/50 text-[#be7fab] dark:text-[#efd0e5]">
                <Upload className="w-5 h-5" />
              </span>
              <div className="text-center sm:text-left">
                <div className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Drag &amp; drop multiple photos here, or click to select from your device
                </div>
                <div className="text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
                  All uploaded photos are stored in local IndexedDB for fast offline viewing
                </div>
              </div>
            </div>
          </div>

          {albumPhotos.length === 0 ? (
            <div className="hud-panel py-14 text-center space-y-2">
              <Camera className="w-9 h-9 text-[#be7fab] dark:text-[#daabcb] mx-auto opacity-75" />
              <div className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                No photos in &quot;{activeAlbum.name}&quot; yet
              </div>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 max-w-md mx-auto">
                Click &quot;+ Upload Photos&quot; above to add single or batch photos from your computer or phone.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albumPhotos.map((photo) => {
                const isCover = activeAlbum.coverPhotoId === photo.id;
                const url = photoUrls[photo.id];
                return (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhotoId(photo.id)}
                    className={`hud-panel overflow-hidden cursor-pointer group flex flex-col justify-between transition-all ${
                      isCover ? 'border-[#be7fab] dark:border-[#efd0e5] shadow-[0_0_18px_rgba(190,127,171,0.35)]' : ''
                    }`}
                  >
                    <div className="relative aspect-square bg-[#120a10] overflow-hidden">
                      {url ? (
                        <img
                          src={url}
                          alt={photo.caption || photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}

                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetAlbumCover(activeAlbum.id, photo.id);
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isCover
                              ? 'bg-[#be7fab] text-[#120a10] border-[#efd0e5]'
                              : 'bg-[#120a10]/85 text-[#efd0e5] border-[#be7fab]/50 hover:bg-[#be7fab] hover:text-[#120a10]'
                          }`}
                          title="Set as album cover"
                        >
                          <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-[#120a10]' : ''}`} />
                        </button>
                      </div>

                      {isCover && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#be7fab] text-[#120a10] text-[10px] font-mono font-bold">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white dark:bg-[#1c0f19]">
                      <div className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                        {photo.caption || photo.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#be7fab] dark:text-[#d29ec2]/75 truncate mt-0.5">
                        {(photo.sizeBytes / 1024).toFixed(0)} KB · Offline Ready
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= FULL-SCREEN LIGHTBOX VIEWER ================= */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#120a10]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightboxPhotoId(null)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between gap-4 pb-3 border-b border-[#be7fab]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <div className="text-xs font-mono text-[#daabcb] tabular-nums">
                {activeAlbum?.name} · Photo {lightboxIndex + 1} of {albumPhotos.length}
              </div>
              <h2 className="font-display text-lg font-bold text-[#efd0e5] truncate">
                {lightboxPhoto.caption || lightboxPhoto.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setLightboxPhotoId(null)}
              className="p-2 rounded-xl bg-[#1c0f19] border border-[#be7fab]/50 text-[#efd0e5] hover:bg-[#be7fab] hover:text-[#120a10] transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Image Stage with Prev/Next Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {albumPhotos.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const prevIdx =
                    (lightboxIndex - 1 + albumPhotos.length) % albumPhotos.length;
                  setLightboxPhotoId(albumPhotos[prevIdx].id);
                }}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-[#1c0f19]/90 border border-[#be7fab] text-[#efd0e5] hover:bg-[#be7fab] hover:text-[#120a10] shadow-[0_0_20px_rgba(190,127,171,0.45)] transition-all"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={photoUrls[lightboxPhoto.id]}
              alt={lightboxPhoto.caption || lightboxPhoto.title}
              className="max-h-full max-w-full object-contain rounded-2xl border border-[#be7fab]/50 shadow-[0_0_40px_rgba(190,127,171,0.3)]"
              referrerPolicy="no-referrer"
            />

            {albumPhotos.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (lightboxIndex + 1) % albumPhotos.length;
                  setLightboxPhotoId(albumPhotos[nextIdx].id);
                }}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-[#1c0f19]/90 border border-[#be7fab] text-[#efd0e5] hover:bg-[#be7fab] hover:text-[#120a10] shadow-[0_0_20px_rgba(190,127,171,0.45)] transition-all"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Controls Bar: Caption, Move Album, Cover, Delete */}
          <div
            className="hud-panel p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Caption Editor */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a photo caption or memory..."
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCaption();
                }}
                className="flex-1 px-3 py-2 text-xs bg-[#120a10] text-[#efd0e5] border border-[#be7fab]/45 rounded-xl focus:outline-none focus:border-[#efd0e5]"
              />
              <button
                type="button"
                onClick={handleSaveCaption}
                className="px-3.5 py-2 text-xs font-bold bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] rounded-xl whitespace-nowrap flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{captionSavedNotice ? 'Saved' : 'Save Caption'}</span>
              </button>
            </div>

            {/* Move to Album & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#120a10] px-2.5 py-1.5 rounded-xl border border-[#be7fab]/35">
                <FolderInput className="w-3.5 h-3.5 text-[#daabcb]" />
                <select
                  value={moveTargetAlbumId}
                  onChange={(e) => setMoveTargetAlbumId(e.target.value)}
                  className="bg-transparent text-xs text-[#efd0e5] focus:outline-none"
                >
                  {albums.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#120a10]">
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleMovePhoto}
                  disabled={moveTargetAlbumId === lightboxPhoto.albumId}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#daabcb] hover:bg-[#efd0e5] text-[#120a10] rounded-lg disabled:opacity-40 whitespace-nowrap"
                >
                  Move
                </button>
              </div>

              {activeAlbum && (
                <button
                  type="button"
                  onClick={() => handleSetAlbumCover(activeAlbum.id, lightboxPhoto.id)}
                  className="px-3 py-2 text-xs font-bold bg-[#120a10] border border-[#be7fab]/45 text-[#efd0e5] hover:bg-[#be7fab]/25 rounded-xl flex items-center gap-1 whitespace-nowrap"
                >
                  <Star className="w-3.5 h-3.5 text-[#daabcb]" />
                  <span>Set Cover</span>
                </button>
              )}

              {confirmDeletePhotoId === lightboxPhoto.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(lightboxPhoto.id)}
                    className="px-3 py-2 text-xs font-bold bg-[#be7fab] text-[#120a10] rounded-xl whitespace-nowrap"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeletePhotoId(null)}
                    className="px-2 py-2 text-xs text-[#e6c3db] hover:text-[#efd0e5]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeletePhotoId(lightboxPhoto.id)}
                  className="px-3 py-2 text-xs font-bold bg-[#120a10] border border-[#be7fab]/45 text-[#daabcb] hover:text-[#efd0e5] rounded-xl flex items-center gap-1 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT ALBUM MODAL ================= */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {editingAlbum ? 'Edit Album Details' : 'Create New Photo Album'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAlbumModalOpen(false)}
                className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbumModal} className="mt-4 space-y-3 text-xs">
              {/* Cover Thumbnail Upload */}
              <label className="block relative h-36 w-full rounded-xl border border-dashed border-[#be7fab]/50 bg-[#e6c3db]/50 dark:bg-[#120a10] overflow-hidden cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] transition-colors">
                {albumCoverPreviewUrl ? (
                  <img
                    src={albumCoverPreviewUrl}
                    alt="Album cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#be7fab] dark:text-[#daabcb] gap-1 px-4 text-center">
                    <Camera className="w-5 h-5" />
                    <span className="font-semibold">
                      Upload Album Cover Thumbnail (Optional)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAlbumCoverBlob(file);
                      setAlbumCoverPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">Album Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Roadtrip, Kitchen Remodel, Family"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes about this photo album..."
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] font-bold rounded-xl"
                >
                  {editingAlbum ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
