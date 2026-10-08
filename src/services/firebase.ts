import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Real Google Sign-In with official Google OAuth Popup window
 */
export async function signInWithGoogle(): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string;
  role: 'owner' | 'member';
  isOwner: boolean;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Extract clean username from email or display name
  let rawName = user.email ? user.email.split('@')[0] : (user.displayName || 'user');
  rawName = rawName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  if (rawName.length < 3) rawName = `user_${rawName}`;

  // Check if this is the system Owner
  const isOwner = (user.email?.toLowerCase() === 'shervin00325@gmail.com');
  let username = isOwner ? 'shervin' : rawName;
  let displayName = isOwner ? 'TELESHΞN™ owner' : (user.displayName || username);
  let role: 'owner' | 'member' = isOwner ? 'owner' : 'member';
  let bio = isOwner ? '👑 Founder & Lead Operator @ TELESHΞN™' : 'Google Verified Member @ TELESHΞN™';

  // Check if profile already exists in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userDocRef);

  if (existingDoc.exists()) {
    const data = existingDoc.data();
    if (!isOwner) {
      username = data.username || rawName;
      displayName = data.name || displayName;
      role = data.role || 'member';
      bio = data.bio || bio;
    }
  }

  // Save/Update profile in Firestore
  await setDoc(userDocRef, {
    uid: user.uid,
    username,
    name: displayName,
    email: user.email || '',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    bio,
    role,
    isOwner,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    uid: user.uid,
    email: user.email,
    displayName,
    photoURL: user.photoURL,
    username,
    role,
    isOwner,
  };
}

export { fbSignOut, onAuthStateChanged, type FirebaseUser };
