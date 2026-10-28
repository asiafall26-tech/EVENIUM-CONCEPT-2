"use client";

import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Bell,
  Smartphone,
  Check,
  Music2,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  Clock,
} from "lucide-react";
import {
  SOUND_OPTIONS,
  DEFAULT_SOUND_CONFIG,
  getNotificationSoundConfig,
  saveNotificationSoundConfig,
  playNotificationSound,
  type NotificationSoundConfig,
} from "@/lib/notifications/soundManager";
import {
  isPushSupported,
  getExistingPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/notifications/pushManager";
import { createClient } from "@/utils/supabase/client";

interface Props {
  role?: "client" | "prestataire" | "admin";
}

export function NotificationSoundSettings({ role = "client" }: Props) {
  const [config, setConfig] = useState<NotificationSoundConfig>(DEFAULT_SOUND_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // États Push Notifications (Application fermée)
  const [pushSupported, setPushSupported] = useState(false);
  const [pushActive, setPushActive] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getNotificationSoundConfig());
    if (isPushSupported()) {
      setPushSupported(true);
      getExistingPushSubscription().then((sub) => {
        setPushActive(!!sub);
      });
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  const updateConfig = (patch: Partial<NotificationSoundConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    saveNotificationSoundConfig(next);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestSound = (soundId: string) => {
    setPlayingId(soundId);
    playNotificationSound(soundId, config.volume);
    setTimeout(() => setPlayingId(null), 3000);
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    setPushError(null);
    setPushStatusMsg(null);

    try {
      if (pushActive) {
        const res = await unsubscribeFromPush();
        if (res.success) {
          setPushActive(false);
          setPushStatusMsg("Notifications push désactivées sur cet appareil.");
        } else {
          setPushError(res.error || "Impossible de désactiver les notifications.");
        }
      } else {
        const res = await subscribeToPush(userId || undefined);
        if (res.success) {
          setPushActive(true);
          setPushStatusMsg(
            "Parfait ! Cet appareil recevra désormais vos notifications Evenium même application fermée."
          );
        } else {
          setPushError(res.error || "Échec de l'activation des notifications.");
        }
      }
    } finally {
      setPushLoading(false);
      setTimeout(() => {
        setPushStatusMsg(null);
      }, 5000);
    }
  };

  const handleSendTestPush = async (delaySeconds = 0) => {
    setPushLoading(true);
    setPushError(null);
    setPushStatusMsg(
      delaySeconds > 0
        ? `L'alerte partira dans ${delaySeconds}s... Verrouillez votre écran ou quittez l'app pour tester !`
        : null
    );

    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || undefined,
          delayMs: delaySeconds * 1000,
          title: "Evenium • Notification en arrière-plan",
          message: "Test réussi ! Votre appareil reçoit bien les alertes Evenium même application fermée.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du test.");
      }

      setPushStatusMsg(data.message || "Alerte de test envoyée avec succès sur votre appareil !");
    } catch (err: any) {
      setPushError(err.message || "Erreur lors du test.");
    } finally {
      setPushLoading(false);
      setTimeout(() => {
        setPushStatusMsg(null);
      }, 7000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Carte Push Notifications (Application fermée & Écran éteint) */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                pushActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              <BellRing size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Alertes directes sur cet appareil (Même application fermée)
                </h4>
                {pushActive ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Actif
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    Inactif sur cet appareil
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Recevez une alerte sonore et une bannière native dès qu&apos;un client, prestataire ou invité vous sollicite, même si votre navigateur est fermé ou l&apos;écran éteint.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {pushActive && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSendTestPush(0)}
                  disabled={pushLoading}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Envoie immédiatement une notification sur cet appareil"
                >
                  {pushLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                  Tester
                </button>
                <button
                  type="button"
                  onClick={() => handleSendTestPush(3)}
                  disabled={pushLoading}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-[#8f6f33] border border-[#b8924a]/30 hover:bg-amber-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Part dans 3 secondes : verrouillez votre écran pour tester la réception en veille !"
                >
                  <Clock size={13} />
                  Tester en veille (3s)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleTogglePush}
              disabled={pushLoading || !pushSupported}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 ${
                pushActive
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-black text-white hover:bg-stone-800"
              }`}
            >
              {pushLoading && <Loader2 size={14} className="animate-spin" />}
              {pushActive ? "Désactiver" : "Activer les notifications sur cet appareil"}
            </button>
          </div>
        </div>

        {pushStatusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{pushStatusMsg}</span>
          </div>
        )}

        {pushError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle size={15} className="shrink-0 text-rose-600" />
            <span>{pushError}</span>
          </div>
        )}
      </div>

      {/* 2. En-tête de section Sonneries */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#b8924a]/15 text-[#8f6f33] flex items-center justify-center">
            <Music2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
              Sonneries & Alertes Sonores
              {isSaved && (
                <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 animate-in fade-in duration-150">
                  <Check size={12} /> Sauvegardé
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Personnalisez les carillons émis lors de la réception de messages, devis et réponses convives.
            </p>
          </div>
        </div>

        {/* Interrupteur général On/Off */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-semibold text-gray-600 hidden sm:inline">
            {config.enabled ? "Activé" : "Muet"}
          </span>
          <div
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors ${
              config.enabled ? "bg-[#241b13]" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>
      </div>

      {config.enabled && (
        <div className="bg-[#faf8f5] border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-6">
          {/* Slider Volume */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              {config.volume === 0 ? (
                <VolumeX size={18} className="text-stone-400" />
              ) : (
                <Volume2 size={18} className="text-[#8f6f33]" />
              )}
              Volume des sonneries ({config.volume}%)
            </div>
            <div className="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                min="0"
                max="100"
                value={config.volume}
                onChange={(e) => updateConfig({ volume: Number(e.target.value) })}
                className="flex-1 accent-[#b8924a] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleTestSound(config.messageSound)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-200 hover:bg-[#b8924a] hover:text-white transition-colors"
              >
                Tester
              </button>
            </div>
          </div>

          {/* Grille de sélection des sonneries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Nouveaux Messages */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  💬 Nouveaux Messages (Chat)
                </span>
                <button
                  type="button"
                  onClick={() => handleTestSound(config.messageSound)}
                  className="p-1 rounded-md text-stone-500 hover:text-[#b8924a] hover:bg-stone-50 transition-colors"
                  title="Écouter un extrait"
                >
                  <Play
                    size={14}
                    className={playingId === config.messageSound ? "text-[#b8924a] fill-current" : ""}
                  />
                </button>
              </div>
              <select
                value={config.messageSound}
                onChange={(e) => {
                  updateConfig({ messageSound: e.target.value });
                  handleTestSound(e.target.value);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#fbf7f0] border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                {SOUND_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} {opt.duration && opt.duration !== "-" ? `• ${opt.duration}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Devis & Demandes */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  📄 Devis & Demandes
                </span>
                <button
                  type="button"
                  onClick={() => handleTestSound(config.devisSound)}
                  className="p-1 rounded-md text-stone-500 hover:text-[#b8924a] hover:bg-stone-50 transition-colors"
                  title="Écouter un extrait"
                >
                  <Play
                    size={14}
                    className={playingId === config.devisSound ? "text-[#b8924a] fill-current" : ""}
                  />
                </button>
              </div>
              <select
                value={config.devisSound}
                onChange={(e) => {
                  updateConfig({ devisSound: e.target.value });
                  handleTestSound(e.target.value);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#fbf7f0] border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                {SOUND_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} {opt.duration && opt.duration !== "-" ? `• ${opt.duration}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Réponses Invitations RSVP */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  💌 Réponses Invités (RSVP)
                </span>
                <button
                  type="button"
                  onClick={() => handleTestSound(config.rsvpSound)}
                  className="p-1 rounded-md text-stone-500 hover:text-[#b8924a] hover:bg-stone-50 transition-colors"
                  title="Écouter un extrait"
                >
                  <Play
                    size={14}
                    className={playingId === config.rsvpSound ? "text-[#b8924a] fill-current" : ""}
                  />
                </button>
              </div>
              <select
                value={config.rsvpSound}
                onChange={(e) => {
                  updateConfig({ rsvpSound: e.target.value });
                  handleTestSound(e.target.value);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#fbf7f0] border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                {SOUND_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} {opt.duration && opt.duration !== "-" ? `• ${opt.duration}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Son par défaut / Alertes système */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  🔔 Autres alertes & Clôtures
                </span>
                <button
                  type="button"
                  onClick={() => handleTestSound(config.defaultSound)}
                  className="p-1 rounded-md text-stone-500 hover:text-[#b8924a] hover:bg-stone-50 transition-colors"
                  title="Écouter un extrait"
                >
                  <Play
                    size={14}
                    className={playingId === config.defaultSound ? "text-[#b8924a] fill-current" : ""}
                  />
                </button>
              </div>
              <select
                value={config.defaultSound}
                onChange={(e) => {
                  updateConfig({ defaultSound: e.target.value });
                  handleTestSound(e.target.value);
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#fbf7f0] border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                {SOUND_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} {opt.duration && opt.duration !== "-" ? `• ${opt.duration}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Guide Épinglage Mobile / PWA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#241b13] to-[#14100c] text-white shadow-lg border border-[#b8924a]/30 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 flex items-center justify-center text-[#d9c08c]">
            <Smartphone size={16} />
          </div>
          <h4 className="font-serif text-sm font-bold text-[#d9c08c]">
            Installer Evenium comme application mobile
          </h4>
        </div>

        <p className="text-xs text-white/80 leading-relaxed">
          Pour recevoir vos alertes en temps réel et ouvrir votre tableau de bord en 1 clic sans passer par votre navigateur :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-white/70">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="font-bold text-white block mb-1">🍏 Sur iPhone (iOS / Safari) :</span>
            Appuyez sur le bouton <strong>Partager</strong> <span className="opacity-70">(le carré avec la flèche vers le haut)</span>, puis faites défiler et sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="font-bold text-white block mb-1">🤖 Sur Android (Chrome) :</span>
            Appuyez sur les <strong>3 petits points</strong> en haut à droite, puis sélectionnez <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
