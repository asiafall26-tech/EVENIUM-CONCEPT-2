'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useNotificationStore } from '@/store/NotificationStore';
import { messagesHref, totalNewRsvps, totalPending, useBadgeStore } from '@/store/BadgeStore';
import type { BadgeCounts } from '@/app/actions/notifications';
import { createClient } from '@/utils/supabase/client';
import { Bell, X, CheckCircle, Info, MessageSquare, LifeBuoy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

/** Fallback when realtime is not enabled on a table: counters are re-read every 30 s */
const POLL_MS = 30_000;
const TITLE_PREFIX = /^\(\d+\+?\)\s/;

/** Counters that raise a toast when they go up, per role */
interface Watched {
  key: string;
  roles: BadgeCounts['role'][];
  value: (c: BadgeCounts) => number;
  href: (c: BadgeCounts) => string;
  title: (added: number) => string;
  detail: (total: number) => string;
  icon?: 'support';
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

const WATCHED: Watched[] = [
  {
    key: 'pendingSupport',
    roles: ['admin'],
    value: (c) => c.pendingSupport,
    href: () => '/admin/support',
    title: (n) => (n > 1 ? `${n} nouvelles réclamations` : 'Nouvelle réclamation support'),
    detail: (t) => `${plural(t, 'réclamation')} en attente de traitement.`,
    icon: 'support',
  },
  {
    key: 'newPrestataires',
    roles: ['admin'],
    value: (c) => c.newPrestataires,
    href: () => '/admin/prestataires',
    title: (n) => (n > 1 ? `${n} nouveaux prestataires inscrits` : 'Nouveau prestataire inscrit'),
    detail: () => "Vérifiez son profil dans l'annuaire des prestataires.",
  },
  {
    key: 'pendingDemandes',
    roles: ['prestataire'],
    value: (c) => c.pendingDemandes,
    href: () => '/prestataire/demandes',
    title: (n) => (n > 1 ? `${n} nouvelles demandes` : 'Nouvelle demande de devis'),
    detail: (t) => `${plural(t, 'demande')} à traiter.`,
  },
  {
    key: 'unansweredReviews',
    roles: ['prestataire'],
    value: (c) => c.unansweredReviews,
    href: () => '/prestataire/avis',
    title: (n) => (n > 1 ? `${n} nouveaux avis clients` : 'Nouvel avis client'),
    detail: (t) => `${plural(t, 'avis')} sans réponse.`,
  },
  {
    key: 'pendingDevis',
    roles: ['client'],
    value: (c) => c.pendingDevis,
    href: () => '/dashboard/devis',
    title: (n) => (n > 1 ? `${n} nouveaux devis reçus` : 'Nouveau devis reçu'),
    detail: (t) => `${plural(t, 'devis')} en attente de votre validation.`,
  },
  {
    key: 'newRsvps',
    roles: ['client'],
    value: (c) => totalNewRsvps(c.newRsvps),
    href: (c) => {
      const eventId = Object.keys(c.newRsvps)[0];
      return eventId ? `/dashboard/events/${eventId}/participants` : '/dashboard';
    },
    title: (n) => (n > 1 ? `${n} nouvelles réponses d'invités` : "Nouvelle réponse d'un invité"),
    detail: (t) => `${plural(t, 'réponse')} RSVP à consulter.`,
  },
  {
    key: 'unreadMessages',
    roles: ['admin', 'client', 'prestataire'],
    value: (c) => c.unreadMessages,
    href: (c) => messagesHref(c.role),
    title: (n) => (n > 1 ? `${n} nouveaux messages` : 'Nouveau message'),
    detail: (t) => `${plural(t, 'message')} non lu${t > 1 ? 's' : ''}.`,
  },
];

export function NotificationProvider() {
  const { notifications, addNotification, removeNotification } = useNotificationStore();
  const store = useBadgeStore();
  const { userId, role, refresh } = store;
  const [supabase] = useState(() => createClient());
  const pathname = usePathname();
  /** Time of the last message toast sent by realtime (it carries the sender name, so the generic one is skipped) */
  const lastRealtimeMessage = useRef(0);

  // Initial load, refresh on sign-in/out and when the tab comes back to the foreground
  useEffect(() => {
    const isPrivate = pathname.startsWith('/dashboard') || pathname.startsWith('/prestataire') || pathname.startsWith('/admin');
    if (!isPrivate) return;

    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const { data: auth } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      window.removeEventListener('focus', onFocus);
      auth.subscription.unsubscribe();
    };
  }, [supabase, refresh, pathname]);

  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [userId, refresh]);

  // Pending count in the browser tab, so it is visible even from another tab
  const total = totalPending(store);
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(TITLE_PREFIX, '');
      const next = total > 0 ? `(${total > 99 ? '99+' : total}) ${base}` : base;
      if (document.title !== next) document.title = next;
    };
    apply();
    // Next.js rewrites the title on navigation: re-apply right after
    const t = setTimeout(apply, 300);
    return () => clearTimeout(t);
  }, [total, pathname]);

  // Realtime: every table that feeds a counter triggers a refresh
  useEffect(() => {
    if (!userId) return;
    const channels: any[] = [];

    channels.push(
      supabase
        .channel(`messages-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
          async (payload) => {
            lastRealtimeMessage.current = Date.now();
            refresh();
            const { data: sender } = await supabase.from('profiles').select('full_name, role').eq('id', payload.new.sender_id).single();
            const senderName = sender?.role === 'admin' ? 'Support Evenium' : (sender?.full_name || 'Utilisateur');
            const content = String(payload.new.content ?? '');
            addNotification({
              title: `Nouveau message de ${senderName}`,
              message: content.substring(0, 60) + (content.length > 60 ? '…' : ''),
              type: 'info',
              href: messagesHref(role),
            });
          }
        )
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, () => refresh())
        .subscribe()
    );

    if (role === 'admin') {
      channels.push(
        supabase.channel(`support-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => refresh()).subscribe()
      );
    }

    if (role === 'prestataire') {
      channels.push(
        supabase
          .channel(`prestataire-${userId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_devis', filter: `prestataire_id=eq.${userId}` }, () => refresh())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'devis', filter: `prestataire_id=eq.${userId}` }, () => refresh())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `prestataire_id=eq.${userId}` }, () => refresh())
          .subscribe()
      );
    }

    if (role === 'client') {
      channels.push(
        supabase
          .channel(`client-${userId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'devis', filter: `client_id=eq.${userId}` }, () => refresh())
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guests' }, () => refresh())
          .subscribe()
      );
    }

    return () => {
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, [userId, role, supabase, addNotification, refresh]);

  // Toast whenever a counter goes up (from realtime or from the periodic refresh, whichever comes first)
  useEffect(() => {
    if (!store.loaded || !role) return;
    for (const w of WATCHED) {
      if (!w.roles.includes(role)) continue;
      const value = w.value(store);
      const key = `evenium:last:${w.key}`;
      let previous: number | null = null;
      try {
        const v = sessionStorage.getItem(key);
        previous = v === null ? null : Number(v);
        sessionStorage.setItem(key, String(value));
      } catch {}
      if (previous === null || value <= previous) continue;
      const href = w.href(store);
      if (pathname.startsWith(href)) continue; // already on the page that lists them
      if (w.key === 'unreadMessages' && Date.now() - lastRealtimeMessage.current < 60_000) continue;
      addNotification({ title: w.title(value - previous), message: w.detail(value), type: 'warning', href });
    }
    // pathname is read only to skip the toast on the page itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, role, addNotification]);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none w-[350px] max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col`}
          >
            <div className="p-4 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {notif.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {notif.type === 'info' && <MessageSquare size={20} className="text-[#b8924a]" />}
                {notif.type === 'error' && <Info size={20} className="text-red-500" />}
                {notif.type === 'warning' && (notif.href === '/admin/support' ? <LifeBuoy size={20} className="text-orange-500" /> : <Bell size={20} className="text-orange-500" />)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{notif.title}</h4>
                <p className="text-gray-500 text-xs">{notif.message}</p>
                {notif.href && (
                  <Link href={notif.href} className="text-[#b8924a] text-xs font-semibold mt-2 inline-block hover:underline" onClick={() => removeNotification(notif.id)}>
                    Voir les détails
                  </Link>
                )}
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                aria-label="Fermer"
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-1 bg-gray-50 w-full relative">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={`absolute left-0 top-0 h-full ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'error' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-orange-500' : 'bg-[#b8924a]'}`}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
