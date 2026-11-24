import Image from "next/image";
import Link from "next/link";
import { Eye, PlayCircle, FileImage, Sparkles, Heart } from "lucide-react";

type Kind = "animée" | "carte" | "voeu" | "mot_doux" | "couple";

interface ModelCardProps {
  name: string;
  image: string;
  kind: Kind;
  /** Petit sur-titre (catégorie ou collection) */
  eyebrow?: string;
  description?: string;
  /** Pastille en haut à droite (« Signature », « Nouveau »…) */
  badge?: string;
  /** Lien de toute la carte ; sans lien, `onPreview` rend l'image cliquable */
  href?: string;
  onPreview?: () => void;
  /** Boutons placés sous la carte (tunnel de création) */
  actions?: React.ReactNode;
  /** Version resserrée pour les grilles compactes */
  compact?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Présentation simple, moderne et esthétique d'un modèle d'invitation :
 * Image plein format épurée, badge flottant discret, typographie sobre et soignée.
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
  sizes = "(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
  priority,
  className = "",
}: ModelCardProps) {
  const visual = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg sm:rounded-xl bg-neutral-100 shadow-2xs">
      <Image
        src={image}
        alt={`Modèle d'invitation ${name}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Badges discrets et élégants */}
      <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 right-1 sm:right-1.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-1.5 py-0.5 text-[8px] font-medium text-neutral-800 shadow-2xs border border-white/70">
          {kind === "voeu" ? (
            <>
              <Sparkles size={8} className="text-amber-500" />
              <span>Vœux</span>
            </>
          ) : kind === "mot_doux" ? (
            <>
              <Heart size={8} className="text-rose-500 fill-rose-500" />
              <span>Mot doux</span>
            </>
          ) : kind === "couple" ? (
            <>
              <Heart size={8} className="text-purple-500" />
              <span>Couple</span>
            </>
          ) : kind === "animée" ? (
            <>
              <PlayCircle size={8} className="text-[#b8924a]" />
              <span>3D Animé</span>
            </>
          ) : (
            <>
              <FileImage size={8} className="text-gray-600" />
              <span>Prestige</span>
            </>
          )}
        </span>

        {badge && (
          <span className="rounded-full bg-neutral-900/90 backdrop-blur-md px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-[#f5dfaa] shadow-2xs">
            {badge}
          </span>
        )}
      </div>

      {/* Survol élégant avec bouton Aperçu rapide */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-white text-neutral-900 text-[10px] font-semibold shadow-md flex items-center gap-1 transform scale-95 group-hover:scale-100 transition-transform duration-300">
          <Eye size={10} className="text-[#b8924a]" />
          <span>Aperçu</span>
        </span>
      </div>
    </div>
  );

  const caption = (
    <div className="px-0.5 pt-1.5 pb-0.5">
      <div>
        {eyebrow && (
          <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-[#9a7b38] mb-0.5 truncate">
            {eyebrow}
          </p>
        )}
        <h3 className="font-serif text-neutral-900 font-bold leading-tight transition-colors duration-200 group-hover:text-[#b8924a] text-xs sm:text-[13px] truncate">
          {name}
        </h3>
      </div>
    </div>
  );

  const cardStyle = `group relative flex flex-col p-1 sm:p-1.5 rounded-xl bg-white border border-neutral-200/80 hover:border-[#b8924a]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(184,146,74,0.12)] transition-all duration-300 hover:-translate-y-0.5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${cardStyle} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8924a]`}>
        {visual}
        {caption}
      </Link>
    );
  }

  return (
    <article className={cardStyle}>
      {onPreview ? (
        <button
          type="button"
          onClick={onPreview}
          aria-label={`Voir le modèle ${name}`}
          className="block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8924a] rounded-2xl"
        >
          {visual}
          {caption}
        </button>
      ) : (
        <>
          {visual}
          {caption}
        </>
      )}
      {actions && <div className="pt-2">{actions}</div>}
    </article>
  );
}
