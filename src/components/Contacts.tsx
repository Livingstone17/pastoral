import { useState } from 'react';
import { useStore } from '../store';
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS, type Contact } from '../types';
import ContactSheet from './ContactSheet';

interface Props {
  /** When set, shows a back button (More tab sub-screen). */
  onBack?: () => void;
}

export default function Contacts({ onBack }: Props) {
  const { contacts } = useStore();
  const [search, setSearch] = useState('');
  const [sheet, setSheet] = useState<{ open: boolean; contact?: Contact }>({ open: false });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : contacts;

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
            <h1 className="font-serif text-2xl font-semibold text-ink">Contacts</h1>
          </div>
          <button
            onClick={() => setSheet({ open: true })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bark shadow-sm transition-colors hover:bg-bark/90"
            aria-label="Add contact"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
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
            placeholder="Search contacts..."
            className="w-full rounded-xl border border-warm-border bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-ink/60 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm italic text-muted-ink">
              {q ? 'No contacts match your search' : 'No contacts yet — tap + to add one'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((contact) => {
              const colors = RELATIONSHIP_COLORS[contact.relationshipType];
              return (
                <button
                  key={contact.id}
                  onClick={() => setSheet({ open: true, contact })}
                  className="flex items-center gap-3 rounded-2xl border border-warm-border bg-white px-4 py-3.5 shadow-sm text-left transition-all hover:border-bark/30 active:scale-[0.98]"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {contact.name}
                    </span>
                    <span className="block truncate text-xs text-muted-ink">
                      {contact.phone || contact.email || RELATIONSHIP_LABELS[contact.relationshipType]}
                    </span>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {RELATIONSHIP_LABELS[contact.relationshipType]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ContactSheet
        open={sheet.open}
        contact={sheet.contact}
        onClose={() => setSheet({ open: false })}
      />
    </div>
  );
}
