import { useState } from 'react';
import { useStore } from '../store';
import { getEventsForDay, formatTime, getGreeting, getFirstName, formatShortDate } from '../utils';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  NOTE_TYPE_LABELS,
  NOTE_TYPE_COLORS,
} from '../types';
import type { Note } from '../types';
import EventSheet from './EventSheet';
import NoteSheet from './NoteSheet';
import MessageSheet from './MessageSheet';
import ScriptureChip from './ScriptureChip';

type Tab = 'home' | 'calendar' | 'notes' | 'messages';

interface Props {
  onNavigate: (tab: Tab) => void;
}

export default function Home({ onNavigate }: Props) {
  const { user, events, notes, messages, logout } = useStore();
  const today = new Date();
  const todayEvents = getEventsForDay(events, today);
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  const upcomingEvents = events
    .filter((e) => new Date(e.startTime) > today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const [eventSheet, setEventSheet] = useState(false);
  const [noteSheet, setNoteSheet] = useState(false);
  const [messageSheet, setMessageSheet] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="safe-top px-5 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-ink">
                {getGreeting()},{' '}
                <span className="font-medium text-bark-light">
                  {user ? getFirstName(user.name) : ''}
                </span>
              </p>
              <h1 className="mt-0.5 font-serif text-2xl font-semibold text-ink">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h1>
            </div>
            <button
              onClick={logout}
              className="mt-1 text-xs text-muted-ink/60 underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mb-2 px-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-ink">
            Quick Add
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: 'Event',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                action: () => setEventSheet(true),
              },
              {
                label: 'Note',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
                action: () => setNoteSheet(true),
              },
              {
                label: 'Sermon',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                ),
                action: () => setMessageSheet(true),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-2 rounded-2xl border border-warm-border bg-white px-3 py-4 text-muted-ink shadow-sm transition-all active:scale-95 hover:border-bark/30 hover:text-bark"
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <section className="mt-6 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-ink">Today</h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-medium text-bark-light"
            >
              Calendar →
            </button>
          </div>

          {todayEvents.length === 0 ? (
            <div className="rounded-2xl border border-warm-border bg-white px-5 py-6 text-center">
              <p className="text-sm italic text-muted-ink">Nothing scheduled today</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayEvents.map((event) => {
                const colors = EVENT_TYPE_COLORS[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm border border-warm-border"
                  >
                    <div
                      className="mt-1 w-1 shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: colors.dot, minWidth: 3 }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug text-ink">
                          {event.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-ink">
                          {formatTime(event.startTime)}
                        </span>
                      </div>
                      {event.location && (
                        <p className="mt-0.5 text-xs text-muted-ink">{event.location}</p>
                      )}
                      <span
                        className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {EVENT_TYPE_LABELS[event.type]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <section className="mt-6 px-5">
            <h2 className="mb-3 font-serif text-base font-semibold text-ink">Coming Up</h2>
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((event) => {
                const colors = EVENT_TYPE_COLORS[event.type];
                const d = new Date(event.startTime);
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={event.id} className="flex items-center gap-3 py-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: colors.dot }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-ink">{event.title}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-ink">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Notes */}
        <section className="mt-6 px-5 pb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-ink">Recent Notes</h2>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs font-medium text-bark-light"
            >
              All notes →
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="rounded-2xl border border-warm-border bg-white px-5 py-6 text-center">
              <p className="text-sm italic text-muted-ink">No notes yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentNotes.map((note) => (
                <NotePreviewCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </section>

      </div>

      <EventSheet open={eventSheet} onClose={() => setEventSheet(false)} />
      <NoteSheet open={noteSheet} onClose={() => setNoteSheet(false)} />
      <MessageSheet open={messageSheet} onClose={() => setMessageSheet(false)} />
    </div>
  );
}

function NotePreviewCard({ note }: { note: Note }) {
  const colors = NOTE_TYPE_COLORS[note.type];
  const { darkMode } = useStore();
  return (
    <div
      className="rounded-2xl border border-warm-border bg-white px-4 py-3.5 shadow-sm"
      style={
        note.type === 'counseling'
          ? { backgroundColor: darkMode ? '#2A2333' : '#F8F4FC' }
          : {}
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {note.isPrivate && (
            <svg width="11" height="13" viewBox="0 0 12 14" fill="none" stroke="#7A62AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="6" width="10" height="8" rx="1.5" />
              <path d="M4 6V4a2 2 0 014 0v2" />
            </svg>
          )}
          <span className="text-sm font-medium text-ink">{note.title}</span>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {NOTE_TYPE_LABELS[note.type]}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-ink">
        {note.body}
      </p>
      {note.scriptureRefs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.scriptureRefs.slice(0, 2).map((ref) => (
            <ScriptureChip key={ref} reference={ref} />
          ))}
          {note.scriptureRefs.length > 2 && (
            <span className="text-xs text-muted-ink">+{note.scriptureRefs.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
