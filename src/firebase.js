// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMKAnJr0df-_FCIhd6Rn89Ea0idG9KNok",
  authDomain: "resource-optimization-3c59c.firebaseapp.com",
  projectId: "resource-optimization-3c59c",
  storageBucket: "resource-optimization-3c59c.firebasestorage.app",
  messagingSenderId: "290250715804",
  appId: "1:290250715804:web:c97ff932959affe9513359",
  measurementId: "G-EV7G2JW211",
};

// ── VAPID key for web push ─────────────────────────────────────────────────
export const VAPID_KEY =
  "BMGe0h_lhPk__uqMlT-egAWZqpfn3bPuWW06kh7V6-YJ82HPq7QSVn-nO37H50lOEtnueYI_QbhTU9zUnaRt5Qo";

// ── Initialize Firebase ────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── Firebase Messaging ─────────────────────────────────────────────────────
// Messaging is only available in browsers that support service workers.
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase Messaging not supported in this environment:", err.message);
}

/**
 * Request the FCM registration token for the current browser.
 * Registers the service worker first so background notifications work.
 *
 * @returns {Promise<string|null>}  The FCM token, or null on failure.
 */
export async function getRegistrationToken() {
  if (!messaging) return null;
  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (err) {
    console.error("FCM getRegistrationToken error:", err);
    return null;
  }
}

/**
 * Subscribe to foreground messages (app is open in browser tab).
 * @param {function} callback  Called with the FCM payload when a message arrives.
 * @returns {function}  Unsubscribe function.
 */
export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { auth, googleProvider, messaging };

