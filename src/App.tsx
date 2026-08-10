import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import Auth from './components/Auth';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Bible from './components/Bible';
import BibleSheet from './components/BibleSheet';
import Notes from './components/Notes';
import Messages from './components/Messages';
import BottomNav from './components/BottomNav';
import { subscribeToBibleRef } from './services/bible/bible.service';

type Tab = 'home' | 'calendar' | 'bible' | 'notes' | 'messages';

function AppInner() {
  const { user } = useStore();
  const [tab, setTab] = useState<Tab>('home');

  if (!user) return <Auth />;

  return (
    <div className="app-shell flex flex-col overflow-hidden bg-parchment">
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'home' && <Home onNavigate={setTab} />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'bible' && <Bible />}
        {tab === 'notes' && <Notes />}
        {tab === 'messages' && <Messages />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
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
