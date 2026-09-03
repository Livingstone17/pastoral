import { useState, useEffect } from 'react';
import { getVerseOfTheDay } from '../data/readingPlans';

interface Props {
  onOpenBible: (ref: string) => void;
}

export default function VerseOfDay({ onOpenBible }: Props) {
  const [verse] = useState(() => getVerseOfTheDay());
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `${verse.text} — ${verse.ref}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl border border-bark/20 bg-gradient-to-br from-bark/5 to-transparent p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-bark">Verse of the Day</span>
        <button
          onClick={handleShare}
          className="flex h-7 w-7 items-center justify-center rounded-full text-bark-light transition-colors hover:bg-bark/10 hover:text-bark"
          title="Share verse"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      <p className="mb-3 font-serif text-base leading-relaxed text-ink italic">
        &ldquo;{verse.text}&rdquo;
      </p>

      <button
        onClick={() => onOpenBible(verse.ref)}
        className="text-sm font-semibold text-bark hover:text-bark-light transition-colors"
      >
        {verse.ref} →
      </button>

      {copied && (
        <p className="mt-1.5 text-xs text-bark-light">Copied to clipboard</p>
      )}
    </div>
  );
}
