import { useState, useEffect } from 'react';
import { useStore } from '../store';
import Sheet from './Sheet';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, type EventType, type CalendarEvent } from '../types';
import { toDatetimeLocal, fromDatetimeLocal } from '../utils';

const EVENT_TYPES: EventType[] = [
  'service', 'wedding', 'funeral', 'hospital_visit', 'counseling', 'speaking', 'meeting',
];

interface EventForm {
  title: string;
  type: EventType;
  location: string;
  startTime: string;
  endTime: string;
  notes: string;
  recurrence: '' | 'weekly' | 'monthly';
  reminder: string;
  linkedContactId: string;
}

interface Props {
  open: boolean;
  event?: CalendarEvent;
  defaultDate?: Date;
  onClose: () => void;
}

const RECURRENCE_OPTIONS: { id: EventForm['recurrence']; label: string }[] = [
  { id: '', label: 'Does not repeat' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

const REMINDER_OPTIONS: { id: string; label: string }[] = [
  { id: '', label: 'None' },
  { id: '15m', label: '15 min' },
  { id: '30m', label: '30 min' },
  { id: '1h', label: '1 hour' },
  { id: '1d', label: '1 day' },
];

export default function EventSheet({ open, event, defaultDate, onClose }: Props) {
  const { addEvent, updateEvent, deleteEvent, contacts } = useStore();
  const isEditing = !!event;

  function makeDefaults(date?: Date): EventForm {
    const d = date ?? new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      title: '',
      type: 'service' as EventType,
      location: '',
      startTime: toDatetimeLocal(start.toISOString()),
      endTime: toDatetimeLocal(end.toISOString()),
      notes: '',
      recurrence: '',
      reminder: '',
      linkedContactId: '',
    };
  }

  const [form, setForm] = useState<EventForm>(makeDefaults(defaultDate));

  useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({
        title: event.title,
        type: event.type,
        location: event.location ?? '',
        startTime: toDatetimeLocal(event.startTime),
        endTime: toDatetimeLocal(event.endTime),
        notes: event.notes ?? '',
        recurrence: (event.recurrence ?? '') as EventForm['recurrence'],
        reminder: event.reminder ?? '',
        linkedContactId: event.linkedContactId ?? '',
      });
    } else {
      setForm(makeDefaults(defaultDate));
    }
  }, [open]);

  function handleSave() {
    if (!form.title.trim()) return;
    const data = {
      title: form.title,
      type: form.type,
      location: form.location || undefined,
      startTime: fromDatetimeLocal(form.startTime),
      endTime: fromDatetimeLocal(form.endTime),
      notes: form.notes || undefined,
      recurrence: form.recurrence || undefined,
      reminder: form.reminder || undefined,
      linkedContactId: form.linkedContactId || undefined,
    };
    if (isEditing && event) {
      updateEvent({ ...event, ...data });
    } else {
      addEvent(data);
    }
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit Event' : 'New Event'}>
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Event title"
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => {
              const colors = EVENT_TYPE_COLORS[t];
              const active = form.type === t;
              return (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dot }
                      : { backgroundColor: 'transparent', color: '#8B7B6B', borderColor: '#DDD5C9' }
                  }
                >
                  {EVENT_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Repeats
          </label>
          <div className="flex flex-wrap gap-2">
            {RECURRENCE_OPTIONS.map(({ id, label }) => {
              const active = form.recurrence === id;
              return (
                <button
                  key={id || 'none'}
                  onClick={() => setForm((f) => ({ ...f, recurrence: id }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-bark bg-bark text-white'
                      : 'border-warm-border bg-transparent text-muted-ink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Reminder
          </label>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map(({ id, label }) => {
              const active = form.reminder === id;
              return (
                <button
                  key={id || 'none'}
                  onClick={() => setForm((f) => ({ ...f, reminder: id }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-bark bg-bark text-white'
                      : 'border-warm-border bg-transparent text-muted-ink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Linked contact (optional)
          </label>
          <select
            value={form.linkedContactId}
            onChange={(e) => setForm((f) => ({ ...f, linkedContactId: e.target.value }))}
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bark/20"
          >
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Start
            </label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="w-full rounded-xl border border-warm-border bg-sand/40 px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              End
            </label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="w-full rounded-xl border border-warm-border bg-sand/40 px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Optional"
            className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
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
          disabled={!form.title.trim()}
          className="w-full rounded-xl bg-bark py-3.5 font-medium text-white transition-opacity disabled:opacity-40"
        >
          {isEditing ? 'Save Changes' : 'Add Event'}
        </button>

        {isEditing && (
          <button
            onClick={() => {
              if (event) {
                deleteEvent(event.id);
                onClose();
              }
            }}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
          >
            Delete Event
          </button>
        )}
      </div>
    </Sheet>
  );
}
