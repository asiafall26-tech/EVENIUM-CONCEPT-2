"use client";

import { useState } from 'react';
import { Eye, ImageIcon, Paperclip, FileText, CheckCircle2, AlertCircle, Sparkles, Tag, Users, Calendar, MapPin, DollarSign, Briefcase } from 'lucide-react';

const parseDescription = (desc: string) => {
  if (!desc) return {};
  const sections: Record<string, string> = {};
  const regex = /===\s*(.*?)\s*===/g;
  let match;
  let lastIndex = 0;
  let lastKey = "";

  while ((match = regex.exec(desc)) !== null) {
    if (lastKey) {
      sections[lastKey] = desc.substring(lastIndex, match.index).trim();
    }
    lastKey = match[1].trim();
    lastIndex = match.index + match[0].length;
  }
  if (lastKey) {
    sections[lastKey] = desc.substring(lastIndex).trim();
  }
  
  if (Object.keys(sections).length === 0) {
    return { "DESCRIPTION": desc.trim() };
  }
  return sections;
};

export default function DemandViewer({ demande }: { demande: any }) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!demande) return null;

  const sections = parseDescription(demande.needs_description || demande.message || "");

  const inspirations: { name: string; url: string }[] = [];
  const documents: { name: string; url: string }[] = [];

  // 1. Extraire depuis la description
  if (sections["INSPIRATIONS & PIÈCES JOINTES"]) {
    const lines = sections["INSPIRATIONS & PIÈCES JOINTES"].split('\n');
    lines.forEach(line => {
      const match = line.match(/-\s+(.*?):\s+(https?:\/\/[^\s]+)/);
      if (match) {
        const name = match[1];
        const url = match[2];
        const ext = name.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          inspirations.push({ name, url });
        } else {
          documents.push({ name, url });
        }
      }
    });
  }

  // 2. Extraire depuis demande.files si présent
  if (Array.isArray(demande.files)) {
    demande.files.forEach((url: string, idx: number) => {
      if (typeof url !== 'string') return;
      const fileName = url.split('/').pop() || `Fichier_${idx + 1}`;
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        if (!inspirations.some(i => i.url === url)) inspirations.push({ name: fileName, url });
      } else {
        if (!documents.some(d => d.url === url)) documents.push({ name: fileName, url });
      }
    });
  }

  // Extraire les détails spécifiques
  const specificLines: string[] = [];
  if (sections["DÉTAILS SPÉCIFIQUES"]) {
    sections["DÉTAILS SPÉCIFIQUES"].split('\n').forEach(l => {
      const trimmed = l.trim().replace(/^- /, '');
      if (trimmed) specificLines.push(trimmed);
    });
  }

  // Extraire les ajouts / préférences
  const prefLines: string[] = [];
  const prefSection = sections["PRÉFÉRENCES & BESOINS"] || sections["PRÉFÉRENCES"];
  if (prefSection) {
    prefSection.split('\n').forEach(l => {
      const trimmed = l.trim().replace(/^- /, '');
      if (trimmed) prefLines.push(trimmed);
    });
  }

  // Options personnalisées directes
  if (demande.needs_options && typeof demande.needs_options === 'string') {
    demande.needs_options.split(',').forEach((opt: string) => {
      const trimmed = opt.trim();
      if (trimmed && !prefLines.some(p => p.includes(trimmed))) {
        prefLines.push(`Option demandée: ${trimmed}`);
      }
    });
  }

  const mainNeed = sections["BESOIN PRINCIPAL"] || sections["DESCRIPTION"] || demande.needs_description || "";
  const constraints = sections["CONTRAINTES"];
  const userMessage = sections["MESSAGE"] || sections["MESSAGE FINAL"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Synthèse du besoin en carte principale */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-850 rounded-2xl p-6 text-white shadow-md border border-stone-800">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-750">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
              <Sparkles size={13} /> Prestation sollicitée
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              {demande.service_name || "Prestation sur-mesure"}
            </h3>
          </div>
          {demande.needs_quantity && (
            <span className="px-3 py-1 rounded-xl bg-white/10 text-stone-200 text-xs font-semibold">
              Quantité : {demande.needs_quantity}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-stone-400 block mb-0.5">Budget indicatif client</span>
            <span className="font-serif text-lg font-bold text-[#d4af37]">
              {demande.budget_indicatif ? `${Number(demande.budget_indicatif).toLocaleString()} FCFA` : "Non spécifié"}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Invités / Participants</span>
            <span className="font-bold text-stone-100 text-sm">
              {demande.event_guests ? `${demande.event_guests} pers.` : (demande.events?.guestsCount ? `${demande.events.guestsCount} pers.` : "Non précisé")}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Date souhaitée</span>
            <span className="font-bold text-stone-100 text-sm">
              {demande.event_date || demande.events?.date || "À convenir"}
            </span>
          </div>
        </div>
      </div>

      {/* Description détaillée du besoin */}
      {mainNeed && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b8924a]" /> Description détaillée du besoin
          </h4>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap bg-stone-50 p-4 rounded-xl border border-stone-100">
            {mainNeed}
          </p>
        </div>
      )}

      {/* Détails spécifiques & Options cochées */}
      {(specificLines.length > 0 || prefLines.length > 0) && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-5">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Options, Inclusions & Besoins spécifiques
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...specificLines, ...prefLines].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-[#faf8f5] p-3 rounded-xl border border-stone-100 text-xs">
                <CheckCircle2 size={16} className="text-[#b8924a] shrink-0 mt-0.5" />
                <span className="font-medium text-stone-800 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contraintes particulières */}
      {constraints && (
        <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200/80 shadow-xs">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-700" /> Contraintes & Particularités indiquées
          </h4>
          <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
            {constraints}
          </p>
        </div>
      )}

      {/* Message additionnel de l'organisateur */}
      {userMessage && (
        <div className="bg-[#f5eee1] rounded-2xl p-6 border border-[#e4d8c4] shadow-xs">
          <h4 className="text-xs font-bold text-[#8f6f33] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8f6f33]" /> Note personnelle de l'organisateur
          </h4>
          <p className="text-xs text-stone-800 italic whitespace-pre-wrap leading-relaxed bg-white/70 p-3.5 rounded-xl">
            « {userMessage} »
          </p>
        </div>
      )}

      {/* Inspirations visuelles */}
      {inspirations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#b8924a]" /> Inspirations visuelles partagées ({inspirations.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {inspirations.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setLightboxImage(img.url)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300" 
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-200 flex items-center justify-center">
                  <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents joints */}
      {documents.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Paperclip size={16} className="text-[#b8924a]" /> Documents joints ({documents.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 hover:border-[#b8924a] transition-all group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-100">
                    <FileText size={18} className="text-stone-500 group-hover:text-[#b8924a] transition-colors" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-stone-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider">Document</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-all">
                    Ouvrir
                  </a>
                  <a href={doc.url} download className="text-xs font-bold text-[#8f6f33] bg-[#f5eee1] border border-[#e4d8c4] px-3 py-1.5 rounded-lg hover:bg-[#e4d8c4] transition-all">
                    Télécharger
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox pour les images */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer" 
          onClick={() => setLightboxImage(null)}
        >
          <img 
            src={lightboxImage} 
            alt="Inspiration zoom" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl select-none shadow-2xl cursor-default" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
