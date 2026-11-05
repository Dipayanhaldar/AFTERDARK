/**
 * AFTERDARK Google Account Authentication Engine (v2.0.2.3)
 *
 * Uses the provisioned Firebase Authentication configuration (`firebase-applet-config.json`)
 * to provide 1-Click "Sign in with Google" across Web and Android APK environments.
 * Keeps OAuth access tokens strictly in memory (`cachedGoogleAccessToken`) and exchanges
 * verified Google user identity with `/api/auth/google` for a persistent AFTERDARK session.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { resilientApiRequest } from './couple-sync';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedGoogleAccessToken = null;

export const initGoogleAuthListener = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedGoogleAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedGoogleAccessToken);
      } else if (!isSigningIn) {
        cachedGoogleAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getGoogleAccessTokenInMemory = () => cachedGoogleAccessToken;

/**
 * Signs in the user with Google via Firebase Auth popup and registers/logs in
 * the creator session on `/api/auth/google`.
 */
export async function signInWithGoogleAccount() {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedGoogleAccessToken = credential?.accessToken || 'firebase-verified';

    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();

    const backendSession = await resilientApiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken,
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Partner',
        photoURL: fbUser.photoURL || '',
        isAdultConfirmed: true
      })
    });

    return {
      firebaseUser: fbUser,
      accessToken: cachedGoogleAccessToken,
      sessionToken: backendSession.sessionToken,
      user: backendSession.user
    };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogleAccount() {
  try {
    await auth.signOut();
  } catch {
    // ignore signout error if not signed into firebase
  } finally {
    cachedGoogleAccessToken = null;
  }
}
