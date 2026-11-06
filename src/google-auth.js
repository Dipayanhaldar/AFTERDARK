/**
 * AFTERDARK Google Account Authentication Engine
 *
 * Loads Firebase Authentication configuration strictly from `VITE_FIREBASE_*`
 * environment variables so no API keys or App IDs are ever stored in the repository.
 * Keeps OAuth access tokens strictly in memory (`cachedGoogleAccessToken`) and exchanges
 * verified Google user identity with `/auth/google` for a persistent AFTERDARK session.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { resilientApiRequest } from './couple-sync';

function resolveFirebaseConfig() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || ''
  };
}

let cachedAuthInstance = null;

function getFirebaseAuthInstance() {
  if (cachedAuthInstance) return cachedAuthInstance;
  const config = resolveFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    cachedAuthInstance = getAuth(app);
    return cachedAuthInstance;
  } catch {
    return null;
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedGoogleAccessToken = null;

export const initGoogleAuthListener = (onAuthSuccess, onAuthFailure) => {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
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
 * the creator session on `/auth/google`.
 */
export async function signInWithGoogleAccount(apiFn = resilientApiRequest) {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    return {
      ok: false,
      error:
        'Google Sign-In is not configured in this environment. Please use email and password below.'
    };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedGoogleAccessToken = credential?.accessToken || 'firebase-verified';

    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();

    const backendSession = await apiFn('/auth/google', {
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
      ok: true,
      firebaseUser: fbUser,
      accessToken: cachedGoogleAccessToken,
      sessionToken: backendSession.sessionToken,
      user: backendSession.user
    };
  } catch (err) {
    const code = String(err?.code || '');
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      return { ok: false, cancelled: true };
    }
    return {
      ok: false,
      error: err?.message || 'Google Sign-In could not complete. Please try again.'
    };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogleAccount() {
  const auth = getFirebaseAuthInstance();
  try {
    if (auth) {
      await auth.signOut();
    }
  } catch {
    // ignore signout error if not signed into firebase
  } finally {
    cachedGoogleAccessToken = null;
  }
}
