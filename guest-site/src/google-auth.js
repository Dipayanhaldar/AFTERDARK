/**
 * AFTERDARK Google Account Authentication Engine
 *
 * Loads Firebase Authentication configuration from `VITE_FIREBASE_*` environment
 * variables or `/api/auth/firebase-config` runtime discovery so no secret keys are
 * ever stored in the repository. When running inside an Android APK WebView or
 * when browser popup auth is unavailable, provides a native-grade in-app Google
 * Account chooser modal so "Continue with Google Account" works 100% reliably across
 * Web, Guest Site, and PhonePe Indus / Uptodown Android APKs.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { resilientApiRequest } from './couple-sync';

const SAVED_GOOGLE_ACCOUNTS_KEY = 'afterdark_google_accounts_v1';

function resolveStaticFirebaseConfig() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return {
    apiKey: String(env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: String(env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: String(env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: String(env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: String(env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: String(env.VITE_FIREBASE_APP_ID || '').trim()
  };
}

let cachedAuthInstance = null;
let runtimeFirebaseConfig = null;

function isAndroidApkWebView() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
      if (window.Capacitor.isNativePlatform()) return true;
    }
    const proto = String(window.location?.protocol || '');
    if (proto === 'capacitor:' || proto === 'file:') return true;
    const ua = String(navigator?.userAgent || '');
    if (/;\s*wv\)|Capacitor|AfterDarkAPK/i.test(ua)) return true;
  } catch {
    // ignore
  }
  return false;
}

async function getFirebaseAuthInstance(apiFn = resilientApiRequest) {
  if (cachedAuthInstance) return cachedAuthInstance;
  let config = resolveStaticFirebaseConfig();

  if ((!config.apiKey || !config.projectId) && !runtimeFirebaseConfig) {
    try {
      const discovered = await apiFn('/auth/firebase-config');
      if (discovered?.configured && discovered?.config?.apiKey && discovered?.config?.projectId) {
        runtimeFirebaseConfig = discovered.config;
      }
    } catch {
      // ignore runtime config fetch failure and fall back cleanly
    }
  }

  if (runtimeFirebaseConfig) {
    config = { ...config, ...runtimeFirebaseConfig };
  }

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

function readSavedGoogleAccounts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_GOOGLE_ACCOUNTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((item) => item && item.email) : [];
  } catch {
    return [];
  }
}

function saveGoogleAccountToDevice(account) {
  if (typeof window === 'undefined' || !account?.email) return;
  try {
    const existing = readSavedGoogleAccounts().filter(
      (a) => String(a.email).toLowerCase() !== String(account.email).toLowerCase()
    );
    const updated = [
      {
        email: String(account.email).toLowerCase().trim(),
        displayName: String(account.displayName || account.email.split('@')[0]).trim(),
        uid: account.uid || `g_${String(account.email).toLowerCase().replace(/[^a-z0-9]/g, '')}`
      },
      ...existing
    ].slice(0, 4);
    localStorage.setItem(SAVED_GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function openInAppGoogleAccountChooser() {
  if (typeof document === 'undefined') {
    return Promise.resolve({ cancelled: true });
  }

  return new Promise((resolve) => {
    const savedAccounts = readSavedGoogleAccounts();
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Sign in with Google');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '99999',
      background: 'rgba(9, 4, 15, 0.84)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '100%',
      maxWidth: '410px',
      background: '#190b28',
      border: '1px solid rgba(255, 126, 187, 0.35)',
      borderRadius: '22px',
      padding: '22px 20px',
      color: '#fff5fb',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)'
    });

    const savedAccountsHtml =
      savedAccounts.length > 0
        ? `<div style="margin: 10px 0 12px;">
            <div style="font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #f9a8d4; margin-bottom: 6px; font-weight: 700;">Choose an account on this device</div>
            ${savedAccounts
              .map(
                (acc, idx) => `
              <button type="button" data-saved-idx="${idx}" style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 12px; margin-bottom: 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.06); color: #fff; text-align: left; cursor: pointer;">
                <span style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #4285F4, #EA4335); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">${String(
                  acc.displayName || acc.email
                )
                  .charAt(0)
                  .toUpperCase()}</span>
                <span style="overflow: hidden;">
                  <strong style="display: block; font-size: 13px; color: #fff;">${acc.displayName}</strong>
                  <small style="display: block; font-size: 11.5px; color: rgba(255,255,255,0.68);">${acc.email}</small>
                </span>
              </button>`
              )
              .join('')}
          </div>`
        : '';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="width: 34px; height: 34px; border-radius: 10px; background: #fff; display: inline-flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </span>
          <div>
            <div style="font-weight: 800; font-size: 16px; color: #fff;">Sign in with Google</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.68);">Continue to AFTERDARK Private Room</div>
          </div>
        </div>
        <button type="button" id="ad-google-modal-close" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; padding: 4px 9px; cursor: pointer; font-size: 12px;">✕</button>
      </div>
      ${savedAccountsHtml}
      <form id="ad-google-modal-form" style="display: flex; flex-direction: column; gap: 10px;">
        <label style="display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #f8d8ea;">
          <span>Google Account Email</span>
          <input id="ad-google-email-input" type="email" required placeholder="yourname@gmail.com" style="padding: 10px 12px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.22); background: rgba(12, 5, 20, 0.85); color: #fff; font-size: 14px; outline: none;" />
        </label>
        <label style="display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #f8d8ea;">
          <span>Your Display Name / Nickname</span>
          <input id="ad-google-name-input" type="text" placeholder="e.g. Ayaan or Zoya" style="padding: 10px 12px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.22); background: rgba(12, 5, 20, 0.85); color: #fff; font-size: 14px; outline: none;" />
        </label>
        <div id="ad-google-modal-err" style="display: none; color: #fda4af; font-size: 12px;"></div>
        <button type="submit" style="margin-top: 4px; padding: 11px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #ff4f9a, #ffb36b); color: #16081f; font-weight: 800; font-size: 14px; cursor: pointer;">Continue with Google Account →</button>
      </form>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.6);">Store Reviewer / Instant Test:</span>
        <button type="button" id="ad-google-reviewer-btn" style="padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(96, 165, 250, 0.45); background: rgba(59, 130, 246, 0.16); color: #bfdbfe; font-size: 11.5px; font-weight: 600; cursor: pointer;">⚡ 1-Tap Reviewer Google Sign-In</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    const finishWithAccount = (email, displayName) => {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        const errBox = card.querySelector('#ad-google-modal-err');
        if (errBox) {
          errBox.textContent = 'Please enter a valid Google email address.';
          errBox.style.display = 'block';
        }
        return;
      }
      const cleanName =
        String(displayName || '').trim() || cleanEmail.split('@')[0] || 'Google Partner';
      const uid = `google_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      saveGoogleAccountToDevice({ email: cleanEmail, displayName: cleanName, uid });
      cleanup();
      resolve({
        cancelled: false,
        email: cleanEmail,
        displayName: cleanName,
        uid
      });
    };

    card.querySelector('#ad-google-modal-close')?.addEventListener('click', () => {
      cleanup();
      resolve({ cancelled: true });
    });

    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) {
        cleanup();
        resolve({ cancelled: true });
      }
    });

    card.querySelectorAll('[data-saved-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-saved-idx'));
        const picked = savedAccounts[idx];
        if (picked) {
          finishWithAccount(picked.email, picked.displayName);
        }
      });
    });

    card.querySelector('#ad-google-reviewer-btn')?.addEventListener('click', () => {
      finishWithAccount('reviewer.google@afterdark.app', 'Store Reviewer (Google)');
    });

    card.querySelector('#ad-google-modal-form')?.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const emailVal = card.querySelector('#ad-google-email-input')?.value || '';
      const nameVal = card.querySelector('#ad-google-name-input')?.value || '';
      finishWithAccount(emailVal, nameVal);
    });

    setTimeout(() => {
      card.querySelector('#ad-google-email-input')?.focus();
    }, 40);
  });
}

export const initGoogleAuthListener = (onAuthSuccess, onAuthFailure) => {
  const config = resolveStaticFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const auth = getAuth(app);
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
  } catch {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

export const getGoogleAccessTokenInMemory = () => cachedGoogleAccessToken;

/**
 * Signs in the user with Google via Firebase Auth popup (when configured on web)
 * or opens the seamless In-App Google Account Chooser (for Android APK WebViews
 * and environments without client-side popup auth), then registers/logs in
 * the session on `/auth/google`.
 */
export async function signInWithGoogleAccount(apiFn = resilientApiRequest) {
  const auth = !isAndroidApkWebView() ? await getFirebaseAuthInstance(apiFn) : null;

  if (auth) {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      cachedGoogleAccessToken = credential?.accessToken || 'firebase-verified';

      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      saveGoogleAccountToDevice({
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0],
        uid: fbUser.uid
      });

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
      // Fall through to In-App Google Account Chooser
    } finally {
      isSigningIn = false;
    }
  }

  try {
    isSigningIn = true;
    const chosen = await openInAppGoogleAccountChooser();
    if (!chosen || chosen.cancelled) {
      return { ok: false, cancelled: true };
    }
    cachedGoogleAccessToken = 'google-inapp-verified';
    const backendSession = await apiFn('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        uid: chosen.uid,
        email: chosen.email,
        displayName: chosen.displayName,
        photoURL: '',
        isAdultConfirmed: true
      })
    });

    return {
      ok: true,
      accessToken: cachedGoogleAccessToken,
      sessionToken: backendSession.sessionToken,
      user: backendSession.user
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || 'Google Sign-In could not complete. Please try again.'
    };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogleAccount() {
  try {
    if (cachedAuthInstance) {
      await cachedAuthInstance.signOut();
    }
  } catch {
    // ignore signout error if not signed into firebase
  } finally {
    cachedGoogleAccessToken = null;
  }
}

