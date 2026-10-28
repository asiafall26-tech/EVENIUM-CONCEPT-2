// Service Worker Evenium pour les notifications Push en arrière-plan (même application fermée)

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Evenium",
    body: "Vous avez une nouvelle notification.",
    icon: "/icon.png",
    badge: "/apple-icon.png",
    url: "/dashboard",
    tag: "evenium-alert",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      const text = event.data.text();
      if (text) data.body = text;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: data.badge || "/apple-icon.png",
    tag: data.tag || `evenium-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      { action: "open", title: "Ouvrir" },
      { action: "close", title: "Fermer" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte, on lui donne le focus et on la redirige
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url === targetUrl || client.url.includes(targetUrl)) {
            return client.focus();
          }
        }
      }
      // Sinon on ouvre une nouvelle fenêtre avec l'URL cible
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
