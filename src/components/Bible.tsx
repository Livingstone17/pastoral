import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getBooks,
  getBook,
  getChapter,
  parseReference,
} from '../services/bible/bible.service';
import { BIBLE_TRANSLATIONS, DEFAULT_TRANSLATION } from '../services/bible/bible.constants';
import type { BibleBook, BibleChapter, TranslationId } from '../services/bible/bible.types';
import StrongsSheet from './StrongsSheet';

type View = 'books' | 'chapters' | 'read';

interface Props {
  /** Show a close button in the header (fullscreen mode). */
  onClose?: () => void;
  /** When set, jump to this passage (e.g. "John 3:16"). */
  targetRef?: string | null;
  /** Call after a targetRef has been consumed. */
  onRefConsumed?: () => void;
}

// Tokenize verse text: "<S>7225</S> word<br/>next" -> text / strongs / break
type TextToken = string | { strongs: string } | { br: true };

function tokenizeVerse(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const re = /<S>(\d+)<\/S>|<br\s*\/?>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    if (m[1]) tokens.push({ strongs: m[1] });
    else tokens.push({ br: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

function plainVerseText(text: string): string {
  return text
    .replace(/<S>(\d+)<\/S>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Bible({ onClose, targetRef, onRefConsumed }: Props) {
  const [translation, setTranslation] = useState<TranslationId>(DEFAULT_TRANSLATION);

  const [books, setBooks] = useState<BibleBook[] | null>(null);
  const [booksError, setBooksError] = useState<string | null>(null);

  const [view, setView] = useState<View>('books');
  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [copied, setCopied] = useState(false);
  const [highlight, setHighlight] = useState<{ start: number; end: number } | null>(null);
  const [strongsActive, setStrongsActive] = useState<string | null>(null);

  // Guards against stale async responses when navigating quickly.
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    getBooks()
      .then((b) => {
        if (mountedRef.current) setBooks(b);
      })
      .catch(() => {
        if (mountedRef.current) {
          setBooksError('Could not load the Bible. Check your connection and try again.');
        }
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadChapter = useCallback(
    async (b: BibleBook, ch: number, tr: TranslationId) => {
      const requestId = ++requestRef.current;
      setBook(b);
      setChapter(ch);
      setView('read');
      setLoading(true);
      setChapterError(null);
      setHighlight(null);
      try {
        const data = await getChapter(tr, b.id, ch);
        if (requestId !== requestRef.current || !mountedRef.current) return;
        setVerses(data);
      } catch (err) {
        if (requestId !== requestRef.current || !mountedRef.current) return;
        // Clear stale content so the error + retry state renders under the
        // correct chapter header instead of the previous chapter's verses.
        setVerses(null);
        setChapterError(err instanceof Error ? err.message : 'Unable to load this Bible chapter.');
      } finally {
        if (requestId === requestRef.current && mountedRef.current) setLoading(false);
      }
    },
    [],
  );

  const jumpToRef = useCallback(
    async (input: string): Promise<boolean> => {
      const parsed = parseReference(input);
      if (!parsed) {
        setSearchError('Try a passage like "John 3:16", "Luke 15:11-32" or "Psalm 23".');
        return false;
      }
      try {
        const target = await getBook(parsed.bookName);
        if (parsed.chapter < 1 || parsed.chapter > target.chapters) {
          setSearchError(`"${target.name}" only has ${target.chapters} chapters.`);
          return false;
        }
        await loadChapter(target, parsed.chapter, translation);
        if (parsed.verseStart) {
          setHighlight({ start: parsed.verseStart, end: parsed.verseEnd ?? parsed.verseStart });
        }
        return true;
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Could not open that passage.');
        return false;
      }
    },
    [translation, loadChapter],
  );

  // Handle incoming "open in Bible" requests
  useEffect(() => {
    if (!targetRef) return;
    void jumpToRef(targetRef);
    onRefConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void jumpToRef(search);
  }

  function handleTranslationChange(tr: TranslationId) {
    setTranslation(tr);
    // Reload the chapter currently on screen in the new translation.
    if (book && chapter && view === 'read') {
      void loadChapter(book, chapter, tr);
    }
  }

  async function handleCopyChapter() {
    if (!verses) return;
    const text = verses.map((v) => `${v.verse} ${plainVerseText(v.text)}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  const bookChapters = book?.chapters ?? 0;
  const hasStrongsMarkup = useMemo(
    () => verses?.some((v) => /<S>\d+<\/S>/i.test(v.text)) ?? false,
    [verses],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Header */}
      <div className="safe-top shrink-0 px-5 pb-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Bible</h1>
            <p className="mt-0.5 text-xs text-muted-ink">
              {BIBLE_TRANSLATIONS.find((t) => t.id === translation)?.name}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-ink transition-colors hover:bg-sand"
              aria-label="Close Bible"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Passage search */}
        <form onSubmit={handleSearchSubmit} className="relative mb-3">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-ink"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchError('');
            }}
            placeholder="Jump to a passage — John 3:16, Psalm 23…"
            className="w-full rounded-xl border border-warm-border bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-ink/60 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </form>

        {/* Translation selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {BIBLE_TRANSLATIONS.map((t) => {
            const active = t.id === translation;
            return (
              <button
                key={t.id}
                onClick={() => handleTranslationChange(t.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'border-bark bg-bark text-white'
                    : 'border-warm-border bg-white text-muted-ink hover:border-bark/30'
                }`}
              >
                {t.id}
              </button>
            );
          })}
        </div>

        {searchError && <p className="mt-2 text-xs text-red-600">{searchError}</p>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {booksError ? (
          <ErrorState
            message={booksError}
            onRetry={() => {
              setBooksError(null);
              getBooks()
                .then(setBooks)
                .catch(() => setBooksError('Could not load the Bible. Check your connection and try again.'));
            }}
          />
        ) : !books ? (
          <LoadingState />
        ) : view === 'books' ? (
          <BookList
            books={books}
            onSelect={(b) => {
              // Tap a book -> chapter picker.
              setBook(b);
              setView('chapters');
            }}
          />
        ) : view === 'chapters' && book ? (
          <ChapterGrid
            book={book}
            onBack={() => setView('books')}
            onSelect={(n) => void loadChapter(book, n, translation)}
          />
        ) : (
          <ChapterView
            book={book ?? null}
            chapter={chapter ?? 1}
            verses={verses}
            loading={loading}
            error={chapterError}
            hasStrongsMarkup={hasStrongsMarkup}
            translation={translation}
            copied={copied}
            highlight={highlight}
            onCopy={handleCopyChapter}
            onStrongs={setStrongsActive}
            onBack={() => setView('chapters')}
            onRetry={() => book && chapter && void loadChapter(book, chapter, translation)}
            onPrev={() =>
              book && chapter !== null && chapter > 1 && void loadChapter(book, chapter - 1, translation)
            }
            onNext={() =>
              book && chapter !== null && chapter < bookChapters && void loadChapter(book, chapter + 1, translation)
            }
          />
        )}
      </div>

      <StrongsSheet
        open={!!strongsActive}
        strongsNumber={strongsActive}
        onClose={() => setStrongsActive(null)}
      />
    </div>
  );
}

// ---- Shared states -------------------------------------------------------

function LoadingState() {
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm-border border-t-bark" />
      <p className="text-sm text-muted-ink">Loading the Bible…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-10 text-center">
      <p className="text-sm text-muted-ink">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-bark px-5 py-2.5 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}

// ---- Book list -----------------------------------------------------------

function BookList({ books, onSelect }: { books: BibleBook[]; onSelect: (book: BibleBook) => void }) {
  const ot = books.filter((b) => b.testament === 'OT');
  const nt = books.filter((b) => b.testament === 'NT');

  return (
    <div className="flex flex-col gap-6">
      {(
        [
          ['Old Testament', ot],
          ['New Testament', nt],
        ] as [string, BibleBook[]][]
      ).map(([label, list]) => (
        <div key={label}>
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-ink">
            {label}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {list.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelect(b)}
                className="flex items-center justify-between gap-2 rounded-xl border border-warm-border bg-white px-3 py-2.5 text-left shadow-sm transition-all hover:border-bark/40 hover:shadow active:scale-[0.98]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{b.name}</span>
                  <span className="block text-[0.6875rem] text-muted-ink">
                    {b.chapters} chapter{b.chapters === 1 ? '' : 's'}
                  </span>
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-warm-border"
                >
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Chapter picker ------------------------------------------------------

function ChapterGrid({
  book,
  onBack,
  onSelect,
}: {
  book: BibleBook;
  onBack: () => void;
  onSelect: (n: number) => void;
}) {
  return (
    <div>
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs font-medium text-bark-light">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        All books
      </button>
      <h2 className="mb-3 font-serif text-lg font-semibold text-ink">{book.name}</h2>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className="rounded-lg border border-warm-border bg-white py-2 text-xs font-medium text-ink transition-all hover:border-bark/40 hover:text-bark active:scale-95"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Chapter reading -----------------------------------------------------

function ChapterView({
  book,
  chapter,
  verses,
  loading,
  error,
  hasStrongsMarkup,
  translation,
  copied,
  highlight,
  onCopy,
  onStrongs,
  onBack,
  onRetry,
  onPrev,
  onNext,
}: {
  book: BibleBook | null;
  chapter: number;
  verses: BibleChapter | null;
  loading: boolean;
  error: string | null;
  hasStrongsMarkup: boolean;
  translation: TranslationId;
  copied: boolean;
  highlight: { start: number; end: number } | null;
  onCopy: () => void;
  onStrongs: (n: string) => void;
  onBack: () => void;
  onRetry: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const hasPrev = chapter > 1;
  const hasNext = book ? chapter < book.chapters : false;

  // Scroll the highlighted verse range into view once the chapter loads.
  useEffect(() => {
    if (!highlight || verses === null) return;
    const el = document.getElementById(`bible-verse-${highlight.start}`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [verses, highlight]);

  const bookName = book?.name ?? '';

  return (
    <div>
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs font-medium text-bark-light">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Chapters
      </button>

      <div className="mb-4 flex items-start justify-between gap-3 border-b border-warm-border pb-3">
        <div>
          <h2 className="font-serif text-xl font-semibold leading-tight text-ink">
            {bookName} {chapter}
          </h2>
          {loading && <p className="mt-0.5 animate-pulse text-[0.6875rem] text-muted-ink">Loading…</p>}
        </div>
        <button
          onClick={onCopy}
          disabled={!verses}
          className="shrink-0 rounded-lg border border-warm-border bg-white px-2.5 py-1.5 text-[0.6875rem] font-medium text-bark-light transition-colors hover:border-bark/40 hover:text-bark disabled:opacity-40"
        >
          {copied ? '✓ Copied' : 'Copy chapter'}
        </button>
      </div>

      {error && verses === null ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : verses === null && loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-sand" style={{ width: `${88 - i * 9}%` }} />
          ))}
        </div>
      ) : verses === null ? (
        <p className="text-sm italic text-muted-ink">No text found for {bookName} {chapter}.</p>
      ) : verses.length === 0 ? (
        <p className="text-sm italic text-muted-ink">No text found for {bookName} {chapter}.</p>
      ) : (
        <>
          <div className={`flex flex-col gap-3.5 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {verses.map((v) => {
              const isHighlighted =
                highlight !== null && v.verse >= highlight.start && v.verse <= highlight.end;
              return (
                <p
                  key={v.pk ?? v.verse}
                  id={`bible-verse-${v.verse}`}
                  className={`text-[0.9375rem] leading-relaxed text-ink ${
                    isHighlighted ? '-mx-1.5 rounded-lg border border-[#EAD9A0] bg-[#FDF6E3] px-1.5 py-1' : ''
                  }`}
                >
                  <sup className="mr-1.5 font-serif text-[0.6875rem] font-semibold text-bark-light">{v.verse}</sup>
                  <VerseText text={v.text} testament={book?.testament ?? 'OT'} onStrongs={onStrongs} />
                </p>
              );
            })}
          </div>
          {hasStrongsMarkup && (
            <p className="mt-4 text-[0.6875rem] text-muted-ink/70">
              Superscript numbers are Strong's references — tap one to see the definition. ({translation})
            </p>
          )}
        </>
      )}

      {/* Prev / Next chapter */}
      <div className="mt-6 flex gap-2.5 border-t border-warm-border pt-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-warm-border bg-white py-3 text-sm font-medium text-ink transition-colors disabled:opacity-40 hover:border-bark/40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          {chapter - 1 >= 1 ? `${bookName} ${chapter - 1}` : 'Previous'}
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-warm-border bg-white py-3 text-sm font-medium text-ink transition-colors disabled:opacity-40 hover:border-bark/40"
        >
          {hasNext ? `${bookName} ${chapter + 1}` : 'Next'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function VerseText({
  text,
  testament,
  onStrongs,
}: {
  text: string;
  testament: 'OT' | 'NT';
  onStrongs: (n: string) => void;
}) {
  const tokens = useMemo(() => tokenizeVerse(text), [text]);
  const prefix = testament === 'OT' ? 'H' : 'G';

  return (
    <>
      {tokens.map((token, i) => {
        if (typeof token === 'string') return <span key={i}>{token}</span>;
        if ('br' in token) return <br key={i} />;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onStrongs(`${prefix}${token.strongs}`)}
            title={`Strong's ${prefix}${token.strongs}`}
            className="mx-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-sm bg-[#FDF6E3] px-0.5 align-super text-[0.5625rem] font-semibold leading-none text-[#8A6A18] transition-colors hover:bg-[#F3E6C2]"
          >
            {token.strongs}
          </button>
        );
      })}
    </>
  );
}
