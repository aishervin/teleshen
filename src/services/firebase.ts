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

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

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
 * Real Google Sign-In with official Google OAuth Popup window.
 * Fallbacks directly to Google Identity Services Token Client if the domain
 * has not yet been whitelisted in Firebase Console.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  // 1. First attempt: Standard Firebase Popup
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    return processGoogleUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('Firebase popup notice, checking Google Identity Client:', errMsg);

    // 2. If unauthorized-domain or popup error, use Google Identity Services directly
    if (window.google?.accounts?.oauth2) {
      return new Promise<GoogleAuthResult>((resolve, reject) => {
        try {
          const client = window.google!.accounts.oauth2.initTokenClient({
            client_id: firebaseConfig.oAuthClientId,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse.error || !tokenResponse.access_token) {
                reject(new Error(tokenResponse.error || 'پنجره ورود توسط کاربر بسته شد.'));
                return;
              }

              try {
                // Fetch verified profile directly from Google
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                const processed = await processGoogleUser({
                  uid: userInfo.sub || `google_${Date.now()}`,
                  email: userInfo.email,
                  displayName: userInfo.name,
                  photoURL: userInfo.picture,
                });
                resolve(processed);
              } catch (fetchErr) {
                reject(fetchErr);
              }
            },
          });
          client.requestAccessToken();
        } catch (oauthErr) {
          reject(oauthErr);
        }
      });
    }

    throw err;
  }
}

async function processGoogleUser(rawUser: {
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
