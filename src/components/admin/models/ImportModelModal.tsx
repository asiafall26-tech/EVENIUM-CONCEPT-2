"use client";

import { useRef, useState } from "react";
import { FileArchive, Loader2, UploadCloud } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { detectFields, modelAssetUrl, readModelFiles, uploadModelFiles } from "@/lib/customModelImport";
import { insertCustomModel, makeSlug } from "@/lib/customModels";

/** Importer un modèle (ZIP avec index.html et ses fichiers, ou une page HTML seule). */
export default function ImportModelModal({ onClose, onImported }: { onClose: () => void; onImported: (slug: string) => void }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!file) return setError("Choisissez un fichier .zip ou .html.");
    const modelName = name.trim() || file.name.replace(/\.[^/.]+$/, "");
    setError(null);
    try {
      setStep("Lecture du fichier…");
      const { files, entry } = await readModelFiles(file);
      const entryFile = files.find((f) => f.path === entry)!;

      setStep("Repérage des textes, images et musiques…");
      const { html, fields, cover } = detectFields(await entryFile.blob.text());
      entryFile.blob = new Blob([html], { type: "text/html" });

      const slug = makeSlug(modelName);
      setStep(`Envoi des fichiers… 0 / ${files.length}`);
      await uploadModelFiles(slug, files, (done, total) => setStep(`Envoi des fichiers… ${done} / ${total}`));

      setStep("Enregistrement du modèle…");
      await insertCustomModel(createClient(), {
        slug,
        name: modelName,
        entry,
        fields,
        content: {},
        cover_url: cover ? modelAssetUrl(slug, entry, cover) : null,
        invitation_type: "animée",
        event_types: ["Mariage"],
        status: "draft",
      });
      onImported(slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible.");
      setStep(null);
    }
  };

  return (
    <Modal isOpen onClose={step ? () => {} : onClose} title="Importer un modèle" maxWidth="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Un fichier <strong>.zip</strong> (la page <code>index.html</code> avec ses images, styles et musiques) ou une page <strong>.html</strong> seule.
          Les textes, images et musiques sont repérés automatiquement pour être modifiables dans le studio.
        </p>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-700 mb-1.5">Nom du modèle</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Jardin d'Orient"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b8924a]/30"
          />
        </label>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.html,.htm,application/zip,text/html"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError(null);
          }}
        />
        <button
          type="button"
          disabled={!!step}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-[#b8924a]/40 bg-[#fbf7f0] px-4 py-6 text-center"
        >
          {file ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FileArchive size={18} className="text-[#b8924a]" /> {file.name}
            </span>
          ) : (
            <span className="inline-flex flex-col items-center gap-1.5 text-sm font-semibold text-gray-700">
              <UploadCloud size={22} className="text-[#b8924a]" /> Choisir le fichier .zip ou .html
            </span>
          )}
        </button>

        {step && (
          <p className="flex items-center gap-2 text-sm text-[#6f5527]">
            <Loader2 size={16} className="animate-spin" /> {step}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" disabled={!!step} onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 disabled:opacity-50">
            Annuler
          </button>
          <button
            type="button"
            disabled={!!step || !file}
            onClick={run}
            className="px-5 py-3 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold disabled:opacity-50"
          >
            Importer
          </button>
        </div>
      </div>
    </Modal>
  );
}
