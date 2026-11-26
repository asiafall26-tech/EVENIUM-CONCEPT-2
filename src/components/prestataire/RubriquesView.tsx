import { isRubriqueFilled, parseRubriques } from "@/lib/rubriques";

/** Affichage des rubriques personnalisées d'une offre ou d'un profil (vitrines organisateur). */
export function RubriquesView({ value, className = "" }: { value: unknown; className?: string }) {
  const list = parseRubriques(value).filter(isRubriqueFilled);
  if (!list.length) return null;
  return (
    <div className={`space-y-6 ${className}`}>
      {list.map((r) => (
        <section key={r.id} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span className="text-[#b8924a]">✦</span> {r.title}
          </h3>
          {r.kind === "texte" && <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{r.text}</p>}
          {r.kind === "liste" && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(r.items ?? []).filter((x) => x.trim()).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800 font-medium">
                  <span className="text-[#8f6f33] mt-0.5 shrink-0">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {r.kind === "infos" && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(r.rows ?? []).filter((x) => x.value.trim()).map((row, i) => (
                <div key={i} className="rounded-xl bg-[#fbf7f0] border border-[#dcc59c] px-3.5 py-2.5">
                  <dt className="text-[10px] text-[#5c4217] uppercase tracking-wider font-extrabold">{row.label}</dt>
                  <dd className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
