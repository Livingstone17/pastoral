import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, CalendarEvent, Note, Message, Series, Contact, FontSize } from './types';
import { SEED_EVENTS, SEED_NOTES, SEED_MESSAGES, SEED_SERIES, SEED_CONTACTS } from './seed';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function cleanDoc<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

interface StoreCtx {
  user: User | null;
  events: CalendarEvent[];
  notes: Note[];
  messages: Message[];
  series: Series[];
  contacts: Contact[];
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (e: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (n: Note) => void;
  deleteNote: (id: string) => void;
  addMessage: (m: Omit<Message, 'id'>) => void;
  updateMessage: (m: Message) => void;
  deleteMessage: (id: string) => void;
  addContact: (c: Omit<Contact, 'id'>) => void;
  updateContact: (c: Contact) => void;
  deleteContact: (id: string) => void;
}

// Apply the saved text-size preference before first paint (module scope runs
// before React renders) so a reload doesn't flash the default font size.
const initialFontSize = load<FontSize>('shepherd_font_size', 'normal');
if (typeof document !== 'undefined') {
  document.documentElement.classList.add(`fs-${initialFontSize}`);
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load('shepherd_user', null));
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    load('shepherd_events', SEED_EVENTS),
  );
  const [notes, setNotes] = useState<Note[]>(() => load('shepherd_notes', SEED_NOTES));
  const [messages, setMessages] = useState<Message[]>(() =>
    load('shepherd_messages', SEED_MESSAGES),
  );
  const [series, setSeries] = useState<Series[]>(() => load('shepherd_series', SEED_SERIES));
  const [contacts, setContacts] = useState<Contact[]>(() =>
    load('shepherd_contacts', SEED_CONTACTS),
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(initialFontSize);

  // Firebase Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const pastorUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Pastor',
          email: fbUser.email || '',
          role: 'Senior Pastor',
          denomination: 'Presbyterian',
          preferredTranslation: 'ESV',
        };
        setUser(pastorUser);
      }
    });
    return () => unsub();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    save('shepherd_user', user);
  }, [user]);
  useEffect(() => {
    save('shepherd_events', events);
  }, [events]);
  useEffect(() => {
    save('shepherd_notes', notes);
  }, [notes]);
  useEffect(() => {
    save('shepherd_messages', messages);
  }, [messages]);

  // Text-size preference: persist on this device and apply to the root
  // element so every rem-based text utility scales app-wide.
  useEffect(() => {
    save('shepherd_font_size', fontSize);
    const el = document.documentElement;
    el.classList.remove('fs-small', 'fs-normal', 'fs-large', 'fs-xlarge');
    el.classList.add(`fs-${fontSize}`);
  }, [fontSize]);

  // Sync Firestore collections when authenticated
  useEffect(() => {
    if (!user) return;

    // Demo mode keeps its seeded data. Only real Firebase accounts
    // reset local state and subscribe to their own Firestore data.
    if (auth.app.options.apiKey === 'demo-api-key') return;

    // Reset stub data for authenticated user
    setEvents([]);
    setNotes([]);
    setMessages([]);
    setSeries([]);
    setContacts([]);

    try {
      const eventsQ = query(collection(db, 'events'), where('userId', '==', user.id));
      const unsubEvents = onSnapshot(
        eventsQ,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: CalendarEvent[] = snap.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ ...(d.data() as CalendarEvent), id: d.id }),
          );
          setEvents(list);
        },
        () => { },
      );

      const notesQ = query(collection(db, 'notes'), where('userId', '==', user.id));
      const unsubNotes = onSnapshot(
        notesQ,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: Note[] = snap.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ ...(d.data() as Note), id: d.id }),
          );
          setNotes(list);
        },
        () => { },
      );

      const messagesQ = query(collection(db, 'messages'), where('userId', '==', user.id));
      const unsubMessages = onSnapshot(
        messagesQ,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: Message[] = snap.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ ...(d.data() as Message), id: d.id }),
          );
          setMessages(list);
        },
        () => { },
      );

      const seriesQ = query(collection(db, 'series'), where('userId', '==', user.id));
      const unsubSeries = onSnapshot(
        seriesQ,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: Series[] = snap.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ ...(d.data() as Series), id: d.id }),
          );
          setSeries(list);
        },
        () => { },
      );

      const contactsQ = query(collection(db, 'contacts'), where('userId', '==', user.id));
      const unsubContacts = onSnapshot(
        contactsQ,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: Contact[] = snap.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ ...(d.data() as Contact), id: d.id }),
          );
          setContacts(list);
        },
        () => { },
      );

      return () => {
        unsubEvents();
        unsubNotes();
        unsubMessages();
        unsubSeries();
        unsubContacts();
      };
    } catch {
      // Fallback to local state if Firestore is unavailable
    }
  }, [user?.id]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (auth.app.options.apiKey !== 'demo-api-key') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const demoUser: User = {
          id: res.user.uid,
          name: res.user.displayName || 'Pastor',
          email: res.user.email || email,
          role: 'Senior Pastor',
          denomination: 'Presbyterian',
          preferredTranslation: 'ESV',
        };
        setUser(demoUser);
        return true;
      }
    } catch (e) {
      console.warn('Firebase login fallback to demo login', e);
    }

    const demoUser: User = {
      id: 'u1',
      name: 'Pastor David Kim',
      email,
      role: 'Senior Pastor',
      denomination: 'Presbyterian',
      preferredTranslation: 'ESV',
    };
    setUser(demoUser);
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    // Clear stub data immediately on new user signup
    setEvents([]);
    setNotes([]);
    setMessages([]);
    setSeries([]);
    setContacts([]);

    try {
      if (auth.app.options.apiKey !== 'demo-api-key') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
          id: res.user.uid,
          name,
          email,
          role: 'Pastor',
          denomination: '',
          preferredTranslation: 'NIV',
        };
        await setDoc(doc(db, 'users', res.user.uid), cleanDoc(newUser));
        setUser(newUser);
        return;
      }
    } catch (e) {
      console.warn('Firebase signup fallback to local', e);
    }

    const newUser: User = {
      id: uid(),
      name,
      email,
      role: 'Pastor',
      denomination: '',
      preferredTranslation: 'NIV',
    };
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    // Restore stub data for demo mode when logged out
    localStorage.removeItem('shepherd_user');
    localStorage.removeItem('shepherd_events');
    localStorage.removeItem('shepherd_notes');
    localStorage.removeItem('shepherd_messages');
    setUser(null);
    setEvents(SEED_EVENTS);
    setNotes(SEED_NOTES);
    setMessages(SEED_MESSAGES);
    setSeries(SEED_SERIES);
    setContacts(SEED_CONTACTS);
  };

  const addEvent = (e: Omit<CalendarEvent, 'id'>) => {
    const newId = uid();
    const item = { ...e, id: newId };
    setEvents((prev) => [...prev, item]);
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'events', newId), cleanDoc({ ...item, userId: user.id })).catch((err) => {
        console.error('Firestore addEvent error:', err);
      });
    }
  };

  const updateEvent = (e: CalendarEvent) => {
    setEvents((prev) => prev.map((x) => (x.id === e.id ? e : x)));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'events', e.id), cleanDoc({ ...e, userId: user.id }), { merge: true }).catch(
        (err) => {
          console.error('Firestore updateEvent error:', err);
        },
      );
    }
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((x) => x.id !== id));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      deleteDoc(doc(db, 'events', id)).catch(() => { });
    }
  };

  const addNote = (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newId = uid();
    const item = { ...n, id: newId, createdAt: now, updatedAt: now };
    setNotes((prev) => [...prev, item]);
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'notes', newId), cleanDoc({ ...item, userId: user.id })).catch((err) => {
        console.error('Firestore addNote error:', err);
      });
    }
  };

  const updateNote = (n: Note) => {
    const updated = { ...n, updatedAt: new Date().toISOString() };
    setNotes((prev) => prev.map((x) => (x.id === n.id ? updated : x)));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'notes', n.id), cleanDoc({ ...updated, userId: user.id }), { merge: true }).catch(
        (err) => {
          console.error('Firestore updateNote error:', err);
        },
      );
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((x) => x.id !== id));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      deleteDoc(doc(db, 'notes', id)).catch(() => { });
    }
  };

  const addMessage = (m: Omit<Message, 'id'>) => {
    const newId = uid();
    const item = { ...m, id: newId };
    setMessages((prev) => [...prev, item]);
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'messages', newId), cleanDoc({ ...item, userId: user.id })).catch((err) => {
        console.error('Firestore addMessage error:', err);
      });
    }
  };

  const updateMessage = (m: Message) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'messages', m.id), cleanDoc({ ...m, userId: user.id }), { merge: true }).catch(
        (err) => {
          console.error('Firestore updateMessage error:', err);
        },
      );
    }
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((x) => x.id !== id));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      deleteDoc(doc(db, 'messages', id)).catch(() => { });
    }
  };

  const addContact = (c: Omit<Contact, 'id'>) => {
    const newId = uid();
    const item = { ...c, id: newId };
    setContacts((prev) => [...prev, item]);
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'contacts', newId), cleanDoc({ ...item, userId: user.id })).catch((err) => {
        console.error('Firestore addContact error:', err);
      });
    }
  };

  const updateContact = (c: Contact) => {
    setContacts((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      setDoc(doc(db, 'contacts', c.id), cleanDoc({ ...c, userId: user.id }), { merge: true }).catch(
        (err) => {
          console.error('Firestore updateContact error:', err);
        },
      );
    }
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((x) => x.id !== id));
    if (user && auth.app.options.apiKey !== 'demo-api-key') {
      deleteDoc(doc(db, 'contacts', id)).catch(() => { });
    }
  };

  const setFontSize = (size: FontSize) => setFontSizeState(size);

  return (
    <Ctx.Provider
      value={{
        user,
        events,
        notes,
        messages,
        series,
        contacts,
        fontSize,
        setFontSize,
        login,
        signup,
        logout,
        addEvent,
        updateEvent,
        deleteEvent,
        addNote,
        updateNote,
        deleteNote,
        addMessage,
        updateMessage,
        deleteMessage,
        addContact,
        updateContact,
        deleteContact,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
