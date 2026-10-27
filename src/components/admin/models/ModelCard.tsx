"use client";

import type { ReactNode } from "react";
import { Camera, ExternalLink, EyeOff, FileArchive, Globe, Loader2, Pencil, Sparkles, Tags, Trash2 } from "lucide-react";
import { EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import type { InvitationKind } from "@/lib/modelDefaults";

export interface ModelCardAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Carte d'un modèle dans le studio. Commune aux modèles Evenium et aux modèles importés : chaque modèle,
 * présent ou à venir, a les mêmes actions (studio, renommer, classer, couverture, publier, retirer, voir, supprimer).
 * Elles sont toutes obligatoires, pour qu'aucun modèle ne puisse en être privé.
 */
interface Props {
  name: string;
  /** Nom d'origine, affiché quand le modèle a été renommé */
  originalName?: string;
  cover: string | null;
  status: { label: string; cls: string };
  /** « online » : sur le site ; « hidden » : retiré ; « draft » : jamais publié */
  presence: "online" | "hidden" | "draft";
  kind: InvitationKind;
  events: string[];
  info: string;
  busy: boolean;
  viewUrl: string;
  onOpen: () => void;
  onRename: () => void;
  onClassify: () => void;
  onCover: () => void;
  onPublish: () => void;
  onHide: () => void;
  onShow: () => void;
  onDelete: () => void;
  /** Actions propres à un type de modèle (ex. version d'origine) */
  extra?: ModelCardAction[];
}

const SMALL = "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold disabled:opacity-40 transition-colors";

export default function ModelCard(p: Props) {
  const buttons: ReactNode[] = [
    <button key="publish" type="button" disabled={p.busy} onClick={p.onPublish} className={`${SMALL} border-[#b8924a]/50 bg-[#fbf7f0] text-[#6f5527] hover:bg-[#f5ede0]`}>
      {p.busy ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publier
    </button>,
  ];
  if (p.presence === "online")
    buttons.push(
      <button key="hide" type="button" disabled={p.busy} onClick={p.onHide} className={`${SMALL} border-red-200 text-red-700 hover:bg-red-50`}>
        <EyeOff size={14} /> Retirer du site
      </button>
    );
  if (p.presence === "hidden")
    buttons.push(
      <button key="show" type="button" disabled={p.busy} onClick={p.onShow} className={`${SMALL} border-gray-200 text-gray-700 hover:bg-gray-50`}>
        <Globe size={14} /> Remettre en ligne
      </button>
    );
  buttons.push(
    <a key="view" href={p.viewUrl} target="_blank" rel="noopener noreferrer" className={`${SMALL} border-gray-200 text-gray-700 hover:bg-gray-50`}>
      <ExternalLink size={14} /> {p.presence === "online" ? "Voir sur le site" : "Voir le modèle"}
    </a>
  );
  for (const a of p.extra ?? [])
    buttons.push(
      <button key={a.label} type="button" disabled={p.busy || a.disabled} onClick={a.onClick} className={`${SMALL} border-gray-200 text-gray-700 hover:bg-gray-50`}>
        {a.icon} {a.label}
      </button>
    );
  buttons.push(
    <button
      key="delete"
      type="button"
      disabled={p.busy}
      onClick={p.onDelete}
      className={`${SMALL} border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 ${buttons.length % 2 === 0 ? "col-span-2" : ""}`}
    >
      <Trash2 size={14} /> Supprimer
    </button>
  );

  return (
    <article className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${p.presence === "hidden" ? "opacity-80" : ""}`}>
      <div className="relative h-48 bg-gray-900">
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt={p.name} className={`absolute inset-0 w-full h-full object-cover ${p.presence === "hidden" ? "grayscale" : ""}`} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#b8924a]/40">
            <FileArchive size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.status.cls}`}>{p.status.label}</span>
        <button
          type="button"
          onClick={p.onCover}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 hover:bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold"
        >
          <Camera size={13} /> Couverture
        </button>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-serif text-2xl text-white truncate drop-shadow-sm">{p.name}</h3>
            {p.originalName && p.originalName !== p.name && <p className="text-[11px] text-white/75 italic truncate">Origine : {p.originalName}</p>}
          </div>
          <button
            type="button"
            onClick={p.onRename}
            title="Modifier le nom de ce modèle"
            className="shrink-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
          >
            <Pencil size={15} />
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{p.kind === "carte" ? "Carte" : "Animée"}</span>
          {p.events.map((e) => (
            <span key={e} className="text-[11px] px-2 py-0.5 rounded-full bg-[#fbf7f0] border border-[#b8924a]/25 text-[#6f5527]">
              {EVENT_TYPE_ICONS[e as keyof typeof EVENT_TYPE_ICONS]} {e}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={p.onRename} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
              <Pencil size={12} /> Renommer
            </button>
            <button type="button" onClick={p.onClassify} className="inline-flex items-center gap-1 text-xs font-semibold text-[#8f6f33]">
              <Tags size={13} /> Classer
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{p.info}</p>
        <button
          type="button"
          onClick={p.onOpen}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] px-4 py-3 text-sm font-semibold hover:bg-black transition-all"
        >
          <Sparkles size={16} className="text-[#d9c08c]" /> Ouvrir dans le studio
        </button>
        <div className="grid grid-cols-2 gap-2">{buttons}</div>
      </div>
    </article>
  );
}
