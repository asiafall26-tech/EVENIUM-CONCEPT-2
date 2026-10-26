"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Image as ImageIcon, Layers, Lock, Music, Type, Unlock, LayoutList } from "lucide-react";
import { AudioField, PhotoField, inputCls } from "@/components/invitations/velours/VeloursStudio";
import { modelAssetUrl } from "@/lib/customModelImport";
import { MUSIC, customModelUrl, type CustomField, type CustomModelRow, type CustomValues } from "@/lib/customModels";

interface Props {
  model: Pick<CustomModelRow, "slug" | "entry" | "name">;
  fields: CustomField[];
  values: CustomValues;
  onChange: (values: CustomValues) => void;
  /** Admin : renommer les éléments et choisir ce que le client peut modifier */
  admin?: boolean;
  onFieldsChange?: (fields: CustomField[]) => void;
  /** Carte statique : pas de musique */
  isStatic?: boolean;
  /** Menu « Musique » dans la liste (le studio admin a son propre onglet) */
  musicMenu?: boolean;
  onViewFullScreen?: () => void;
}

interface Menu {
  id: string;
  label: string;
  icon: typeof Type;
  fields: CustomField[];
  music?: boolean;
}

const ICON = { text: Type, image: ImageIcon, audio: Music };

/** Bloc musique : musique d'ambiance (banque de sons) + musiques présentes dans le modèle */
export function CustomMusicFields({
  model,
  fields,
  values,
  onChange,
}: {
  model: Pick<CustomModelRow, "slug" | "entry">;
  fields: CustomField[];
  values: CustomValues;
  onChange: (v: CustomValues) => void;
}) {
  const asset = (src: string) => (src ? modelAssetUrl(model.slug, model.entry, src) : src);
  return (
    <div className="space-y-4">
      <AudioField
        label="Musique d'ambiance de l'invitation"
        value={{
          url: values[MUSIC.url] ?? "",
          title: values[MUSIC.title] ?? "",
          start: Number(values[MUSIC.start]) || 0,
          end: Number(values[MUSIC.end]) || 0,
        }}
        onChange={(a) => onChange({ ...values, [MUSIC.url]: a.url, [MUSIC.title]: a.title, [MUSIC.start]: String(a.start), [MUSIC.end]: String(a.end) })}
      />
      {fields
        .filter((f) => f.type === "audio")
        .map((f) => (
          <AudioField
            key={f.id}
            label={f.label}
            value={{ url: asset(values[f.id] ?? ""), title: values[`${f.id}__title`] ?? "", start: 0, end: 0 }}
            onChange={(a) => onChange({ ...values, [f.id]: a.url, [`${f.id}__title`]: a.title })}
          />
        ))}
    </div>
  );
}

/** Studio d'un modèle importé, présenté comme les studios des modèles Evenium : menus par section, étapes numérotées. */
export default function CustomSectionsEditor({ model, fields, values, onChange, admin, onFieldsChange, isStatic, musicMenu = true, onViewFullScreen }: Props) {
  const editable = useMemo(() => fields.filter((f) => (admin || f.clientEditable) && f.type !== "audio"), [fields, admin]);
  const audios = useMemo(() => fields.filter((f) => (admin || f.clientEditable) && f.type === "audio"), [fields, admin]);

  const menus = useMemo<Menu[]>(() => {
    const out: Menu[] = [];
    const hasSections = editable.some((f) => f.section);
    if (hasSections) {
      const order = [...new Set(editable.map((f) => f.section ?? 0))];
      for (const sec of order) {
        const list = editable.filter((f) => (f.section ?? 0) === sec);
        out.push({ id: `s${sec}`, label: list[0]?.sectionTitle || `Section ${sec}`, icon: LayoutList, fields: list });
      }
    } else {
      for (const type of ["text", "image"] as const) {
        const list = editable.filter((f) => f.type === type);
        if (list.length) out.push({ id: type, label: type === "text" ? "Textes" : "Images", icon: ICON[type], fields: list });
      }
    }
    if (musicMenu && !isStatic) out.push({ id: "music", label: "Musique", icon: Music, fields: audios, music: true });
    return out;
  }, [editable, audios, musicMenu, isStatic]);

  const [active, setActive] = useState<string>(menus[0]?.id ?? "all");
  const index = menus.findIndex((m) => m.id === active);
  const set = (id: string, v: string) => onChange({ ...values, [id]: v });
  const patchField = (id: string, patch: Partial<CustomField>) => onFieldsChange?.(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const asset = (src: string) => (src ? modelAssetUrl(model.slug, model.entry, src) : src);

  const renderField = (f: CustomField) => (
    <div key={f.id} className={`space-y-1.5 ${f.type !== "text" || f.multiline ? "xl:col-span-2" : ""} ${admin && !f.clientEditable ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-2">
        {admin ? (
          <input
            value={f.label}
            onChange={(e) => patchField(f.id, { label: e.target.value })}
            aria-label="Nom de l'élément"
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-700 border-b border-dashed border-gray-300 focus:border-[#b8924a] outline-none py-0.5"
          />
        ) : (
          <span className="flex-1 block text-xs font-semibold text-gray-700">{f.label}</span>
        )}
        {admin && (
          <button
            type="button"
            onClick={() => patchField(f.id, { clientEditable: !f.clientEditable })}
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${
              f.clientEditable ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
            title="Le client pourra-t-il modifier cet élément ?"
          >
            {f.clientEditable ? <Unlock size={11} /> : <Lock size={11} />} {f.clientEditable ? "Modifiable par le client" : "Verrouillé"}
          </button>
        )}
      </div>
      {f.type === "text" &&
        (f.multiline ? (
          <textarea rows={3} className={`${inputCls} resize-none`} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} />
        ) : (
          <input className={inputCls} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} />
        ))}
      {f.type === "image" && <PhotoField label="" value={asset(values[f.id] ?? "")} onChange={(v) => set(f.id, v)} />}
      {values[f.id] !== f.original && (
        <button type="button" onClick={() => set(f.id, f.original)} className="text-[11px] font-semibold text-[#8f6f33]">
          Remettre la valeur d&apos;origine
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#faf7f5]">
      {/* Barre du modèle */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200/70 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold shrink-0 max-w-[50%] truncate">{model.name}</span>
          <p className="text-xs text-gray-500 truncate hidden sm:block">Renseignez et personnalisez les informations de votre événement ci-dessous.</p>
        </div>
        <a
          href={customModelUrl(model)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs shrink-0"
        >
          <ExternalLink size={13} /> Démo modèle
        </a>
      </div>

      <div className="w-full flex-1 min-h-0 overflow-clip lg:overflow-hidden flex flex-col">
        <div className="w-full flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-clip lg:overflow-hidden">
          {/* Menus */}
          <div className="border-b border-gray-100 bg-gray-50 p-2 shrink-0 sticky top-[var(--studio-sticky-top,0px)] z-20 lg:static">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {menus.map((m) => {
                const on = active === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActive(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 max-w-[14rem] ${
                      on ? "bg-[#7a1a2e] text-white shadow-sm" : "text-gray-700 hover:bg-gray-200/60"
                    }`}
                  >
                    <m.icon size={14} className={on ? "text-white" : "text-[#7a1a2e]"} />
                    <span className="truncate">{m.label}</span>
                    {!m.music && (
                      <span className={`text-[10px] px-1.5 rounded-full font-bold ${on ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>{m.fields.length}</span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setActive("all")}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ml-auto ${
                  active === "all" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200/60"
                }`}
              >
                <Layers size={13} /> Tous les menus
              </button>
            </div>
          </div>

          {/* Contenu du menu */}
          <div className="studio-fields flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
            {menus.length === 0 && <p className="text-sm text-gray-500 text-center py-10">Aucun élément modifiable dans ce modèle.</p>}
            {menus.map((m, i) =>
              active === m.id || active === "all" ? (
                <section key={m.id} className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">{i + 1}</span>
                      <h4 className="font-serif text-lg font-bold text-gray-900">{m.label}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.music
                        ? "Musique jouée à l'ouverture de l'invitation : banque de sons Evenium ou votre propre fichier."
                        : `${m.fields.length} élément(s) à personnaliser dans cette partie de l'invitation.`}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70">
                    {m.music ? (
                      <CustomMusicFields model={model} fields={m.fields} values={values} onChange={onChange} />
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">{m.fields.map(renderField)}</div>
                    )}
                  </div>
                </section>
              ) : null
            )}
          </div>

          {/* Étapes */}
          {active !== "all" && menus.length > 0 && (
            <div className="px-3 sm:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0 sticky bottom-0 z-20 lg:static">
              <button
                type="button"
                onClick={() => index > 0 && setActive(menus[index - 1].id)}
                disabled={index <= 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200/60 disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <span className="text-xs font-medium text-gray-500">
                Menu {index + 1} sur {menus.length}
              </span>
              {index >= menus.length - 1 ? (
                onViewFullScreen ? (
                  <button
                    type="button"
                    onClick={onViewFullScreen}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-xs shadow-md border border-[#b8924a]/50"
                  >
                    <Eye size={14} /> Voir le résultat en plein écran
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">Toutes les étapes complétées</span>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(menus[index + 1].id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7a1a2e] text-white text-xs font-semibold shadow-xs"
                >
                  Suivant <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
