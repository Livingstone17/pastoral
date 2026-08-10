import { useState, type ReactElement } from 'react';
import Notes from './Notes';
import Contacts from './Contacts';
import Settings from './Settings';

export type MoreSection = 'menu' | 'notes' | 'contacts' | 'settings';

interface Props {
  /** Section to show on mount (used for deep-links into the More tab). */
  initialSection?: MoreSection;
}

const MENU_ITEMS: {
  id: MoreSection;
  label: string;
  subtitle: string;
  icon: ReactElement;
}[] = [
  {
    id: 'notes',
    label: 'Notes',
    subtitle: 'Sermon prep, counseling, and study notes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'contacts',
    label: 'Contacts',
    subtitle: 'Congregants, colleagues, and venues',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    subtitle: 'Text size and app preferences',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function More({ initialSection = 'menu' }: Props) {
  const [section, setSection] = useState<MoreSection>(initialSection);

  if (section === 'notes') return <Notes onBack={() => setSection('menu')} />;
  if (section === 'contacts') return <Contacts onBack={() => setSection('menu')} />;
  if (section === 'settings') return <Settings onBack={() => setSection('menu')} />;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Header */}
      <div className="safe-top shrink-0 px-5 pb-5">
        <h1 className="font-serif text-2xl font-semibold text-ink">More</h1>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-2.5">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="flex items-center gap-3.5 rounded-2xl border border-warm-border bg-white px-4 py-4 shadow-sm text-left transition-all hover:border-bark/30 active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-bark">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{item.label}</span>
                <span className="block truncate text-xs text-muted-ink">{item.subtitle}</span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DDD5C9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
