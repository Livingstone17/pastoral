import Sheet from './Sheet';
import ScriptureChip from './ScriptureChip';
import { NOTE_TYPE_LABELS, NOTE_TYPE_COLORS, type Note } from '../types';

interface Props {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export default function NoteViewSheet({ open, note, onClose, onEdit }: Props) {
  if (!note) return null;

  const colors = NOTE_TYPE_COLORS[note.type];
  const created = new Date(note.createdAt);
  const updated = new Date(note.updatedAt);

  return (
    <Sheet open={open} onClose={onClose} title="Note">
      <div className="flex flex-col gap-4">
        {/* Header row: type badge + private */}
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {NOTE_TYPE_LABELS[note.type]}
          </span>
          {note.isPrivate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0ECF8] px-2 py-0.5 text-xs font-medium text-[#5A4480]">
              <svg width="10" height="12" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="6" width="10" height="8" rx="1.5" />
                <path d="M4 6V4a2 2 0 014 0v2" />
              </svg>
              Private
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold leading-snug text-ink">
          {note.title}
        </h3>

        {/* Body */}
        {note.body && (
          <div className="rounded-xl bg-sand/40 px-4 py-3.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {note.body}
            </p>
          </div>
        )}

        {/* Scripture References */}
        {note.scriptureRefs.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
              Scripture References
            </p>
            <div className="flex flex-wrap gap-1.5">
              {note.scriptureRefs.map((ref) => (
                <ScriptureChip key={ref} reference={ref} />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-warm-border bg-sand px-2.5 py-1 text-xs text-muted-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t border-warm-border pt-3">
          <p className="text-xs text-muted-ink">
            Created {created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {updated.getTime() !== created.getTime() && (
              <> · Edited {updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
            )}
          </p>
        </div>

        {/* Edit button */}
        <button
          onClick={() => onEdit(note)}
          className="w-full rounded-xl bg-bark py-3.5 font-medium text-white transition-colors hover:bg-bark/90 active:scale-[0.98]"
        >
          Edit Note
        </button>
      </div>
    </Sheet>
  );
}
