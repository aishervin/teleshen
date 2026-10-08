import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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
  role: 'owner' | 'member';
  isOwner: boolean;
}

/**
 * Standard Firebase Google Sign-In with official Google OAuth Popup window.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  return processGoogleUser({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
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
    role,
    isOwner,
  };
}

export { fbSignOut, onAuthStateChanged, type FirebaseUser };
