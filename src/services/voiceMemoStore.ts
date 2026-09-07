/**
 * IndexedDB wrapper for voice memo blob storage.
 *
 * Voice memos are stored as raw Blobs in IndexedDB rather than base64 data
 * URLs in localStorage. This avoids the ~5MB localStorage quota and is the
 * standard approach for offline-first PWAs (IndexedDB typically allows 50%+
 * of available disk space).
 *
 * The Message type stores a *key* (e.g. "memo-{messageId}") in its
 * voiceMemo field. The actual blob lives here.
 */

const DB_NAME = 'pastoral-voice-memos';
const DB_VERSION = 1;
const STORE_NAME = 'memos';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

/** Save a Blob under the given key. */
export async function saveVoiceMemo(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Load a Blob by key. Returns undefined if not found. */
export async function loadVoiceMemo(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a Blob by key. */
export async function deleteVoiceMemo(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Convert a base64 data URL to a Blob (for migrating old data).
 * Returns null if the input isn't a data URL.
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/** Generate a key for a message's voice memo. */
export function memoKey(messageId: string): string {
  return `memo-${messageId}`;
}
