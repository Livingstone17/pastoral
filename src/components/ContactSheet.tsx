import { useState, useEffect } from 'react';
import { useStore } from '../store';
import Sheet from './Sheet';
import {
  RELATIONSHIP_LABELS,
  RELATIONSHIP_COLORS,
  type Contact,
  type RelationshipType,
} from '../types';

const RELATIONSHIP_TYPES: RelationshipType[] = ['congregant', 'colleague', 'venue'];

interface Props {
  open: boolean;
  contact?: Contact;
  onClose: () => void;
}

export default function ContactSheet({ open, contact, onClose }: Props) {
  const { addContact, updateContact, deleteContact } = useStore();
  const isEditing = !!contact;

  const [form, setForm] = useState({
    name: '',
    relationshipType: 'congregant' as RelationshipType,
    phone: '',
    email: '',
    notes: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (contact) {
      setForm({
        name: contact.name,
        relationshipType: contact.relationshipType,
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        notes: contact.notes ?? '',
        tags: [...contact.tags],
      });
    } else {
      setForm({
        name: '',
        relationshipType: 'congregant',
        phone: '',
        email: '',
        notes: '',
        tags: [],
      });
    }
    setTagInput('');
  }, [open]);

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }));
    }
    setTagInput('');
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      relationshipType: form.relationshipType,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags,
    };
    if (isEditing && contact) {
      updateContact({ ...contact, ...data });
    } else {
      addContact(data);
    }
    onClose();
  }

  const inputClass =
    'w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20';

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Contact' : 'New Contact'}>
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Relationship
          </label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map((t) => {
              const colors = RELATIONSHIP_COLORS[t];
              const active = form.relationshipType === t;
              return (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, relationshipType: t }))}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dot }
                      : { backgroundColor: 'transparent', color: '#8B7B6B', borderColor: '#DDD5C9' }
                  }
                >
                  {RELATIONSHIP_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
        </div>

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
              placeholder="deacon, senior…"
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

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes"
            rows={3}
            className="w-full resize-none rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20 leading-relaxed"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="w-full rounded-xl bg-bark py-3.5 font-medium text-white transition-opacity disabled:opacity-40"
        >
          {isEditing ? 'Save Changes' : 'Add Contact'}
        </button>

        {isEditing && (
          <button
            onClick={() => {
              if (contact) {
                deleteContact(contact.id);
                onClose();
              }
            }}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
          >
            Delete Contact
          </button>
        )}
      </div>
    </Sheet>
  );
}
