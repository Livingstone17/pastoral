import { useState } from 'react';
import { useStore } from '../store';
import { type Message, type MessageStatus, type Series } from '../types';
import ScriptureChip from './ScriptureChip';
import MessageSheet from './MessageSheet';
import MessageViewSheet from './MessageViewSheet';

const STATUS_FILTERS: { id: MessageStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Messages' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'draft', label: 'Drafts' },
  { id: 'archived', label: 'Archived' },
];

export default function Messages() {
  const { messages, series } = useStore();
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'series'>('list');

  // Sheet states
  const [viewSheet, setViewSheet] = useState<{ open: boolean; message?: Message }>({ open: false });
  const [editSheet, setEditSheet] = useState<{ open: boolean; message?: Message }>({ open: false });

  const [expandedOutlineId, setExpandedOutlineId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter messages based on status and search query
  const filteredMessages = messages
    .filter((m) => filter === 'all' || m.status === filter)
    .filter((m) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const seriesTitle = series.find((s) => s.id === m.seriesId)?.title || '';
      return (
        m.title.toLowerCase().includes(q) ||
        m.outline.toLowerCase().includes(q) ||
        m.scriptureRefs.some((r) => r.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        seriesTitle.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.dateDelivered && b.dateDelivered) {
        return new Date(b.dateDelivered).getTime() - new Date(a.dateDelivered).getTime();
      }
      if (a.dateDelivered) return -1;
      if (b.dateDelivered) return 1;
      return 0;
    });

  const deliveredCount = messages.filter((m) => m.status === 'delivered').length;
  const draftCount = messages.filter((m) => m.status === 'draft').length;

  const handleCopyOutline = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleOutline = (id: string) => {
    setExpandedOutlineId((prev) => (prev === id ? null : id));
  };

  const handleViewMessage = (msg: Message) => {
    setViewSheet({ open: true, message: msg });
  };

  const handleEditMessage = (msg: Message) => {
    setViewSheet({ open: false });
    setEditSheet({ open: true, message: msg });
  };

  const handleCreateNew = () => {
    setEditSheet({ open: true, message: undefined });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      {/* Header */}
      <div className="safe-top shrink-0 px-5 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Sermons & Messages</h1>
            <p className="mt-0.5 text-xs text-muted-ink">
              {deliveredCount} delivered · {draftCount} draft{draftCount === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bark shadow-sm hover:bg-bark/90 transition-colors"
            aria-label="New sermon message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
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
            placeholder="Search sermons, scriptures, outlines..."
            className="w-full rounded-xl border border-warm-border bg-white py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted-ink/60 focus:outline-none focus:ring-2 focus:ring-bark/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-ink hover:text-ink text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills & View Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {STATUS_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'border-bark bg-bark text-white'
                      : 'border-warm-border bg-white text-muted-ink hover:border-bark/30'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 rounded-lg border border-warm-border bg-sand/50 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                viewMode === 'list' ? 'bg-white text-bark shadow-xs' : 'text-muted-ink'
              }`}
              title="List View"
            >
              List
            </button>
            <button
              onClick={() => setViewMode('series')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                viewMode === 'series' ? 'bg-white text-bark shadow-xs' : 'text-muted-ink'
              }`}
              title="Series View"
            >
              Series
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filteredMessages.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand text-bark-light">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink">No sermons found</p>
            <p className="mt-1 text-xs text-muted-ink">
              {search
                ? 'Try adjusting your search terms or filter.'
                : 'Tap "+" in the top right to draft a new sermon message.'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-3.5">
            {filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                seriesList={series}
                isExpanded={expandedOutlineId === msg.id}
                isCopied={copiedId === msg.id}
                onSelect={() => handleViewMessage(msg)}
                onToggleExpand={() => toggleOutline(msg.id)}
                onCopyOutline={() => handleCopyOutline(msg.id, msg.outline)}
              />
            ))}
          </div>
        ) : (
          <SeriesView
            messages={filteredMessages}
            seriesList={series}
            expandedOutlineId={expandedOutlineId}
            copiedId={copiedId}
            onSelectMessage={handleViewMessage}
            onToggleExpand={toggleOutline}
            onCopyOutline={handleCopyOutline}
          />
        )}
      </div>

      {/* Read-Only Message View Sheet */}
      <MessageViewSheet
        open={viewSheet.open}
        message={viewSheet.message}
        onClose={() => setViewSheet({ open: false })}
        onEdit={handleEditMessage}
      />

      {/* Message Sheet for Compose / Edit */}
      <MessageSheet
        open={editSheet.open}
        message={editSheet.message}
        onClose={() => setEditSheet({ open: false })}
      />
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  seriesList: Series[];
  isExpanded: boolean;
  isCopied: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onCopyOutline: () => void;
}

function MessageCard({
  message,
  seriesList,
  isExpanded,
  isCopied,
  onSelect,
  onToggleExpand,
  onCopyOutline,
}: MessageCardProps) {
  const linkedSeries = seriesList.find((s) => s.id === message.seriesId);

  const formattedDate = message.dateDelivered
    ? new Date(message.dateDelivered + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      onClick={onSelect}
      className="w-full rounded-2xl border border-warm-border bg-white p-4 shadow-sm transition-all hover:border-bark/40 cursor-pointer active:scale-[0.99]"
    >
      {/* Card Header: Title & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Status Badge */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase ${
                message.status === 'delivered'
                  ? 'bg-bark/10 text-bark'
                  : message.status === 'draft'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sand text-muted-ink'
              }`}
            >
              {message.status}
            </span>

            {/* Date Delivered */}
            {formattedDate && (
              <span className="text-xs text-muted-ink flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formattedDate}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg font-semibold text-ink leading-snug hover:text-bark transition-colors">
            {message.title}
          </h3>
        </div>

        {/* View Indicator Chevron */}
        <div className="shrink-0 text-muted-ink pt-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Linked Series Tag */}
      {linkedSeries && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-bark-light font-medium bg-sand/50 rounded-lg px-2.5 py-1 w-fit">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Series: {linkedSeries.title}</span>
        </div>
      )}

      {/* Scripture References */}
      {message.scriptureRefs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {message.scriptureRefs.map((ref) => (
            <ScriptureChip key={ref} reference={ref} />
          ))}
        </div>
      )}

      {/* Tags */}
      {message.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {message.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sand px-2 py-0.5 text-[0.625rem] text-muted-ink">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Outline Section */}
      {message.outline && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3.5 rounded-xl border border-warm-border/60 bg-parchment/60 p-3"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-warm-border/40">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-ink">
              Outline Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onCopyOutline}
                className="text-[0.6875rem] font-medium text-bark-light hover:text-bark flex items-center gap-1"
              >
                {isCopied ? (
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={onToggleExpand}
                className="text-[0.6875rem] font-medium text-bark-light hover:text-bark"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          <pre
            className={`mt-2 font-sans text-xs leading-relaxed text-ink whitespace-pre-wrap ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            {message.outline}
          </pre>
        </div>
      )}
    </div>
  );
}

interface SeriesViewProps {
  messages: Message[];
  seriesList: Series[];
  expandedOutlineId: string | null;
  copiedId: string | null;
  onSelectMessage: (msg: Message) => void;
  onToggleExpand: (id: string) => void;
  onCopyOutline: (id: string, text: string) => void;
}

function SeriesView({
  messages,
  seriesList,
  expandedOutlineId,
  copiedId,
  onSelectMessage,
  onToggleExpand,
  onCopyOutline,
}: SeriesViewProps) {
  const seriesGroups = seriesList
    .map((s) => {
      const seriesMsgs = messages.filter((m) => m.seriesId === s.id);
      return { series: s, messages: seriesMsgs };
    })
    .filter((group) => group.messages.length > 0);

  const standaloneMessages = messages.filter((m) => !m.seriesId);

  return (
    <div className="flex flex-col gap-6">
      {seriesGroups.map(({ series, messages: sMsgs }) => (
        <div key={series.id} className="rounded-2xl border border-warm-border bg-white p-4.5 shadow-sm">
          <div className="mb-3.5 pb-3 border-b border-warm-border/60">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-bark">{series.title}</h2>
              <span className="text-xs font-medium text-muted-ink">
                {sMsgs.length} message{sMsgs.length === 1 ? '' : 's'}
              </span>
            </div>
            {series.description && (
              <p className="mt-1 text-xs leading-relaxed text-muted-ink">{series.description}</p>
            )}
            <p className="mt-1 text-[0.6875rem] text-bark-light font-medium">
              {series.startDate} {series.endDate ? `– ${series.endDate}` : ''}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {sMsgs.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                seriesList={seriesList}
                isExpanded={expandedOutlineId === msg.id}
                isCopied={copiedId === msg.id}
                onSelect={() => onSelectMessage(msg)}
                onToggleExpand={() => onToggleExpand(msg.id)}
                onCopyOutline={() => onCopyOutline(msg.id, msg.outline)}
              />
            ))}
          </div>
        </div>
      ))}

      {standaloneMessages.length > 0 && (
        <div className="rounded-2xl border border-warm-border bg-white/70 p-4.5">
          <div className="mb-3.5 pb-2 border-b border-warm-border/60">
            <h2 className="font-serif text-base font-semibold text-ink">Standalone Messages</h2>
            <p className="text-xs text-muted-ink">Messages not assigned to a sermon series</p>
          </div>

          <div className="flex flex-col gap-3">
            {standaloneMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                seriesList={seriesList}
                isExpanded={expandedOutlineId === msg.id}
                isCopied={copiedId === msg.id}
                onSelect={() => onSelectMessage(msg)}
                onToggleExpand={() => onToggleExpand(msg.id)}
                onCopyOutline={() => onCopyOutline(msg.id, msg.outline)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
