self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Event received", event);
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
    console.log("[Service Worker] Payload JSON:", payload);
  } catch (err) {
    console.log("[Service Worker] Payload parse error, using text:", err);
    payload = {
      title: "Notificação",
      body: event.data ? event.data.text() : "",
    };
  }

  const title = payload.title || "Notificação";
  const options = {
    body: payload.body || "",
    data: { url: payload.url || "/admin/dashboard" },
    vibrate: [100, 50, 100],
    actions: payload.actions || [],
  };

  console.log("[Service Worker] Showing notification:", title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log("[Service Worker] Notification shown successfully"))
      .catch((err) => console.error("[Service Worker] Error showing notification:", err))
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data || {};

  // Default URL from payload or fallback
  let url = data.url || "/admin/dashboard";

  const title = (notification.title || "").toLowerCase();
  const body = (notification.body || "").toLowerCase();

  // Determine intent (Deep Linking)
  let targetPath = null;
  if (
    title.includes("estoque") ||
    body.includes("estoque") ||
    title.includes("inventory")
  ) {
    targetPath = "estoque";
  } else if (
    title.includes("cancelamento") ||
    body.includes("cancelad") ||
    title.includes("cancellation")
  ) {
    targetPath = "calendario";
  }

  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Attempt to resolve dynamic URL if targetPath is set
        if (targetPath) {
          let baseUrl = "/admin/dashboard"; // Fallback

          // Find a client with a slug to construct correct URL
          for (const client of clientList) {
            // Match /admin/[slug]/dashboard pattern
            const match = client.url.match(/\/admin\/([^/]+)\/dashboard/);
            if (match) {
              baseUrl = `/admin/${match[1]}/dashboard`;
              break;
            }
          }
          url = `${baseUrl}/${targetPath}`;
        }

        // Check if there's already a tab open with the target URL
        for (const client of clientList) {
          if (client.url?.includes(url) && "focus" in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) return self.clients.openWindow(url);
      }),
  );
});
