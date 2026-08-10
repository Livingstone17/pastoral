import { useState } from 'react';
import { useStore } from '../store';
import { NOTE_TYPE_LABELS, NOTE_TYPE_COLORS, type NoteType, type Note } from '../types';
import ScriptureChip from './ScriptureChip';
import NoteSheet from './NoteSheet';

const FILTERS: { id: NoteType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sermon_prep', label: 'Sermon Prep' },
  { id: 'personal', label: 'Personal' },
  { id: 'counseling', label: 'Counseling' },
  { id: 'study', label: 'Study' },
];

interface Props {
  /** When set, shows a back button (More tab sub-screen). */
  onBack?: () => void;
}

export default function Notes({ onBack }: Props) {
  const { notes } = useStore();
  const [filter, setFilter] = useState<NoteType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sheet, setSheet] = useState<{ open: boolean; note?: Note }>({ open: false });

  const filtered = notes
    .filter((n) => filter === 'all' || n.type === filter)
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.scriptureRefs.some((r) => r.toLowerCase().includes(q)) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Header */}
      <div className="safe-top shrink-0 px-5 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-border bg-white text-bark shadow-sm transition-all active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
            )}
            <h1 className="font-serif text-2xl font-semibold text-ink">Notes</h1>
          </div>
          <button
            onClick={() => setSheet({ open: true })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bark shadow-sm"
            aria-label="New note"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, scripture..."
            className="w-full rounded-xl border border-warm-border bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-ink/60 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as NoteType | 'all')}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'border-bark bg-bark text-white'
                    : 'border-warm-border bg-white text-muted-ink hover:border-bark/30'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm italic text-muted-ink">
              {search ? 'No notes match your search' : 'No notes yet — tap + to add one'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTap={() => setSheet({ open: true, note })}
              />
            ))}
          </div>
        )}
      </div>

      <NoteSheet
        open={sheet.open}
        note={sheet.note}
        onClose={() => setSheet({ open: false })}
      />
    </div>
  );
}

function NoteCard({ note, onTap }: { note: Note; onTap: () => void }) {
  const colors = NOTE_TYPE_COLORS[note.type];
  const { darkMode } = useStore();
  const isCounseling = note.type === 'counseling';
  const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full cursor-pointer rounded-2xl border border-warm-border px-4 py-4 text-left shadow-sm transition-all active:scale-[0.98]"
      style={{
        backgroundColor: isCounseling
          ? darkMode
            ? '#2A2333'
            : '#F8F4FC'
          : 'var(--color-white)',
      }}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {note.isPrivate && (
            <svg
              width="11"
              height="13"
              viewBox="0 0 12 14"
              fill="none"
              stroke={isCounseling ? '#7A62AA' : '#8B7B6B'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="1" y="6" width="10" height="8" rx="1.5" />
              <path d="M4 6V4a2 2 0 014 0v2" />
            </svg>
          )}
          <span className="font-medium text-sm text-ink leading-snug">{note.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-ink">{date}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {NOTE_TYPE_LABELS[note.type]}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-muted-ink">{note.body}</p>

      {note.scriptureRefs.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {note.scriptureRefs.slice(0, 3).map((ref) => (
            <ScriptureChip key={ref} reference={ref} />
          ))}
          {note.scriptureRefs.length > 3 && (
            <span className="text-xs text-muted-ink self-center">
              +{note.scriptureRefs.length - 3} more
            </span>
          )}
        </div>
      )}

      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-sand px-2 py-0.5 text-[0.625rem] text-muted-ink">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
