"use client";

import { useState, useEffect } from "react";
import { X, Upload, AlertCircle, CheckCircle2, Trash2, Edit3, ArrowRight, FileSpreadsheet, Users, ShieldAlert } from "lucide-react";
import { ParsedGuestRow, normalizePhoneNumber, isValidPhone, isValidEmail } from "@/lib/guestImportUtils";
import { importGuestsAction } from "@/app/actions/guestsImport";

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  initialGuests: ParsedGuestRow[];
  fileName: string;
  onImportSuccess: (count: number) => void;
}

export function GuestImportModal({
  isOpen,
  onClose,
  eventId,
  initialGuests,
  fileName,
  onImportSuccess,
}: GuestImportModalProps) {
  const [guests, setGuests] = useState<ParsedGuestRow[]>(initialGuests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setGuests(initialGuests);
    setErrorMsg(null);
  }, [initialGuests, isOpen]);

  if (!isOpen) return null;

  // Re-valider une ligne après modification
  const revalidateRow = (row: ParsedGuestRow, allRows: ParsedGuestRow[]): ParsedGuestRow => {
    const errors: string[] = [];
    const normalizedTel = normalizePhoneNumber(row.telephone);
    const cleanEmail = row.email ? row.email.toLowerCase().trim() : "";

    if (!row.prenom.trim() && !row.nom.trim()) {
      errors.push("Prénom ou Nom manquant");
    }
    if (!normalizedTel && !cleanEmail) {
      errors.push("Téléphone ou Email obligatoire");
    }
    if (normalizedTel && !isValidPhone(normalizedTel)) {
      errors.push("Format téléphone invalide");
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      errors.push("Format email invalide");
    }

    const fullName = [row.prenom.trim(), row.nom.trim()].filter(Boolean).join(" ") || "Invité sans nom";

    return {
      ...row,
      fullName,
      telephone: normalizedTel,
      email: cleanEmail,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFieldChange = (index: number, field: keyof ParsedGuestRow, value: any) => {
    setGuests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      copy[index] = revalidateRow(copy[index], copy);
      return copy;
    });
  };

  const handleDeleteRow = (index: number) => {
    setGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const validGuests = guests.filter((g) => g.isValid);
  const errorGuests = guests.filter((g) => !g.isValid);

  const handleConfirmImport = async () => {
    if (validGuests.length === 0) {
      setErrorMsg("Aucun invité valide à importer.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = validGuests.map((g) => ({
      fullName: g.fullName,
      telephone: g.telephone || null,
      email: g.email || null,
      nombre_accompagnants: g.accompagnants,
      groupe: g.groupe || "Général",
    }));

    const res = await importGuestsAction(eventId, payload);

    if (res.success) {
      onImportSuccess(res.count ?? validGuests.length);
      onClose();
    } else {
      setErrorMsg(res.error || "Une erreur est survenue lors de l'import.");
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        {/* En-tête de la modale */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-[#fcfaf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5eee1] text-[#8f6f33] flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-gray-900">
                Aperçu de l&apos;import des invités
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Fichier : <span className="font-mono text-gray-700 font-semibold">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-2 border border-gray-200 shadow-xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Synthèse des statuts avant import */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="font-medium text-gray-600 flex items-center gap-1.5">
              <Users size={14} /> Total détecté : <strong>{guests.length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> {validGuests.length} valides et prêts
            </span>
            {errorGuests.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-100/80 text-rose-800 font-semibold flex items-center gap-1">
                <AlertCircle size={13} /> {errorGuests.length} à corriger ou supprimer
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 italic">
            Indicatif +221 appliqué par défaut aux numéros locaux
          </span>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tableau interactif d'aperçu & correction */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbf7f0] text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                  <tr>
                    <th className="px-3 py-2.5">Prénom</th>
                    <th className="px-3 py-2.5">Nom</th>
                    <th className="px-3 py-2.5">Téléphone</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5 text-center">Places</th>
                    <th className="px-3 py-2.5">Validation</th>
                    <th className="px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {guests.map((g, idx) => (
                    <tr
                      key={idx}
                      className={g.isValid ? "hover:bg-gray-50/60" : "bg-rose-50/40 hover:bg-rose-50/70"}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={g.prenom}
                          onChange={(e) => handleFieldChange(idx, "prenom", e.target.value)}
                          placeholder="Prénom"
                          className="w-24 sm:w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#b8924a] outline-none"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={g.nom}
                          onChange={(e) => handleFieldChange(idx, "nom", e.target.value)}
                          placeholder="Nom"
                          className="w-24 sm:w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#b8924a] outline-none"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={g.telephone}
                          onChange={(e) => handleFieldChange(idx, "telephone", e.target.value)}
                          placeholder="+221..."
                          className={`w-32 px-2 py-1 font-mono text-[11px] bg-white border rounded-lg focus:ring-1 focus:ring-[#b8924a] outline-none ${
                            !g.telephone && !g.email
                              ? "border-rose-300 bg-rose-50/50"
                              : g.telephone && !isValidPhone(g.telephone)
                              ? "border-rose-400 text-rose-700 font-bold"
                              : "border-gray-200"
                          }`}
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="email"
                          value={g.email}
                          onChange={(e) => handleFieldChange(idx, "email", e.target.value)}
                          placeholder="email@example.com"
                          className={`w-36 sm:w-44 px-2 py-1 text-[11px] bg-white border rounded-lg focus:ring-1 focus:ring-[#b8924a] outline-none ${
                            !g.telephone && !g.email
                              ? "border-rose-300 bg-rose-50/50"
                              : g.email && !isValidEmail(g.email)
                              ? "border-rose-400 text-rose-700 font-bold"
                              : "border-gray-200"
                          }`}
                        />
                      </td>

                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={g.places}
                          onChange={(e) => {
                            const p = Math.max(1, parseInt(e.target.value, 10) || 1);
                            handleFieldChange(idx, "places", p);
                            handleFieldChange(idx, "accompagnants", Math.max(0, p - 1));
                          }}
                          className="w-14 text-center px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#b8924a] outline-none"
                        />
                      </td>

                      <td className="px-3 py-2">
                        {g.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} /> Prêt
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 cursor-help"
                            title={g.errors.join(", ")}
                          >
                            <AlertCircle size={12} /> {g.errors[0]}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pied de la modale */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {errorGuests.length > 0 ? (
              <span>
                ⚠️ Seules les <strong>{validGuests.length} lignes valides</strong> seront importées avec le statut{" "}
                <span className="font-semibold text-gray-700">« Non envoyé »</span>.
              </span>
            ) : (
              <span>
                ✓ Tous les <strong>{validGuests.length} invités</strong> sont prêts à être importés avec le statut{" "}
                <span className="font-semibold text-gray-700">« Non envoyé »</span>.
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isSubmitting || validGuests.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#f7e7b4] text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#f7e7b4] border-t-transparent rounded-full animate-spin" />
                  <span>Importation en cours...</span>
                </>
              ) : (
                <>
                  <Upload size={14} className="text-[#c9a45e]" />
                  <span>Confirmer l&apos;import ({validGuests.length} invité{validGuests.length > 1 ? "s" : ""})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
