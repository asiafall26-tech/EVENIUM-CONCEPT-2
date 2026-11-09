/**
 * Service de Synchronisation Temps Réel Universel Evenium
 * Permet de synchroniser instantanément le site public, le studio de création et tous les dashboards
 * dès qu'un changement est effectué (admin, organisateur, prestataire).
 *
 * Fonctionnalités :
 * 1. BroadcastChannel inter-onglets (latence < 10ms)
 * 2. Événement localStorage (compatible tous navigateurs)
 * 3. Événements Window CustomEvent locaux
 * 4. Rafraîchissement automatique au retour sur l'onglet (focus / visibilitychange)
 * 5. Heartbeat de sécurité
 */

type Invalidator = () => void;
const invalidators: Set<Invalidator> = new Set();

/** Enregistre une fonction d'invalidation de cache (ex: modelDefaults, customModels) */
export function registerInvalidator(fn: Invalidator): () => void {
  invalidators.add(fn);
  return () => {
    invalidators.delete(fn);
  };
}

export type SyncTopic = "models" | "events" | "prestataires" | "badges" | "all";

const CHANNEL_NAME = "evenium_sync_bus";
const STORAGE_PREFIX = "evenium_sync_";

/** Diffuse une notification de changement à tous les onglets, fenêtres et composants locaux */
export function broadcastChange(topic: SyncTopic = "all") {
  if (typeof window === "undefined") return;

  // 1. Invalidation immédiate des caches mémoire côté client
  invalidators.forEach((fn) => {
    try {
      fn();
    } catch {}
  });

  const payload = { topic, timestamp: Date.now() };

  // 2. Événement local sur la fenêtre actuelle
  try {
    window.dispatchEvent(new CustomEvent(`evenium:sync:${topic}`, { detail: payload }));
    if (topic !== "all") {
      window.dispatchEvent(new CustomEvent("evenium:sync:all", { detail: payload }));
    }
  } catch {}

  // 3. BroadcastChannel inter-onglets (Chrome, Safari 15.4+, Firefox, Edge)
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(payload);
      setTimeout(() => bc.close(), 500);
    }
  } catch {}

  // 4. Événement Storage pour les navigateurs ou contextes isolés
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${topic}`, String(Date.now()));
  } catch {}
}

/** S'abonne aux changements d'un sujet (modèles, événements, prestataires) */
export function subscribeToSync(
  topic: SyncTopic,
  onUpdate: (payload?: { topic: SyncTopic; timestamp: number }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let lastHandled = 0;
  const notify = (p?: { topic: SyncTopic; timestamp: number }) => {
    const now = Date.now();
    // Évite les doubles déclenchements rapprochés (< 100ms)
    if (now - lastHandled < 100) return;
    lastHandled = now;

    invalidators.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    onUpdate(p);
  };

  // 1. Événements de la fenêtre locale
  const eventName = topic === "all" ? "evenium:sync:all" : `evenium:sync:${topic}`;
  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent;
    notify(custom.detail);
  };
  window.addEventListener(eventName, handleLocal);

  // 2. BroadcastChannel inter-onglets
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (!msg.data) return;
        if (topic === "all" || msg.data.topic === topic || msg.data.topic === "all") {
          notify(msg.data);
        }
      };
    }
  } catch {}

  // 3. Storage Event inter-onglets
  const handleStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (e.key === `${STORAGE_PREFIX}${topic}` || (topic === "all" && e.key.startsWith(STORAGE_PREFIX))) {
      notify({ topic: topic === "all" ? "all" : topic, timestamp: Date.now() });
    }
  };
  window.addEventListener("storage", handleStorage);

  // 4. Réactivation lors du focus ou retour sur l'onglet
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      notify({ topic, timestamp: Date.now() });
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("focus", handleVisibility);

  // 5. Heartbeat léger (toutes les 15 secondes) pour garantir la fraîcheur en tâche de fond
  const heartbeat = setInterval(() => {
    notify({ topic, timestamp: Date.now() });
  }, 15000);

  return () => {
    window.removeEventListener(eventName, handleLocal);
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
    window.removeEventListener("storage", handleStorage);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleVisibility);
    clearInterval(heartbeat);
  };
}
