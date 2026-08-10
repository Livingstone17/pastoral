import { useStore } from '../store';
import type { FontSize } from '../types';

const FONT_SIZE_OPTIONS: { id: FontSize; label: string; size: number }[] = [
  { id: 'small', label: 'Small', size: 15 },
  { id: 'normal', label: 'Normal', size: 16 },
  { id: 'large', label: 'Large', size: 18 },
  { id: 'xlarge', label: 'Extra Large', size: 20 },
];

interface Props {
  /** When set, shows a back button (More tab sub-screen). */
  onBack?: () => void;
}

export default function Settings({ onBack }: Props) {
  const { fontSize, setFontSize } = useStore();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Header */}
      <div className="safe-top shrink-0 px-5 pb-5">
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
          <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-ink">Text Size</p>
        <div className="rounded-2xl border border-warm-border bg-white p-2 shadow-sm">
          {FONT_SIZE_OPTIONS.map((opt) => {
            const active = fontSize === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                  active ? 'bg-sand/60' : 'hover:bg-sand/30'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className="font-serif font-semibold text-bark"
                    style={{ fontSize: opt.size }}
                  >
                    Aa
                  </span>
                  <span
                    className={`text-sm ${active ? 'font-medium text-ink' : 'text-muted-ink'}`}
                  >
                    {opt.label}
                  </span>
                </span>
                {active && (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5B3E2B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-ink">Applies to all text across the app.</p>

        {/* Live preview */}
        <div className="mt-6 rounded-2xl border border-warm-border bg-white p-5 shadow-sm">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-ink">
            Preview
          </p>
          <p className="font-serif text-lg font-semibold text-ink">Psalm 23:1</p>
          <p className="mt-1.5 leading-relaxed text-ink">
            The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures:
            he leadeth me beside the still waters.
          </p>
        </div>
      </div>
    </div>
  );
}
