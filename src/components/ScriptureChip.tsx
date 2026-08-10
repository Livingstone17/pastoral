interface Props {
  reference: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function ScriptureChip({ reference, onRemove, size = 'sm' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-sans font-medium ${
        size === 'md'
          ? 'px-3 py-1 text-sm'
          : 'px-2.5 py-0.5 text-xs'
      }`}
      style={{
        backgroundColor: '#FDF6E3',
        borderColor: '#C8A84B',
        color: '#7A5A10',
      }}
    >
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
      {reference}
      {onRemove && (
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
      )}
    </span>
  );
}
