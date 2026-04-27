import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebaseConfig.js';

// ─── Helper: store/update the ID token for backend calls ─────────────────────
async function syncToken(user) {
  if (!user) {
    localStorage.removeItem('nv_id_token');
    return;
  }
  const token = await user.getIdToken();
  localStorage.setItem('nv_id_token', token);
}

// ─── Helper: create user document in Firestore if it doesn't exist ────────────
async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      userId:    user.uid,
      email:     user.email,
      name:      user.displayName ?? '',
      plan:      'free',
      createdAt: serverTimestamp(),
    });
  }
}

// ─── Sign Up with Email / Password ───────────────────────────────────────────
export async function signUpWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  await ensureUserDoc(cred.user);
  await syncToken(cred.user);
  return cred.user;
}

// ─── Sign In with Email / Password ───────────────────────────────────────────
export async function signInWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await syncToken(cred.user);
  return cred.user;
}

// ─── Sign In with Google ──────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(cred.user);
  await syncToken(cred.user);
  return cred.user;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  localStorage.removeItem('nv_id_token');
}

// ─── Token refresh listener (call once in your App root) ─────────────────────
/**
 * Subscribe to auth state changes. Refreshes the stored ID token on each
 * change so backend requests always use a valid, fresh token.
 *
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    await syncToken(user);
    callback(user);
  });
}
