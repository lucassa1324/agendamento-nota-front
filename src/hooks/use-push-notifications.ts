"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { customFetch } from "@/lib/api-client";

type PermissionState = NotificationPermission;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof window !== "undefined" ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const isSupported = useMemo(() => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window, []);

  const getReadyRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      if (!isSupported) return null;
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) return reg;
      const registered = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return registered;
    } catch {
      return null;
    }
  }, [isSupported]);

  const refreshSubscriptionState = useCallback(async () => {
    if (!isSupported) return;
    const reg = await navigator.serviceWorker.ready;
    const current = await reg.pushManager.getSubscription();
    setSubscription(current);
    setIsSubscribed(!!current);
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    getReadyRegistration().then(() => refreshSubscriptionState());
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "default");

    // Listener para mudanças na permissão do navegador
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: "notifications" }).then((status) => {
        status.onchange = () => {
          setPermission(Notification.permission);
          refreshSubscriptionState();
        };
      });
    }
  }, [isSupported, getReadyRegistration, refreshSubscriptionState]);

  const requestAndSubscribe = useCallback(async () => {
    if (!isSupported) return { ok: false, error: "unsupported" };
    setIsRegistering(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setIsRegistering(false);
        return { ok: false, error: "denied" };
      }

      const registration = await getReadyRegistration();
      if (!registration) {
        setIsRegistering(false);
        return { ok: false, error: "registration_failed" };
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
      if (!vapidKey) {
        setIsRegistering(false);
        return { ok: false, error: "missing_vapid_key" };
      }

      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      setSubscription(sub);
      setIsSubscribed(true);

      const res = await customFetch("/api/push/subscriptions", {
        method: "POST",
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        if (res.status === 401) {
            window.location.href = "/login"; // Redirecionar para login
            return { ok: false, error: "unauthorized" };
        }
        setIsRegistering(false);
        return { ok: false, error: "backend_error" };
      }

      setIsRegistering(false);
      return { ok: true };
    } catch (err) {
      console.error("Erro ao ativar notificações:", err);
      setIsRegistering(false);
      return { ok: false, error: "unknown" };
    }
  }, [isSupported, getReadyRegistration]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return { ok: false, error: "unsupported" };
    setIsRegistering(true);
    try {
      const registration = await getReadyRegistration();
      if (!registration) {
          setIsRegistering(false);
          return { ok: false, error: "no_registration" };
      }
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      
      setSubscription(null);
      setIsSubscribed(false);
      setIsRegistering(false);
      return { ok: true };
    } catch (err) {
        console.error("Erro ao desativar notificações:", err);
        setIsRegistering(false);
        return { ok: false, error: "unknown" };
    }
  }, [isSupported, getReadyRegistration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    isRegistering,
    requestAndSubscribe,
    unsubscribeFromPush,
  };
}
