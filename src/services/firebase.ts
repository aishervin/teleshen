import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
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
 * Standard Firebase Google Sign-In with official Google OAuth Popup window
 * and seamless mobile redirect fallback.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return processGoogleUser(result.user);
  } catch (err: unknown) {
    const errObj = err as { code?: string; message?: string };
    // If popup was blocked or closed on mobile, fallback to redirect
    if (errObj.code === 'auth/popup-blocked' || errObj.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return new Promise(() => {}); // Wait for page redirect
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

/**
 * Global Real-Time Auth State Listener.
 * Catches Google Login completion from Popups, Redirects, and Sessions.
 */
export function subscribeToAuth(callback: (user: GoogleAuthResult | null) => void) {
  // Check redirect result when mobile browser returns from Google
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        const processed = await processGoogleUser(result.user);
        callback(processed);
      }
    })
    .catch(() => {});

  // Real-time auth listener for popups and persistent sessions
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const processed = await processGoogleUser(user);
      callback(processed);
    }
  });
}

export async function processGoogleUser(rawUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<GoogleAuthResult> {
  const isOwner = (rawUser.email?.toLowerCase() === 'shervin00325@gmail.com');
  
  let rawName = rawUser.email ? rawUser.email.split('@')[0] : (rawUser.displayName || 'user');
  rawName = rawName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  if (rawName.length < 3) rawName = `user_${rawName}`;

  const username = isOwner ? 'shervin' : rawName;
  const displayName = isOwner ? 'TELESHΞN™ owner' : (rawUser.displayName || username);
  const role: 'owner' | 'member' = isOwner ? 'owner' : 'member';
  const bio = isOwner ? '👑 Founder & Lead Operator @ TELESHΞN™' : 'Google Verified Member @ TELESHΞN™';

  // Save/Update profile in Firestore (best effort)
  try {
    const userDocRef = doc(db, 'users', rawUser.uid);
    await setDoc(userDocRef, {
      uid: rawUser.uid,
      username,
      name: displayName,
      email: rawUser.email || '',
      avatar: rawUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      bio,
      role,
      isOwner,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch {
    // If firestore is restricted by domain rules, continue locally
  }

  return {
    uid: rawUser.uid,
    email: rawUser.email,
    displayName,
    photoURL: rawUser.photoURL,
    username,
    name: displayName,
    avatar: rawUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    bio,
    role,
    isOwner,
  };
}

export { fbSignOut, onAuthStateChanged, type FirebaseUser };
