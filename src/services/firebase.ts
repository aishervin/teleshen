import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut,
  onAuthStateChanged,
  getRedirectResult,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface GoogleAuthResult {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  role: 'owner' | 'member';
  isOwner: boolean;
}

/**
 * Fast, non-blocking Google Sign-In with official Google OAuth Popup.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  const result = await signInWithPopup(auth, googleProvider);
  return processGoogleUser(result.user);
}

/**
 * Global Real-Time Auth State Listener.
 * Fires immediately when user is authenticated by Firebase.
 */
export function subscribeToAuth(callback: (user: GoogleAuthResult | null) => void) {
  // Check redirect result for mobile page return
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        const processed = processGoogleUser(result.user);
        callback(processed);
      }
    })
    .catch(() => {});

  // Real-time auth listener for popups and persistent sessions
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const processed = processGoogleUser(user);
      callback(processed);
    }
  });
}

/**
 * Pure synchronous user processing - never blocks or hangs the UI thread.
 */
export function processGoogleUser(rawUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): GoogleAuthResult {
  const isOwner = (rawUser.email?.toLowerCase() === 'shervin00325@gmail.com');
  
  let rawName = rawUser.email ? rawUser.email.split('@')[0] : (rawUser.displayName || 'user');
  rawName = rawName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  if (rawName.length < 3) rawName = `user_${rawName}`;

  const username = isOwner ? 'shervin' : rawName;
  const displayName = isOwner ? 'TELESHΞN™ owner' : (rawUser.displayName || username);
  const role: 'owner' | 'member' = isOwner ? 'owner' : 'member';
  const bio = isOwner ? '👑 Founder & Lead Operator @ TELESHΞN™' : 'Google Verified Member @ TELESHΞN™';
  const avatar = rawUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

  const result: GoogleAuthResult = {
    uid: rawUser.uid,
    email: rawUser.email,
    displayName,
    photoURL: rawUser.photoURL,
    username,
    name: displayName,
    avatar,
    bio,
    role,
    isOwner,
  };

  // Background non-blocking sync to Firestore
  try {
    const userDocRef = doc(db, 'users', rawUser.uid);
    setDoc(userDocRef, {
      uid: rawUser.uid,
      username,
      name: displayName,
      email: rawUser.email || '',
      avatar,
      bio,
      role,
      isOwner,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(() => {});
  } catch {
    // ignore
  }

  return result;
}

export { fbSignOut, onAuthStateChanged, type FirebaseUser };
