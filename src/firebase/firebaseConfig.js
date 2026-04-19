import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * All values come from Vite environment variables (VITE_ prefix).
 * Create a `.env.local` file at the project root and fill these in
 * from your Firebase Console → Project Settings → Your apps → SDK setup.
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config at startup
const REQUIRED_KEYS = [
  'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId',
];
REQUIRED_KEYS.forEach((key) => {
  if (!firebaseConfig[key]) {
    console.error(`[Firebase] Missing environment variable: VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`);
  }
});

// Prevent double-initialization (React StrictMode / HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Pre-configured Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;
