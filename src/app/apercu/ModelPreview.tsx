"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  src: string;
  name: string;
  cover: string | null;
  category?: string;
  showBack: boolean;
}

/**
 * Aperçu d'un modèle d'invitation avec en-tête et barre d'actions responsive :
 * - Navigation fluide (« Retour aux modèles » / « Choisir ce modèle ») sur TOUS les écrans.
 * - Aucune redirection qui piège le visiteur.
 * - Sur mobile : en-tête compact + barre d'action inférieure au pouce.
 * - Sur ordinateur : mockup smartphone centré devant l'arrière-plan flouté.
 */
export default function ModelPreview({ src, name, cover, category, showBack }: Props) {
  const backUrl = category && category !== "Tous" ? `/invitations?cat=${encodeURIComponent(category)}` : "/invitations";

  const chooseUrl = (() => {
    const catParam = category && category !== "Tous" ? `&cat=${encodeURIComponent(category)}` : "";
    const custom = src.match(/^\/m\/([a-z0-9-]+)/);
    if (custom) return `/create?model=custom:${custom[1]}${catParam}`;
    if (src.includes("rose-or")) return `/create?model=invit-10${catParam}`;
    if (src.includes("sceau-dor")) return `/create?model=invit-8${catParam}`;
    if (src.includes("velours") || src.includes("mariage")) return `/create?model=invit-7${catParam}`;
    if (src.includes("ivoire")) return `/create?model=invit-9${catParam}`;
    if (src.includes("anniversaire")) return `/create?model=invit-11${catParam}`;
    if (src.includes("voeux")) return `/create?cat=voeux`;
    if (src.includes("mots-doux")) return `/create?cat=mots_doux`;
    return `/create${catParam ? `?${catParam.slice(1)}` : ""}`;
  })();

  // Mémorise la catégorie active pour que le retour ramène toujours à la bonne catégorie
  useEffect(() => {
    if (category && category !== "Tous") {
      try {
        sessionStorage.setItem("evenium:last_category", category);
      } catch { }
    }
  }, [category]);

  const router = useRouter();

  // Échappement clavier avec la touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showBack) {
        router.push(backUrl);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showBack, backUrl, router]);

  const frameSrc = `${src}${src.includes("?") ? "&" : "?"}hideCta=1&demo=1&hideEdit=1`;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#1a120c] flex flex-col select-none">
      {/* Arrière-plan : la couverture du modèle, floutée et assombrie */}
      {cover && (
        <div
          aria-hidden
          className="absolute -inset-16 scale-110 bg-cover bg-center blur-2xl opacity-60 pointer-events-none"
          style={{ backgroundImage: `url("${cover}")` }}
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Barre supérieure visible et cliquable sur TOUS les écrans (desktop ET mobile) */}
      <header
        className="relative z-30 shrink-0 px-3 sm:px-8 bg-[#0e0a08]/95 backdrop-blur-md border-b border-[#D4AF37]/35 flex items-center justify-between gap-3 shadow-lg select-none"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
          paddingBottom: "8px",
          minHeight: "calc(3.5rem + env(safe-area-inset-top, 0px))",
        }}
      >
        {showBack ? (
          <Link
            href={backUrl}
            aria-label="Retour aux modèles"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50 transition-all active:scale-95 whitespace-nowrap cursor-pointer shadow-sm"
          >
            <ArrowLeft size={14} className="text-[#f0d999] shrink-0" />
            <span className="hidden sm:inline">Retour aux modèles</span>
            <span className="sm:hidden">Autres modèles</span>
          </Link>
        ) : <div />}

        <div className="text-center min-w-0 max-w-md">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-extrabold block">Aperçu du modèle</span>
          <p className="font-serif text-xs sm:text-sm text-white/90 truncate font-medium">{name}</p>
        </div>

        <Link
          href={chooseUrl}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs sm:text-sm shadow-md shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/60 whitespace-nowrap cursor-pointer"
        >
          <Sparkles size={14} className="text-black shrink-0" />
          <span className="hidden sm:inline">Choisir ce modèle</span>
          <span className="sm:hidden">Choisir</span>
        </Link>
      </header>

      {/* Corps : centré dans mockup smartphone sur grand écran, plein écran fluide sur mobile */}
      <div className="relative z-20 flex-1 min-h-0 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        <div
          className="relative w-full h-full sm:w-[430px] sm:h-[min(90vh,880px)] sm:max-h-[880px] bg-white sm:rounded-[36px] sm:shadow-[0_0_80px_rgba(0,0,0,0.7)] sm:border sm:border-[#c9a45e]/70 overflow-hidden flex flex-col"
        >
          <iframe
            src={frameSrc}
            title={name}
            allow="autoplay; fullscreen"
            className="block h-full w-full border-0 bg-white"
          />
        </div>
      </div>
    </main>
  );
}
