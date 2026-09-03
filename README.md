# Pastoral

A progressive web app for church leaders — sermon preparation, pastoral care, Bible study, and congregation management in one place.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-FFCA28?logo=firebase)

---

## Features

### 🏠 Home Dashboard

- **Greeting & date** — personalized greeting with the current date
- **Quick Add** — one-tap buttons to create Events, Notes, or Sermons
- **Verse of the Day** — a curated daily verse with share/copy and deep-link to the Bible reader
- **Today's Schedule** — upcoming events for the current day
- **Coming Up** — next few events at a glance
- **Recent Notes** — last 3 notes with type badges, scripture chips, and privacy indicators

### 📅 Calendar

- **Event management** — create, edit, and delete calendar events
- **Event types** — Service, Wedding, Funeral, Hospital Visit, Counseling, Speaking, Meeting (each with distinct color coding)
- **Location & notes** — optional location and notes per event
- **Date/time picker** — start and end time selection
- **Linked contacts** — associate events with congregation members

### 📖 Bible Reader

- **5 translations** — KJV, NIV, ESV, WEB, YLT via jsDelivr CDN
- **66 books** — complete Bible with book selector, testament filtering, and chapter navigation
- **Strong's numbers** — tap superscript numbers (H for Hebrew, G for Greek) to see lexicon definitions from the BDBT dataset
- **Verse sharing** — share or copy any verse with reference via Web Share API or clipboard
- **Chapter copy** — copy entire chapters at once
- **Verse search** — search for specific verses within a chapter
- **Verse highlighting** — deep-link highlights a specific verse range
- **Loading & error states** — skeleton loading, retry on failure
- **Offline caching** — previously read chapters cached via service worker

### ✝️ Sermons & Messages

- **Sermon management** — create, edit, and delete sermon outlines
- **Status tracking** — Draft, Delivered, Archived with color-coded badges
- **Series grouping** — organize sermons into multi-part series
- **Scripture references** — attach Bible verses to each sermon
- **Themes & tags** — categorize sermons by topic
- **Outline editor** — rich text area for sermon notes with expand/collapse preview
- **Copy outline** — one-tap copy of the full outline
- **Voice memos** — record audio notes directly in the sermon editor using the MediaRecorder API; play back, re-record, or delete
- **Offline access** — all sermons saved locally, accessible without internet

### 📝 Notes

- **Note types** — Sermon Prep, Personal, Counseling, Study (each with distinct colors)
- **Counseling privacy** — counseling notes are automatically marked private
- **Read-only view** — tap any note on the Home screen to see full details
- **Edit mode** — transition from read-only to the full editor with one tap
- **Scripture references** — attach Bible verses with chips
- **Tags** — freeform tagging for organization
- **Private toggle** — mark any non-counseling note as private
- **Linked contacts** — associate notes with congregation members

### 👥 Contacts

- **Contact management** — add, edit, and delete contacts
- **Relationship types** — Congregant, Colleague, Venue (color-coded)
- **Search** — filter contacts by name
- **Contact details** — phone, email, notes, and tags per contact

### ⚙️ Settings

- **Dark Mode** — toggle between light and dark themes; warm dark palette with full token-based re-theming
- **Auto Dark Mode** — automatically switch at sunset/sunrise based on your geolocation (NOAA algorithm)
- **Text Size** — 4 levels (Small, Normal, Large, Extra Large) that scale the entire app via root font-size; persists across sessions

### 📚 Reading Plans

- **6 pre-built plans** — The Gospels, Psalms, Proverbs, New Testament, Genesis to 2 Samuel, Paul's Letters
- **Daily progress** — checkbox system with progress bar and percentage
- **Today indicator** — highlights the current day with a "Today" badge
- **Deep-link to Bible** — tapping a day opens the Bible reader at that chapter
- **Plan management** — start, continue, or abandon plans
- **Progress persistence** — all progress saved to localStorage

### 🌙 Offline & PWA

- **Service worker** — caches app shell, Bible CDN data, and Google Fonts for offline use
- **Web manifest** — installable as a home screen app on iOS and Android
- **Offline banner** — yellow banner appears when disconnected, disappears on reconnection
- **Local-first data** — all notes, events, sermons, and contacts saved to localStorage
- **Firebase sync** — when online and authenticated, data syncs to Firestore in real-time

### 🎨 Design

- **Native feel** — fixed bottom navbar, smooth sheet animations, tap feedback
- **Safe area support** — headers clear the status bar/notch in standalone PWA mode
- **Dynamic viewport** — bottom nav stays pinned using `100dvh` (no URL bar jump on mobile)
- **Typography** — Lora (serif) for headings, Outfit (sans-serif) for body text
- **Dark palette** — warm dark theme with parchment, sand, and bark tones
- **Responsive** — works on phones, tablets, and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.7 |
| Styling | Tailwind CSS v4 |
| Build | Vite 8 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Bible Data | jsDelivr CDN (static JSON dataset) |
| PWA | Service Worker + Web App Manifest |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BIBLE_DATA_URL=https://cdn.jsdelivr.net/gh/livingstone17/bible-api@main/data
```

The app runs in **demo mode** with seeded data when Firebase credentials are not configured.

---

## Project Structure

```
src/
├── components/          # React UI components
│   ├── Auth.tsx         # Login / signup screen
│   ├── Home.tsx         # Dashboard with Quick Add, VOTD, schedule, notes
│   ├── Calendar.tsx     # Event calendar view
│   ├── Bible.tsx        # Full Bible reader with Strong's
│   ├── BibleSheet.tsx   # Fullscreen Bible overlay
│   ├── Messages.tsx     # Sermon list with series view
│   ├── MessageSheet.tsx # Sermon editor with voice memo
│   ├── MessageViewSheet.tsx # Read-only sermon view
│   ├── Notes.tsx        # Notes list
│   ├── NoteSheet.tsx    # Note editor
│   ├── NoteViewSheet.tsx # Read-only note view
│   ├── Contacts.tsx     # Contact list with search
│   ├── ContactSheet.tsx # Contact editor
│   ├── More.tsx         # More menu (Notes, Contacts, Plans, Settings)
│   ├── Settings.tsx     # Appearance & text size settings
│   ├── ReadingPlans.tsx # Bible reading plans with progress
│   ├── VerseOfDay.tsx   # Daily verse widget
│   ├── StrongsSheet.tsx # Strong's definition popup
│   ├── VoiceMemoButton.tsx # Audio recording component
│   ├── ScriptureChip.tsx # Bible reference chip
│   ├── Sheet.tsx        # Reusable bottom sheet
│   └── BottomNav.tsx    # Tab bar (Home, Calendar, Bible, Sermons, More)
├── services/bible/      # Bible data service (fetch, cache, validate)
├── data/                # Static data (reading plans, verse of the day)
├── hooks/               # React hooks (auto dark mode, online status)
├── utils.ts             # Date formatting, greeting, helpers
├── types.ts             # TypeScript interfaces and color maps
├── store.tsx            # Global state (React Context + localStorage)
├── firebase.ts          # Firebase configuration
├── seed.ts              # Demo data for offline mode
├── index.css            # Tailwind imports, dark mode tokens, utilities
└── main.tsx             # App entry point
```

---

## License

Private — for internal use.
