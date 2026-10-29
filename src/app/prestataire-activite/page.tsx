"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ActivityFields } from "@/components/prestataire/ActivityFields";
import { EMPTY_ACTIVITY, activityFromProfile, missingActivity, saveActivity, type ProviderActivity } from "@/lib/providerProfile";

/**
 * Étape obligatoire pour les prestataires certifiés Evenium à leur connexion :
 * types d'événements, prestations, pays et zones d'intervention.
 */
export default function PrestataireActivitePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [activity, setActivity] = useState<ProviderActivity>(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirectTo=/prestataire");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setUserId(user.id);
      setName(profile?.full_name || user.user_metadata?.full_name || "");
      setActivity(activityFromProfile({ ...profile, user_metadata: user.user_metadata }));
      setLoading(false);
    })();
  }, [supabase, router]);

  const submit = async () => {
    const missing = missingActivity(activity);
    if (missing.length) {
      setShowErrors(true);
      setError(`Merci de renseigner ${missing.join(", ")}.`);
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await saveActivity(supabase, userId, activity);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.replace("/prestataire");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#b8924a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <header
        className="border-b border-[#e4d8c4]/70 bg-[#f5eee1]/80 backdrop-blur sticky top-0 z-20 transition-all"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center">
          <Image src="/logo-horizontal-dark.png" alt="Evenium" width={120} height={30} className="object-contain h-auto" priority />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#8f6f33]">
            <ShieldCheck size={14} /> Prestataire certifié Evenium
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 mt-4">Bienvenue{name ? `, ${name}` : ""}</h1>
          <div className="ornament mt-5" aria-hidden="true">✦</div>
          <p className="text-gray-600 mt-5 max-w-xl mx-auto">
            Avant d'accéder à votre espace, indiquez où et pour quels événements vous intervenez. Ces informations permettent aux organisateurs de vous trouver.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
          <ActivityFields value={activity} onChange={setActivity} showErrors={showErrors} />
        </div>
      </main>

      <div
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 transition-all z-20"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className={`text-sm ${error ? "text-[#6b1f2a]" : "text-gray-500"}`}>{error || "Tous les champs sont obligatoires. Vous pourrez les modifier dans votre profil."}</p>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 sm:px-6 lg:px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-[#f5eee1] disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Accéder à mon espace
          </button>
        </div>
      </div>
    </div>
  );
}
