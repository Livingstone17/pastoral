import { useState } from 'react';
import { useStore } from '../store';
import Sheet from './Sheet';
import ScriptureChip from './ScriptureChip';
import type { Message } from '../types';

interface Props {
  open: boolean;
  message?: Message;
  onClose: () => void;
  onEdit: (message: Message) => void;
}

export default function MessageViewSheet({ open, message, onClose, onEdit }: Props) {
  const { series, deleteMessage } = useStore();
  const [copied, setCopied] = useState(false);

  if (!message) return null;

  const linkedSeries = series.find((s) => s.id === message.seriesId);

  const formattedDate = message.dateDelivered
    ? new Date(message.dateDelivered + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleCopyOutline = () => {
    if (message.outline) {
      navigator.clipboard.writeText(message.outline);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      deleteMessage(message.id);
      onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Sermon Details">
      <div className="flex flex-col gap-5">
        {/* Status & Date Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                message.status === 'delivered'
                  ? 'bg-bark/10 text-bark'
                  : message.status === 'draft'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sand text-muted-ink'
              }`}
            >
              {message.status}
            </span>

            {linkedSeries && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-bark-light">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {linkedSeries.title}
              </span>
            )}
          </div>

          {formattedDate && (
            <span className="text-xs font-medium text-muted-ink flex items-center gap-1">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formattedDate}
            </span>
          )}
        </div>

        {/* Sermon Title */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink leading-snug">{message.title}</h2>
        </div>

        {/* Scripture References */}
        {message.scriptureRefs.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-ink">
              Scripture References
            </h4>
            <div className="flex flex-wrap gap-2">
              {message.scriptureRefs.map((ref) => (
                <ScriptureChip key={ref} reference={ref} />
              ))}
            </div>
          </div>
        )}

        {/* Tags / Themes */}
        {message.tags.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-ink">
              Themes & Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {message.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-warm-border bg-sand/60 px-3 py-1 text-xs text-bark font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sermon Outline */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-ink">
              Sermon Outline & Notes
            </h4>
            {message.outline && (
              <button
                onClick={handleCopyOutline}
                className="inline-flex items-center gap-1 text-xs font-medium text-bark hover:text-bark-light transition-colors"
              >
                {copied ? (
                  <span className="text-emerald-700 font-semibold">✓ Copied to clipboard</span>
                ) : (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Outline
                  </>
                )}
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-warm-border bg-parchment/80 p-4 min-h-[160px]">
            {message.outline ? (
              <pre className="font-sans text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {message.outline}
              </pre>
            ) : (
              <p className="text-sm italic text-muted-ink">No outline provided for this sermon.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onEdit(message);
            }}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-bark py-3.5 font-medium text-white shadow-sm hover:bg-bark/90 active:scale-[0.99] transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Sermon
          </button>

          <button
            onClick={handleDelete}
            className="w-full rounded-xl border border-red-200 bg-red-50/50 py-3 text-sm font-medium text-red-600 hover:bg-red-100/50 transition-colors"
          >
            Delete Sermon
          </button>
        </div>
      </div>
    </Sheet>
  );
}
