import { useEffect, useCallback } from "react";
import { getRegistrationToken, onForegroundMessage } from "../firebase";
import toast from "react-hot-toast";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://hospitalbackend-production.up.railway.app";

/**
 * useNotifications — React hook that:
 *  1. Requests browser notification permission.
 *  2. Gets the FCM registration token (registers the service worker).
 *  3. Sends the token to the backend to be stored for this user.
 *  4. Listens for foreground messages and shows an in-app toast.
 *
 * Call this hook once inside a component that is rendered only when the user
 * is authenticated (e.g., inside App after auth check, or in a Layout).
 *
 * @param {string|null} authToken  The Firebase ID token (or JWT) for Authorization header.
 */
export function useNotifications(authToken) {
  const registerToken = useCallback(async () => {
    if (!authToken) return;

    // 1. Check permission
    if (!("Notification" in window)) {
      console.warn("useNotifications: Browser does not support Notifications.");
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      console.warn("useNotifications: Notification permission denied.");
      return;
    }

    // 2. Get FCM token (this also registers the service worker)
    const fcmToken = await getRegistrationToken();
    if (!fcmToken) {
      console.warn("useNotifications: Could not obtain FCM token.");
      return;
    }
    console.log("FCM Token obtained:", fcmToken.substring(0, 20) + "...");

    // 3. Send token to backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcmToken }),
      });

      if (res.ok) {
        console.log("✅ FCM token registered with backend.");
      } else {
        const text = await res.text();
        console.warn("FCM token registration failed:", res.status, text);
      }
    } catch (err) {
      // Non-critical — app should still work even if this fails
      console.error("FCM token registration network error:", err.message);
    }
  }, [authToken]);

  // 4. Listen for foreground messages and show toast
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || "Notification";
      const body =
        payload.notification?.body || payload.data?.body || "";

      console.log("🔔 Foreground FCM message:", payload);

      // Show a toast notification for in-app visibility
      toast(`🔔 ${title}${body ? `\n${body}` : ""}`, {
        duration: 8000,
        style: {
          background: "#1e3a5f",
          color: "#ffffff",
          borderRadius: "8px",
          maxWidth: "360px",
        },
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Run token registration when token changes (e.g., on login)
  useEffect(() => {
    registerToken();
  }, [registerToken]);
}
