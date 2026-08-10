import {
  BIBLE_DATA_URL,
  BOOK_ALIASES,
  BIBLE_BOOKS,
  SUPPORTED_TRANSLATIONS,
} from './bible.constants';
import {
  BibleDataError,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
  type ParsedRef,
  type StrongsEntry,
  type TranslationId,
} from './bible.types';

// ---------------------------------------------------------------------------
// Caching
//
// The dataset is static, so both memory and localStorage caches are
// long-lived. In-flight requests are memoized per key so React Strict Mode
// and repeated navigation never cause duplicate network requests.
// ---------------------------------------------------------------------------

const BOOKS_CACHE_KEY = 'bible:books';

let booksPromise: Promise<BibleBook[]> | null = null;
const chapterPromises = new Map<string, Promise<BibleChapter>>();
const strongsPromises = new Map<string, Promise<StrongsEntry | null>>();

function readCache(key: string): unknown {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded — ignore, memory cache still works.
  }
}

// ---------------------------------------------------------------------------
// Books metadata
// ---------------------------------------------------------------------------

/** Load the 66-book metadata once, then reuse it for the session. */
export function getBooks(): Promise<BibleBook[]> {
  if (!booksPromise) {
    booksPromise = (async () => {
      const cached = readCache(BOOKS_CACHE_KEY) as BibleBook[] | null;
      if (cached && Array.isArray(cached) && cached.length === 66) return cached;

      const res = await fetch(`${BIBLE_DATA_URL}/books.json`);
      if (!res.ok) throw new BibleDataError('Unable to load the list of Bible books.');
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new BibleDataError('The Bible books file could not be read.');
      }
      if (!Array.isArray(data) || data.length !== 66) {
        throw new BibleDataError('The Bible books file is malformed.');
      }
      const books = data as BibleBook[];
      writeCache(BOOKS_CACHE_KEY, books);
      return books;
    })().catch((err) => {
      booksPromise = null; // allow a later retry
      throw err;
    });
  }
  return booksPromise;
}

/** Resolve a book by id or by its canonical name. */
export async function getBook(ref: number | string): Promise<BibleBook> {
  const books = await getBooks();
  const book =
    typeof ref === 'number'
      ? books.find((b) => b.id === ref)
      : books.find((b) => b.name.toLowerCase() === String(ref).trim().toLowerCase());
  if (!book) {
    throw new BibleDataError(`The book "${ref}" was not found.`);
  }
  return book;
}

// ---------------------------------------------------------------------------
// Chapters & verses
// ---------------------------------------------------------------------------

function normalizeTranslation(translation: string): TranslationId {
  const id = String(translation).toUpperCase();
  if (!SUPPORTED_TRANSLATIONS.has(id as TranslationId)) {
    throw new BibleDataError(`"${translation}" is not a supported translation.`);
  }
  return id as TranslationId;
}

/**
 * Load a chapter. One network request per chapter — subsequent requests for
 * the same translation/book/chapter hit the memory or localStorage cache.
 */
export function getChapter(
  translation: string,
  bookId: number,
  chapter: number,
): Promise<BibleChapter> {
  const key = `bible:${String(translation).toUpperCase()}:${bookId}:${chapter}`;

  const inFlight = chapterPromises.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const translationId = normalizeTranslation(translation);
    const book = await getBook(bookId);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
      throw new BibleDataError(`"${book.name}" only has ${book.chapters} chapters.`);
    }

    const cached = readCache(key) as BibleChapter | null;
    if (cached) return cached;

    const res = await fetch(`${BIBLE_DATA_URL}/${translationId}/${bookId}/${chapter}.json`);
    if (!res.ok) throw new BibleDataError('Unable to load this Bible chapter.');
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new BibleDataError('This Bible chapter could not be read.');
    }
    if (!Array.isArray(data)) {
      throw new BibleDataError('This Bible chapter is malformed.');
    }
    const verses = data as BibleChapter;
    writeCache(key, verses);
    return verses;
  })().catch((err) => {
    chapterPromises.delete(key); // allow a retry for transient failures
    throw err;
  });

  chapterPromises.set(key, promise);
  return promise;
}

/**
 * Find a single verse. Loads the chapter once and looks the verse up
 * locally — never one request per verse.
 */
export async function getVerse(
  translation: string,
  bookId: number,
  chapter: number,
  verse: number,
): Promise<BibleVerse | undefined> {
  const chapterVerses = await getChapter(translation, bookId, chapter);
  return chapterVerses.find((v) => Number(v.verse) === Number(verse));
}

// ---------------------------------------------------------------------------
// Strong's
// ---------------------------------------------------------------------------

/**
 * Load a Strong's entry (e.g. "H1" or "G1161"). Entries are cached
 * aggressively. Returns null when the entry is not present in the dataset.
 */
export function getStrongs(strongsNumber: string): Promise<StrongsEntry | null> {
  const number = strongsNumber.trim().toUpperCase();
  const key = `strongs:${number}`;

  const inFlight = strongsPromises.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    if (!/^[HG]\d{1,4}$/.test(number)) {
      throw new BibleDataError(`"${strongsNumber}" is not a valid Strong's number.`);
    }
    const cached = readCache(key) as StrongsEntry | null;
    if (cached) return cached;

    const res = await fetch(`${BIBLE_DATA_URL}/strongs/BDBT/${number}.json`);
    if (res.status === 404) return null; // entry not in the dataset yet
    if (!res.ok) throw new BibleDataError(`Unable to load Strong's ${number}.`);
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new BibleDataError(`Strong's ${number} could not be read.`);
    }
    const entry = Array.isArray(data) ? (data[0] as StrongsEntry) : (data as StrongsEntry);
    writeCache(key, entry);
    return entry;
  })().catch((err) => {
    strongsPromises.delete(key); // allow a retry
    throw err;
  });

  strongsPromises.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Reference parsing ("John 3:16", "Psalm 23", "Luke 15:11-32")
// ---------------------------------------------------------------------------

export function canonicalBookName(input: string): string | null {
  const key = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (BOOK_ALIASES[key]) return BOOK_ALIASES[key];
  const exact = BIBLE_BOOKS.find((b) => b.toLowerCase() === key);
  return exact ?? null;
}

export function parseReference(input: string): ParsedRef | null {
  const trimmed = input.trim();
  const m = trimmed.match(/^(.*?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  if (!m) return null;
  const bookName = canonicalBookName(m[1]);
  if (!bookName) return null;
  const chapter = parseInt(m[2], 10);
  if (!chapter) return null;
  const verseStart = m[3] ? parseInt(m[3], 10) : undefined;
  const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart;
  if (verseStart !== undefined && verseEnd !== undefined && verseEnd < verseStart) return null;
  return { bookName, chapter, verseStart, verseEnd };
}

// ---------------------------------------------------------------------------
// "Open in Bible" events
// ---------------------------------------------------------------------------

type RefListener = (ref: string) => void;
const refListeners = new Set<RefListener>();

/** Request the app to open the Bible at a passage (used by scripture chips). */
export function openBibleAt(ref: string): void {
  refListeners.forEach((fn) => fn(ref));
}

/** Subscribe to open-in-Bible requests. Returns an unsubscribe function. */
export function subscribeToBibleRef(fn: RefListener): () => void {
  refListeners.add(fn);
  return () => {
    refListeners.delete(fn);
  };
}
