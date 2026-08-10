import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import Auth from './components/Auth';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Notes from './components/Notes';
import Messages from './components/Messages';
import BottomNav from './components/BottomNav';

type Tab = 'home' | 'calendar' | 'notes' | 'messages';

function AppInner() {
  const { user } = useStore();
  const [tab, setTab] = useState<Tab>('home');

  if (!user) return <Auth />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-parchment">
      <div className="flex-1 overflow-hidden">
        {tab === 'home' && <Home onNavigate={setTab} />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'notes' && <Notes />}
        {tab === 'messages' && <Messages />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
