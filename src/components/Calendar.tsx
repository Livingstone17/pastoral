import { useState } from 'react';
import { useStore } from '../store';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  isSameDay,
  formatTime,
  getEventsForDay,
} from '../utils';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type CalendarEvent } from '../types';
import EventSheet from './EventSheet';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Calendar() {
  const { events } = useStore();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [sheet, setSheet] = useState<{ open: boolean; event?: CalendarEvent }>({ open: false });

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const dayEvents = getEventsForDay(events, selectedDate);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Month nav + grid */}
      <div className="safe-top shrink-0 px-5 pb-3">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-semibold text-ink">Calendar</h1>
          <button
            onClick={() => setSheet({ open: true })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bark shadow-sm"
            aria-label="Add event"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center text-muted-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <h2 className="font-serif text-lg font-medium text-ink">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center text-muted-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="mb-1 grid grid-cols-7">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="py-1 text-center text-xs font-medium text-muted-ink">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const cellDate = new Date(year, month, day);
            const isToday = isSameDay(cellDate, today);
            const isSelected = isSameDay(cellDate, selectedDate);
            const cellEvents = getEventsForDay(events, cellDate);

            return (
              <button
                key={i}
                className="flex flex-col items-center gap-0.5 py-1"
                onClick={() => setSelectedDate(cellDate)}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-bark font-semibold text-white'
                      : isToday
                        ? 'border border-bark/40 bg-sand font-medium text-bark'
                        : 'text-ink'
                  }`}
                >
                  {day}
                </div>
                <div className="flex gap-0.5 h-1.5">
                  {cellEvents.slice(0, 3).map((e, j) => (
                    <div
                      key={j}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: EVENT_TYPE_COLORS[e.type].dot }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-5 border-t border-warm-border" />

      {/* Selected day events */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-base font-medium text-ink">
            {isSameDay(selectedDate, today)
              ? 'Today'
              : selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
          </h3>
          <button
            className="text-xs font-medium text-bark"
            onClick={() => setSheet({ open: true })}
          >
            + Add
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-sm italic text-muted-ink">Nothing scheduled</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onTap={() => setSheet({ open: true, event })}
              />
            ))}
          </div>
        )}
      </div>

      <EventSheet
        open={sheet.open}
        event={sheet.event}
        defaultDate={selectedDate}
        onClose={() => setSheet({ open: false })}
      />
    </div>
  );
}

function EventCard({ event, onTap }: { event: CalendarEvent; onTap: () => void }) {
  const colors = EVENT_TYPE_COLORS[event.type];
  return (
    <button
      className="w-full rounded-2xl bg-white border border-warm-border px-4 py-3.5 shadow-sm text-left transition-all active:scale-[0.98]"
      onClick={onTap}
    >
      <div className="flex gap-3 items-start">
        <div
          className="mt-0.5 w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: colors.dot, minWidth: 3 }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium leading-snug text-ink">{event.title}</span>
            <span className="shrink-0 text-xs text-muted-ink">
              {formatTime(event.startTime)}
            </span>
          </div>
          {event.location && (
            <p className="mt-0.5 text-xs text-muted-ink">{event.location}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {event.notes && (
              <span className="text-xs text-muted-ink/70 truncate">{event.notes}</span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DDD5C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>
    </button>
  );
}
