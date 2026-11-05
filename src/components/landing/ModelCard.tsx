import Image from "next/image";
import Link from "next/link";
import { Eye, PlayCircle, FileImage, Sparkles, Heart } from "lucide-react";

type Kind = "animée" | "carte" | "voeu" | "mot_doux" | "couple";

interface ModelCardProps {
  name: string;
  image: string;
  kind: Kind;
  /** Petit sur-titre doré (catégorie ou collection) */
  eyebrow?: string;
  description?: string;
  /** Pastille dorée en haut à droite (« Signature », « Prestige Impérial »…) */
  badge?: string;
  /** Lien de toute la carte ; sans lien, `onPreview` rend l'image cliquable */
  href?: string;
  onPreview?: () => void;
  /** Boutons placés sous la carte (tunnel de création) */
  actions?: React.ReactNode;
  /** Version resserrée pour les grilles 2 colonnes sur téléphone */
  compact?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Présentation d'un modèle d'invitation, façon faire-part encadré :
 * passe-partout ivoire, filet doré intérieur, pastilles dorées et titre Playfair.
 */
export default function ModelCard({
  name,
  image,
  kind,
  eyebrow,
  description,
  badge,
  href,
  onPreview,
  actions,
  compact = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  priority,
  className = "",
}: ModelCardProps) {
  const visual = (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.1rem] bg-[#1d120a]">
      <Image
        src={image}
        alt={`Modèle d'invitation ${name}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      {/* Voile bas pour la lisibilité des pastilles et du survol */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#140c06]/70 via-transparent to-[#140c06]/25" />
      {/* Filet doré intérieur */}
      <div aria-hidden className={`absolute rounded-[0.8rem] border border-[#e7c97f]/55 pointer-events-none ${compact ? "inset-1.5" : "inset-2.5"}`} />

      {/* Pastilles */}
      <div className={`absolute flex items-start justify-between gap-2 z-10 pointer-events-none ${compact ? "top-2.5 left-2.5 right-2.5" : "top-4 left-4 right-4"}`}>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#c9a45e]/60 bg-[#150d07]/75 backdrop-blur-md px-2.5 py-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.18em] text-[#f0d999]">
          {kind === "voeu" ? (
            <>
              <Sparkles size={11} className="text-[#f5d77f]" /> Vœu
            </>
          ) : kind === "mot_doux" ? (
            <>
              <Heart size={11} className="text-[#f87171]" /> Mot Doux
            </>
          ) : kind === "couple" ? (
            <>
              <Heart size={11} className="text-[#e879f9]" /> Couple
            </>
          ) : kind === "animée" ? (
            <>
              <PlayCircle size={11} /> Animée
            </>
          ) : (
            <>
              <FileImage size={11} /> Carte
            </>
          )}
        </span>
        {badge && !compact && (
          <span className="rounded-full bg-gradient-to-r from-[#b8924a] via-[#f0d999] to-[#b8924a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#241509] shadow-[0_4px_14px_-4px_rgba(233,196,120,0.8)] truncate max-w-[60%]">
            {badge}
          </span>
        )}
      </div>

      {/* Survol : invitation à découvrir */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#140c06]/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
        <span className="btn-lux-light px-5 py-2.5 text-[10px] sm:text-[11px] translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
          <Eye size={14} className="text-[#8f6f33]" /> Voir le modèle
        </span>
      </div>
    </div>
  );

  const caption = (
    <div className={`flex-1 flex flex-col text-center ${compact ? "px-1.5 pt-3 pb-2" : "px-3 pt-5 pb-3"}`}>
      {eyebrow && (
        <p className={`pl-[0.3em] font-medium uppercase text-[#8f6f33] ${compact ? "text-[8.5px] tracking-[0.22em]" : "text-[10px] tracking-[0.3em]"}`}>
          {eyebrow}
        </p>
      )}
      <h3 className={`font-serif not-italic text-[#1d120a] leading-tight transition-colors group-hover:text-[#8f6f33] ${compact ? "mt-1 text-base sm:text-lg" : "mt-1.5 text-xl sm:text-2xl"}`}>
        {name}
      </h3>
      <div aria-hidden className={`flex items-center justify-center gap-2 ${compact ? "mt-2" : "mt-3"}`}>
        <span className="h-px w-8 bg-gradient-to-l from-[#c9a45e] to-transparent" />
        <span className="w-1.5 h-1.5 rotate-45 bg-[#c9a45e]" />
        <span className="h-px w-8 bg-gradient-to-r from-[#c9a45e] to-transparent" />
      </div>
      {description && !compact && (
        <p className="mt-3 text-[13px] leading-relaxed text-[#3d3126] line-clamp-2 max-w-sm mx-auto">{description}</p>
      )}
      {href && !compact && (
        <span className="mt-auto pt-3 self-center">
          <span className="link-lux inline-block text-[10.5px]">Découvrir l&apos;invitation</span>
        </span>
      )}
    </div>
  );

  const frame = `card-lux group relative flex flex-col p-2 sm:p-2.5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(90,60,25,0.6),0_0_30px_-14px_rgba(233,196,120,0.7)] ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${frame} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a45e]`}>
        {visual}
        {caption}
      </Link>
    );
  }

  return (
    <article className={frame}>
      {onPreview ? (
        <button type="button" onClick={onPreview} aria-label={`Voir le modèle ${name}`} className="block w-full text-left">
          {visual}
        </button>
      ) : (
        visual
      )}
      {caption}
      {actions && <div className="px-2 pb-2 sm:px-3 sm:pb-3">{actions}</div>}
    </article>
  );
}
