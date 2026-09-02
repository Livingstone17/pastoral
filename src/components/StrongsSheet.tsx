import { useEffect, useState } from 'react';
import Sheet from './Sheet';
import { getStrongs } from '../services/bible/bible.service';
import type { StrongsEntry } from '../services/bible/bible.types';

interface Props {
  open: boolean;
  strongsNumber: string | null;
  onClose: () => void;
}

/**
 * Allowlist-based HTML sanitizer for Strong's definition content.
 * Only permits safe tags: b, i, p, ol, li, a (with href limited to http/https).
 * Strips everything else to prevent XSS from compromised upstream data.
 */
function sanitizeStrongsHtml(html: string): string {
  const allowed = /^(b|i|p|ol|li|a|br)$/i;
  const safeAttrs = /^(href|class)$/i;

  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tag: string, attrs: string) => {
    if (!allowed.test(tag)) return '';

    // For closing tags, strip attributes
    if (match[1] === '/') return `</${tag}>`;

    // For <a> tags, only allow http/https hrefs
    if (tag.toLowerCase() === 'a') {
      const hrefMatch = attrs.match(/href="([^"]*)"/i);
      const href = hrefMatch?.[1] ?? '';
      if (!/^https?:\/\//.test(href)) return '';
      return `<a href="${href.replace(/"/g, '&quot;')}">`;
    }

    // For other allowed tags, strip all attributes
    return `<${tag}>`;
  });
}

export default function StrongsSheet({ open, strongsNumber, onClose }: Props) {
  const [entry, setEntry] = useState<StrongsEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !strongsNumber) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    setEntry(null);
    getStrongs(strongsNumber)
      .then((e) => {
        if (!cancelled) {
          setEntry(e);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load this entry.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, strongsNumber]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Strong's ${strongsNumber ?? ''}`}
      maxHeight="50vh"
    >
      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          <div className="h-6 w-24 animate-pulse rounded-lg bg-sand" />
          <div className="h-3 w-full animate-pulse rounded bg-sand" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-sand" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-sand" />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-ink">{error}</p>
        </div>
      ) : !entry ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-ink">
            This Strong's entry isn't in the dataset yet.
          </p>
          <p className="mt-1 text-xs text-muted-ink/70">
            Add <span className="font-mono">strongs/BDBT/{strongsNumber}.json</span> to the
            bible-api repo and it will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-2">
          {entry.lexeme && (
            <p className="font-serif text-2xl font-semibold text-ink">{entry.lexeme}</p>
          )}

          {(entry.transliteration || entry.pronunciation) && (
            <div className="flex flex-col gap-0.5 rounded-xl bg-sand/50 px-3.5 py-2.5 text-sm text-muted-ink">
              {entry.transliteration && (
                <p>
                  <span className="font-medium text-ink">Transliteration:</span>{' '}
                  {entry.transliteration}
                </p>
              )}
              {entry.pronunciation && (
                <p>
                  <span className="font-medium text-ink">Pronunciation:</span> {entry.pronunciation}
                </p>
              )}
            </div>
          )}

          {entry.short_definition && (
            <p className="text-sm leading-relaxed text-ink">{entry.short_definition}</p>
          )}

          {entry.definition && (
            <div
              className="bible-strongs-html text-sm leading-relaxed text-ink"
              dangerouslySetInnerHTML={{ __html: sanitizeStrongsHtml(entry.definition) }}
            />
          )}
        </div>
      )}
    </Sheet>
  );
}
