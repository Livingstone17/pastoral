import { useState, useEffect } from 'react';
import { useStore } from '../store';
import Sheet from './Sheet';
import ScriptureChip from './ScriptureChip';
import { NOTE_TYPE_LABELS, NOTE_TYPE_COLORS, type NoteType, type Note } from '../types';

const NOTE_TYPES: NoteType[] = ['sermon_prep', 'personal', 'counseling', 'study'];

interface Props {
  open: boolean;
  note?: Note;
  onClose: () => void;
}

export default function NoteSheet({ open, note, onClose }: Props) {
  const { addNote, updateNote, deleteNote } = useStore();
  const isEditing = !!note;

  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'sermon_prep' as NoteType,
    scriptureRefs: [] as string[],
    tags: [] as string[],
    isPrivate: false,
  });
  const [refInput, setRefInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (note) {
      setForm({
        title: note.title,
        body: note.body,
        type: note.type,
        scriptureRefs: [...note.scriptureRefs],
        tags: [...note.tags],
        isPrivate: note.isPrivate,
      });
    } else {
      setForm({ title: '', body: '', type: 'sermon_prep', scriptureRefs: [], tags: [], isPrivate: false });
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
      body: form.body,
      type: form.type,
      scriptureRefs: form.scriptureRefs,
      tags: form.tags,
      isPrivate: form.type === 'counseling' ? true : form.isPrivate,
      linkedMessageId: note?.linkedMessageId,
      linkedContactId: note?.linkedContactId,
    };
    if (isEditing && note) {
      updateNote({ ...note, ...data });
    } else {
      addNote(data);
    }
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'}>
      <div className="flex flex-col gap-5">
        {/* Type selector */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {NOTE_TYPES.map((t) => {
              const colors = NOTE_TYPE_COLORS[t];
              const active = form.type === t;
              return (
                <button
                  key={t}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      type: t,
                      isPrivate: t === 'counseling' ? true : f.isPrivate,
                    }))
                  }
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
                      : { backgroundColor: 'transparent', color: '#8B7B6B', borderColor: '#DDD5C9' }
                  }
                >
                  {NOTE_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counseling privacy notice */}
        {form.type === 'counseling' && (
          <div className="flex items-center gap-2 rounded-xl bg-[#F0ECF8] px-3.5 py-2.5">
            <svg width="13" height="15" viewBox="0 0 12 14" fill="none" stroke="#5A4480" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="6" width="10" height="8" rx="1.5" />
              <path d="M4 6V4a2 2 0 014 0v2" />
            </svg>
            <span className="text-xs font-medium text-[#5A4480]">
              Counseling notes are always private
            </span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Note title"
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Content
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Write your note..."
            rows={8}
            className="w-full resize-none rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20 leading-relaxed"
          />
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
              placeholder="e.g. John 3:16"
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
            Tags
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
                    onClick={() =>
                      setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
                    }
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
              placeholder="Add a tag"
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

        {/* Private toggle (non-counseling only) */}
        {form.type !== 'counseling' && (
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-ink">Mark as private</span>
            <button
              onClick={() => setForm((f) => ({ ...f, isPrivate: !f.isPrivate }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.isPrivate ? 'bg-bark' : 'bg-sand border border-warm-border'}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!form.title.trim()}
          className="w-full rounded-xl bg-bark py-3.5 font-medium text-white disabled:opacity-40"
        >
          {isEditing ? 'Save Changes' : 'Add Note'}
        </button>

        {isEditing && (
          <button
            onClick={() => {
              if (note) {
                deleteNote(note.id);
                onClose();
              }
            }}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
          >
            Delete Note
          </button>
        )}
      </div>
    </Sheet>
  );
}
