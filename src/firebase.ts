import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Required environment variables for Firebase. If any are missing, the app
// runs in demo mode with local-only data.
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_ENV_VARS.filter((k) => !import.meta.env[k]);

/**
 * Whether the app is running in demo mode (no real Firebase config).
 * In demo mode, all data is local-only and auth is bypassed.
 */
export const isDemoMode = missing.length > 0;

if (isDemoMode && import.meta.env.DEV) {
  console.warn(
    `[Pastoral] Running in demo mode — missing env var${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
    'Copy .env.example to .env and fill in your Firebase credentials.',
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pastoral-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pastoral-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pastoral-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
