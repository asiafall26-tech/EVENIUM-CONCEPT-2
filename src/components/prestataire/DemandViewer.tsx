import { useState } from 'react';
import { Eye, ImageIcon, Paperclip, FileText } from 'lucide-react';

const parseDescription = (desc: string) => {
  if (!desc) return null;
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
  if (!sections) return null;

  const inspirations: {name: string, url: string}[] = [];
  const documents: {name: string, url: string}[] = [];

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

  // Définition générique des clés de contenu métier
  const genericSections = [
    { key: "BESOIN PRINCIPAL", label: "Besoin principal", isList: false },
    { key: "DÉTAILS SPÉCIFIQUES", label: "Détails spécifiques", isList: true },
    { key: "CONTRAINTES", label: "Contraintes", isList: true },
    { key: "PRÉFÉRENCES", label: "Préférences", isList: true },
    { key: "DESCRIPTION", label: "Description libre", isList: false }
  ];

  return (
    <div className="space-y-10">
      
      {/* 1. SECTION : Informations dynamiques reçues */}
      <div className="space-y-6">
        {genericSections.map(({ key, label, isList }) => {
          const content = sections[key];
          if (!content) return null;

          return (
            <div key={key} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b8924a]"></span> {label}
              </h4>
              {isList ? (
                <ul className="space-y-2.5 text-sm text-gray-800">
                  {content.split('\n').filter(l => l.trim()).map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#b8924a] mt-0.5 opacity-70">•</span>
                      <span className="leading-relaxed">{line.replace(/^- /, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
              )}
            </div>
          );
        })}

        {/* Notes finales ou messages */}
        {(sections["MESSAGE"] || sections["MESSAGE FINAL"]) && (
          <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Message de l'organisateur
            </h4>
            <p className="text-gray-700 text-sm italic whitespace-pre-wrap leading-relaxed">
              "{sections["MESSAGE"] || sections["MESSAGE FINAL"]}"
            </p>
          </div>
        )}
      </div>

      {/* 2. SECTION : Inspirations */}
      {inspirations.length > 0 && (
        <div className="border-t border-gray-100 pt-8">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon size={18} className="text-[#b8924a]"/> Inspirations visuelles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {inspirations.map((img, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300" onClick={() => setLightboxImage(img.url)}>
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" size={28} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECTION : Pièces jointes */}
      {documents.length > 0 && (
        <div className="border-t border-gray-100 pt-8">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
            <Paperclip size={18} className="text-[#b8924a]"/> Documents joints
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#b8924a] shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <FileText size={22} className="text-gray-400 group-hover:text-[#b8924a] transition-colors" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Document attaché</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border hover:bg-white hover:border-gray-300 transition-all">Voir</a>
                  <a href={doc.url} download className="text-xs font-bold text-[#b8924a] bg-yellow-50/50 border border-yellow-100 px-4 py-2 rounded-xl hover:bg-[#b8924a] hover:text-white transition-all shadow-sm">Télécharger</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox pour les images */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Inspiration zoom" className="max-w-[90vw] max-h-[90vh] object-contain select-none shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
