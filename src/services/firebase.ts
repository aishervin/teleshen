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
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Extract clean username from email or display name
  let rawName = user.email ? user.email.split('@')[0] : (user.displayName || 'user');
  rawName = rawName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  if (rawName.length < 3) rawName = `user_${rawName}`;

  // Check if profile already exists in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userDocRef);

  let username = rawName;
  if (existingDoc.exists()) {
    username = existingDoc.data().username || rawName;
  } else {
    // Save new profile to Firestore
    await setDoc(userDocRef, {
      uid: user.uid,
      username,
      name: user.displayName || username,
      email: user.email || '',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      bio: 'Google Verified User @ TELESHΞN™',
      createdAt: new Date().toISOString(),
    }, { merge: true });
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    username,
  };
}

export { fbSignOut, onAuthStateChanged, type FirebaseUser };
