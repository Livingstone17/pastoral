import { openBibleAt } from '../services/bible/bible.service';

interface Props {
  reference: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function ScriptureChip({ reference, onRemove, size = 'sm' }: Props) {
  const chipClass = `inline-flex items-center gap-1 rounded-full border font-sans font-medium ${
    size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
  }`;
  const chipStyle = {
    backgroundColor: '#FDF6E3',
    borderColor: '#C8A84B',
    color: '#7A5A10',
  };

  const icon = (
    <svg
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      className="opacity-60 shrink-0"
    >
      <path
        d="M4.5 1v8M1 4.5h7"
        stroke="#7A5A10"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );

  // Inside forms the chip is a removable tag.
  if (onRemove) {
    return (
      <span className={chipClass} style={chipStyle}>
        {icon}
        {reference}
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${reference}`}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="#7A5A10"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </span>
    );
  }

  // Everywhere else the chip opens the Bible at the passage.
  return (
    <button
      type="button"
      onClick={() => openBibleAt(reference)}
      title={`Read ${reference} in the Bible`}
      className={`${chipClass} cursor-pointer transition-all hover:brightness-95 active:scale-95 focus:outline-none focus:ring-2 focus:ring-bark/20`}
      style={chipStyle}
    >
      {icon}
      {reference}
    </button>
  );
}
