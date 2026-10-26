"use client";

import { useMemo, useState } from "react";
import { LayoutList, Loader2, Music, Upload } from "lucide-react";
import StudioShell from "../StudioShell";
import { AudioField, PhotoField, inputCls } from "@/components/invitations/velours/VeloursStudio";
import { modelAssetUrl, uploadModelFiles } from "@/lib/customModelImport";
import {
  HIDDEN_KEY,
  MUSIC,
  RUBRIQUES_KEY,
  addedRubriques,
  customModelUrl,
  hiddenSections,
  type CustomField,
  type CustomModelRow,
  type CustomValues,
} from "@/lib/customModels";

interface Props {
  model: Pick<CustomModelRow, "slug" | "entry" | "name">;
  fields: CustomField[];
  values: CustomValues;
  onChange: (values: CustomValues) => void;
  /** Admin : renommer les éléments */
  admin?: boolean;
  onFieldsChange?: (fields: CustomField[]) => void;
  /** Carte statique : pas de musique */
  isStatic?: boolean;
  /** Menu « Musique » dans la liste (le studio admin a son propre onglet) */
  musicMenu?: boolean;
  onViewFullScreen?: () => void;
}

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

/** Vidéo du modèle : lien d'une vidéo MP4 ; l'admin peut aussi en importer une dans le dossier du modèle. */
function VideoField({ slug, admin, value, preview, onChange }: { slug: string; admin: boolean; value: string; preview: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const path = `media/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
      await uploadModelFiles(slug, [{ path, blob: file }]);
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-2">
      {preview && <video src={preview} muted playsInline controls className="w-full max-h-56 rounded-xl bg-black object-contain" />}
      <input
        className={inputCls}
        inputMode="url"
        value={value}
        placeholder="Lien d'une vidéo MP4 (https://…)"
        onChange={(e) => onChange(e.target.value)}
      />
      {admin && (
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-[#b8924a]/60 text-xs font-semibold text-[#8f6f33] cursor-pointer">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {busy ? "Import en cours…" : "Importer une vidéo (MP4)"}
          <input type="file" accept="video/mp4,video/webm,.mp4,.webm" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Studio d'un modèle importé, dans le même cadre que les studios des modèles Evenium (StudioShell) :
 * mêmes menus, mêmes étapes, même gestion des rubriques (supprimer, rétablir, ajouter).
 */
export default function CustomSectionsEditor({ model, fields, values, onChange, admin, onFieldsChange, isStatic, musicMenu = true, onViewFullScreen }: Props) {
  const editable = useMemo(() => fields.filter((f) => f.type !== "audio"), [fields]);
  const audios = useMemo(() => fields.filter((f) => f.type === "audio"), [fields]);
  const hidden = hiddenSections(values);
  const added = addedRubriques(values);

  // Une rubrique de la page = un menu du studio
  const sectionMenus = useMemo(() => {
    const order = [...new Set(editable.map((f) => String(f.section ?? 1)))];
    return order.map((sec) => {
      const list = editable.filter((f) => String(f.section ?? 1) === sec);
      return { section: sec, label: list[0]?.sectionTitle || `Rubrique ${sec}`, fields: list };
    });
  }, [editable]);
  const showMusic = musicMenu && !isStatic;

  const [active, setActive] = useState<string>(sectionMenus[0] ? `s${sectionMenus[0].section}` : "all");
  const set = (id: string, v: string) => onChange({ ...values, [id]: v });
  const patchField = (id: string, patch: Partial<CustomField>) => onFieldsChange?.(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const asset = (src: string) => (src ? modelAssetUrl(model.slug, model.entry, src) : src);

  const renderField = (f: CustomField) => (
    <div key={f.id} className={`space-y-1.5 ${(f.type !== "text" && f.type !== "link" && f.type !== "color") || f.multiline ? "2xl:col-span-2" : ""}`}>
      {admin ? (
        <input
          value={f.label}
          onChange={(e) => patchField(f.id, { label: e.target.value })}
          aria-label="Nom de l'élément"
          className="w-full bg-transparent text-xs font-semibold text-gray-700 border-b border-dashed border-gray-300 focus:border-[#b8924a] outline-none py-0.5"
        />
      ) : (
        <span className="block text-xs font-semibold text-gray-700">{f.label}</span>
      )}
      {f.type === "text" &&
        (f.multiline ? (
          <textarea rows={3} className={`${inputCls} resize-none`} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} />
        ) : (
          <input className={inputCls} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} />
        ))}
      {f.type === "image" && <PhotoField label="" value={asset(values[f.id] ?? "")} onChange={(v) => set(f.id, v)} />}
      {f.type === "link" && (
        <input
          className={inputCls}
          inputMode="url"
          value={values[f.id] ?? ""}
          placeholder="https://maps.google.com/?q=… · tel:+221… · https://wa.me/221…"
          onChange={(e) => set(f.id, e.target.value)}
        />
      )}
      {f.type === "color" && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(values[f.id] ?? "") ? values[f.id] : "#c6a15b"}
            onChange={(e) => set(f.id, e.target.value)}
            className="w-12 h-12 rounded-xl border border-gray-200 bg-white p-1 cursor-pointer"
            aria-label={f.label}
          />
          <input className={`${inputCls} font-mono`} value={values[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} />
        </div>
      )}
      {f.type === "video" && (
        <VideoField slug={model.slug} admin={!!admin} value={values[f.id] ?? ""} preview={asset(values[f.id] ?? "")} onChange={(v) => set(f.id, v)} />
      )}
      {values[f.id] !== f.original && (
        <button type="button" onClick={() => set(f.id, f.original)} className="text-[11px] font-semibold text-[#8f6f33]">
          Remettre la valeur d&apos;origine
        </button>
      )}
    </div>
  );

  const header = (n: number, label: string, desc: string) => (
    <div className="border-b border-gray-100 pb-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 shrink-0 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">{n}</span>
        <h4 className="font-serif text-lg font-bold text-gray-900">{label}</h4>
      </div>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
  const show = (id: string) => active === id || active === "all";

  return (
    <StudioShell
      title={model.name}
      demoUrl={customModelUrl(model)}
      menus={[
        ...sectionMenus.map((m) => ({ id: `s${m.section}`, label: m.label, icon: LayoutList, badge: m.fields.length, muted: hidden.includes(m.section) })),
        ...(showMusic ? [{ id: "music", label: "Musique", icon: Music }] : []),
      ]}
      active={active}
      onActive={setActive}
      onViewFullScreen={onViewFullScreen}
      sections={{
        defs: sectionMenus.map((m) => ({ key: m.section, label: m.label })),
        state: { hidden, rubriques: added },
        onChange: (st) => onChange({ ...values, [HIDDEN_KEY]: JSON.stringify(st.hidden), [RUBRIQUES_KEY]: JSON.stringify(st.rubriques) }),
      }}
    >
      {sectionMenus.length === 0 && !showMusic && <p className="text-sm text-gray-500 text-center py-10">Aucun élément modifiable dans ce modèle.</p>}
      {sectionMenus.map((m, i) =>
        show(`s${m.section}`) ? (
          <section key={m.section} className="space-y-4">
            {header(i + 1, m.label, `${m.fields.length} élément(s) à personnaliser dans cette rubrique.`)}
            <div className="p-4 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-200/70">
              {hidden.includes(m.section) ? (
                <p className="text-sm text-gray-500">
                  Cette rubrique est supprimée de l&apos;invitation. Vous pouvez la rétablir dans « Rubriques de l&apos;invitation ».
                </p>
              ) : (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">{m.fields.map(renderField)}</div>
              )}
            </div>
          </section>
        ) : null
      )}
      {showMusic && show("music") && (
        <section className="space-y-4">
          {header(sectionMenus.length + 1, "Musique", "Musique jouée à l'ouverture de l'invitation : banque de sons Evenium ou votre propre fichier.")}
          <div className="p-4 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-200/70">
            <CustomMusicFields model={model} fields={audios} values={values} onChange={onChange} />
          </div>
        </section>
      )}
    </StudioShell>
  );
}
