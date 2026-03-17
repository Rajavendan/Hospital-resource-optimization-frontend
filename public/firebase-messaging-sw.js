// firebase-messaging-sw.js
// Place this file in the /public directory so it is served at the site root.
// This is required for Firebase Cloud Messaging background notifications.

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// ── Firebase configuration ────────────────────────────────────────────────
// Must match the config in src/firebase.js
firebase.initializeApp({
  apiKey: "AIzaSyCMKAnJr0df-_FCIhd6Rn89Ea0idG9KNok",
  authDomain: "resource-optimization-3c59c.firebaseapp.com",
  projectId: "resource-optimization-3c59c",
  storageBucket: "resource-optimization-3c59c.firebasestorage.app",
  messagingSenderId: "290250715804",
  appId: "1:290250715804:web:c97ff932959affe9513359",
  measurementId: "G-EV7G2JW211",
});

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────
// This fires when the app is in the background OR when the tab is closed.
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "Hospital Notification";

  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "You have a new notification.";

  const notificationOptions = {
    body: notificationBody,
    icon: "/vite.svg",       // Change to your hospital logo if available
    badge: "/vite.svg",
    tag: "hospital-notification",
    requireInteraction: false,
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ── Notification click handler ─────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
