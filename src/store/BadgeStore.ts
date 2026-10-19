import { create } from "zustand";
import { getBadgeCounts, type BadgeCounts } from "@/app/actions/notifications";

interface BadgeStore extends BadgeCounts {
  loaded: boolean;
  /** Re-reads the counters from the database (after a message is read, a ticket resolved…) */
  refresh: () => Promise<void>;
}

/* ---- Guest answers: "new" means received after the participants page was last opened (per browser) ---- */
const RSVP_SEEN_KEY = "evenium:rsvpSeenAt";

function readRsvpSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(RSVP_SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeRsvpSeen(map: Record<string, string>) {
  try {
    localStorage.setItem(RSVP_SEEN_KEY, JSON.stringify(map));
  } catch {}
}

/** Starts counting new answers for these events (from now on, so past answers are not flagged as new) */
export function trackRsvpEvents(eventIds: string[]) {
  const map = readRsvpSeen();
  let changed = false;
  const now = new Date().toISOString();
  for (const id of eventIds) {
    if (!map[id]) {
      map[id] = now;
      changed = true;
    }
  }
  if (changed) writeRsvpSeen(map);
}

/** Called when the participants page of an event is opened: its answers are now seen */
export function markRsvpSeen(eventId: string) {
  writeRsvpSeen({ ...readRsvpSeen(), [eventId]: new Date().toISOString() });
  useBadgeStore.getState().refresh();
}

/* ---- New providers (admin): "new" means signed up after the providers page was last opened (per browser) ---- */
const PRESTATAIRES_SEEN_KEY = "evenium:prestatairesSeenAt";

function readPrestatairesSeen(): string | undefined {
  try {
    let at = localStorage.getItem(PRESTATAIRES_SEEN_KEY);
    if (!at) {
      // First visit: start counting from now, so existing providers are not flagged as new
      at = new Date().toISOString();
      localStorage.setItem(PRESTATAIRES_SEEN_KEY, at);
    }
    return at;
  } catch {
    return undefined;
  }
}

/** Called when the admin opens the providers page: new sign-ups are now seen */
export function markPrestatairesSeen() {
  try {
    localStorage.setItem(PRESTATAIRES_SEEN_KEY, new Date().toISOString());
  } catch {}
  useBadgeStore.getState().refresh();
}

let inFlight: Promise<void> | null = null;

/** Badge counters shared by the sidebars, the bell, the toasts and the tab title. */
export const useBadgeStore = create<BadgeStore>((set) => ({
  userId: null,
  role: null,
  unreadMessages: 0,
  pendingSupport: 0,
  newPrestataires: 0,
  pendingDemandes: 0,
  unansweredReviews: 0,
  pendingDevis: 0,
  newRsvps: {},
  loaded: false,
  refresh: () => {
    // Several components may ask at once (realtime event + page action): share one request
    const inBrowser = typeof window !== "undefined";
    inFlight ??= getBadgeCounts(inBrowser ? readRsvpSeen() : {}, inBrowser ? readPrestatairesSeen() : undefined)
      .then((counts) => set({ ...counts, loaded: true }))
      .catch(() => {})
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  },
}));

export function totalNewRsvps(newRsvps: Record<string, number>) {
  return Object.values(newRsvps).reduce((a, b) => a + b, 0);
}

/** Everything waiting for the current user, as shown on the bell and in the tab title */
export function totalPending(c: BadgeCounts) {
  return c.unreadMessages + c.pendingSupport + c.newPrestataires + c.pendingDemandes + c.unansweredReviews + c.pendingDevis + totalNewRsvps(c.newRsvps);
}

/** Badge label for a menu item: undefined hides it, "99+" caps long numbers */
export function badgeLabel(n: number): string | undefined {
  if (!n || n < 1) return undefined;
  return n > 99 ? "99+" : String(n);
}

/** Messages page of each space */
export function messagesHref(role: BadgeCounts["role"]) {
  return role === "admin" ? "/admin/messages" : role === "prestataire" ? "/prestataire/messages" : "/dashboard/messages";
}
