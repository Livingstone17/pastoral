import { useState, useEffect } from 'react';
import { useStore } from '../store';
import Sheet from './Sheet';
import ScriptureChip from './ScriptureChip';
import type { Message, MessageStatus } from '../types';

const STATUSES: { id: MessageStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'archived', label: 'Archived' },
];

interface Props {
  open: boolean;
  message?: Message;
  onClose: () => void;
}

export default function MessageSheet({ open, message, onClose }: Props) {
  const { addMessage, updateMessage, deleteMessage, series } = useStore();
  const isEditing = !!message;

  const [form, setForm] = useState({
    title: '',
    status: 'draft' as MessageStatus,
    dateDelivered: '',
    seriesId: '',
    outline: '',
    scriptureRefs: [] as string[],
    tags: [] as string[],
  });
  const [refInput, setRefInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (message) {
      setForm({
        title: message.title,
        status: message.status,
        dateDelivered: message.dateDelivered ?? '',
        seriesId: message.seriesId ?? '',
        outline: message.outline,
        scriptureRefs: [...message.scriptureRefs],
        tags: [...message.tags],
      });
    } else {
      setForm({
        title: '',
        status: 'draft',
        dateDelivered: '',
        seriesId: '',
        outline: '',
        scriptureRefs: [],
        tags: [],
      });
    }
    setRefInput('');
    setTagInput('');
  }, [open]);

  function addRef() {
    const trimmed = refInput.trim();
    if (trimmed && !form.scriptureRefs.includes(trimmed)) {
      setForm((f) => ({ ...f, scriptureRefs: [...f.scriptureRefs, trimmed] }));
    }
    setRefInput('');
  }

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }));
    }
    setTagInput('');
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const data = {
      title: form.title,
      status: form.status,
      dateDelivered: form.dateDelivered || undefined,
      seriesId: form.seriesId || undefined,
      outline: form.outline,
      scriptureRefs: form.scriptureRefs,
      tags: form.tags,
      linkedEventId: message?.linkedEventId,
    };
    if (isEditing && message) {
      updateMessage({ ...message, ...data });
    } else {
      addMessage(data);
    }
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Sermon' : 'New Sermon'}>
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Sermon title"
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Status
          </label>
          <div className="flex gap-2">
            {STATUSES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setForm((f) => ({ ...f, status: id }))}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  form.status === id
                    ? id === 'draft'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : id === 'delivered'
                        ? 'border-bark bg-bark text-white'
                        : 'border-warm-border bg-sand text-muted-ink'
                    : 'border-warm-border bg-transparent text-muted-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date delivered */}
        {form.status === 'delivered' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Date Delivered
            </label>
            <input
              type="date"
              value={form.dateDelivered}
              onChange={(e) => setForm((f) => ({ ...f, dateDelivered: e.target.value }))}
              className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
          </div>
        )}

        {/* Series */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Series (optional)
          </label>
          <select
            value={form.seriesId}
            onChange={(e) => setForm((f) => ({ ...f, seriesId: e.target.value }))}
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bark/20"
          >
            <option value="">No series</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Scripture Refs */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Scripture References
          </label>
          {form.scriptureRefs.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.scriptureRefs.map((ref) => (
                <ScriptureChip
                  key={ref}
                  reference={ref}
                  onRemove={() =>
                    setForm((f) => ({ ...f, scriptureRefs: f.scriptureRefs.filter((r) => r !== ref) }))
                  }
                />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addRef();
                }
              }}
              placeholder="e.g. Romans 8:28"
              className="flex-1 rounded-xl border border-warm-border bg-sand/40 px-3 py-2.5 text-sm text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
            <button
              onClick={addRef}
              className="rounded-xl border border-warm-border bg-sand px-4 py-2.5 text-sm font-medium text-bark"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Themes / Tags
          </label>
          {form.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-warm-border bg-sand px-2.5 py-1 text-xs text-muted-ink"
                >
                  {tag}
                  <button
                    onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                    className="ml-0.5 opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="grace, discipleship..."
              className="flex-1 rounded-xl border border-warm-border bg-sand/40 px-3 py-2.5 text-sm text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
            <button
              onClick={addTag}
              className="rounded-xl border border-warm-border bg-sand px-4 py-2.5 text-sm font-medium text-bark"
            >
              Add
            </button>
          </div>
        </div>

        {/* Outline */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Outline / Notes
          </label>
          <textarea
            value={form.outline}
            onChange={(e) => setForm((f) => ({ ...f, outline: e.target.value }))}
            placeholder="Sermon outline, key points, illustrations..."
            rows={10}
            className="w-full resize-none rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-sm text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20 leading-relaxed"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!form.title.trim()}
          className="w-full rounded-xl bg-bark py-3.5 font-medium text-white disabled:opacity-40"
        >
          {isEditing ? 'Save Changes' : 'Add Sermon'}
        </button>

        {isEditing && (
          <button
            onClick={() => {
              if (message) {
                deleteMessage(message.id);
                onClose();
              }
            }}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
          >
            Delete Sermon
          </button>
        )}
      </div>
    </Sheet>
  );
}
