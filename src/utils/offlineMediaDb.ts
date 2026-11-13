export interface OfflineAlbumRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  coverPhotoId?: string;
}

export interface OfflinePhotoRecord {
  id: string;
  albumId: string;
  title: string;
  caption: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  createdAt: string;
}

export interface OfflinePlaylistRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface OfflineTrackRecord {
  id: string;
  playlistId: string; // 'library' for main library or custom playlist id
  title: string;
  artist: string;
  durationSeconds: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  createdAt: string;
}

const DB_NAME = 'lifebinder_offline_media_v1';
const DB_VERSION = 1;

const STORE_ALBUMS = 'albums';
const STORE_PHOTOS = 'photos';
const STORE_PLAYLISTS = 'playlists';
const STORE_TRACKS = 'tracks';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
        db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        photoStore.createIndex('albumId', 'albumId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        const trackStore = db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
        trackStore.createIndex('playlistId', 'playlistId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

async function putRecord<T>(storeName: string, record: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteRecord(storeName: string, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// PHOTO ALBUMS & PHOTOS API
// ==========================================

export async function listAlbums(): Promise<OfflineAlbumRecord[]> {
  const albums = await getAllFromStore<OfflineAlbumRecord>(STORE_ALBUMS);
  return albums.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveAlbum(album: OfflineAlbumRecord): Promise<void> {
  await putRecord(STORE_ALBUMS, album);
}

export async function removeAlbumAndPhotos(albumId: string): Promise<void> {
  const photos = await listPhotos();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_ALBUMS, STORE_PHOTOS], 'readwrite');
    tx.objectStore(STORE_ALBUMS).delete(albumId);
    const photoStore = tx.objectStore(STORE_PHOTOS);
    for (const p of photos) {
      if (p.albumId === albumId) {
        photoStore.delete(p.id);
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listPhotos(): Promise<OfflinePhotoRecord[]> {
  const photos = await getAllFromStore<OfflinePhotoRecord>(STORE_PHOTOS);
  return photos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function savePhoto(photo: OfflinePhotoRecord): Promise<void> {
  await putRecord(STORE_PHOTOS, photo);
}

export async function removePhoto(photoId: string): Promise<void> {
  await deleteRecord(STORE_PHOTOS, photoId);
}

// ==========================================
// OFFLINE MUSIC PLAYLISTS & TRACKS API
// ==========================================

export async function listPlaylists(): Promise<OfflinePlaylistRecord[]> {
  const playlists = await getAllFromStore<OfflinePlaylistRecord>(STORE_PLAYLISTS);
  return playlists.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function savePlaylist(playlist: OfflinePlaylistRecord): Promise<void> {
  await putRecord(STORE_PLAYLISTS, playlist);
}

export async function removePlaylistMoveTracksToLibrary(playlistId: string): Promise<void> {
  const tracks = await listTracks();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_PLAYLISTS, STORE_TRACKS], 'readwrite');
    tx.objectStore(STORE_PLAYLISTS).delete(playlistId);
    const trackStore = tx.objectStore(STORE_TRACKS);
    for (const t of tracks) {
      if (t.playlistId === playlistId) {
        trackStore.put({ ...t, playlistId: 'library' });
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listTracks(): Promise<OfflineTrackRecord[]> {
  const tracks = await getAllFromStore<OfflineTrackRecord>(STORE_TRACKS);
  return tracks.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveTrack(track: OfflineTrackRecord): Promise<void> {
  await putRecord(STORE_TRACKS, track);
}

export async function removeTrack(trackId: string): Promise<void> {
  await deleteRecord(STORE_TRACKS, trackId);
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function extractAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      cleanup();
      resolve(dur);
    };
    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
    audio.src = url;
  });
}
