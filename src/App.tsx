import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import Auth from './components/Auth';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Bible from './components/Bible';
import BibleSheet from './components/BibleSheet';
import Messages from './components/Messages';
import More, { type MoreSection } from './components/More';
import BottomNav from './components/BottomNav';
import { subscribeToBibleRef } from './services/bible/bible.service';

type Tab = 'home' | 'calendar' | 'bible' | 'messages' | 'more';

function AppInner() {
  const { user } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [moreSection, setMoreSection] = useState<MoreSection>('menu');
  // Bumped to remount the More tab (back to its menu) when the nav "More"
  // is tapped again — native tab-reset behavior.
  const [moreReset, setMoreReset] = useState(0);

  if (!user) return <Auth />;

  function openMore(section: MoreSection) {
    setMoreSection(section);
    setMoreReset((n) => n + 1);
    setTab('more');
  }

  function handleTabChange(next: Tab) {
    if (next === 'more' && tab === 'more') {
      setMoreSection('menu');
      setMoreReset((n) => n + 1);
    }
    setTab(next);
  }

  // Home's "All notes →" shortcut deep-links into More > Notes.
  function handleHomeNavigate(next: 'home' | 'calendar' | 'notes' | 'messages') {
    if (next === 'notes') {
      openMore('notes');
    } else {
      handleTabChange(next as Tab);
    }
  }

  return (
    <div className="app-shell flex flex-col overflow-hidden bg-parchment">
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'home' && <Home onNavigate={handleHomeNavigate} />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'bible' && <Bible />}
        {tab === 'messages' && <Messages />}
        {tab === 'more' && <More key={moreReset} initialSection={moreSection} />}
      </div>
      <BottomNav active={tab} onChange={handleTabChange} />
      <BibleHost />
    </div>
  );
}

/** Opens the fullscreen Bible when a scripture chip is tapped anywhere. */
function BibleHost() {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => subscribeToBibleRef((ref) => setReference(ref)), []);

  return (
    <BibleSheet open={!!reference} reference={reference} onClose={() => setReference(null)} />
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
