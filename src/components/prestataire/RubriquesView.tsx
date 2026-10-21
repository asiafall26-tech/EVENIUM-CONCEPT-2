import { isRubriqueFilled, parseRubriques } from "@/lib/rubriques";

/** Affichage des rubriques personnalisées d'une offre ou d'un profil (vitrines organisateur). */
export function RubriquesView({ value, className = "" }: { value: unknown; className?: string }) {
  const list = parseRubriques(value).filter(isRubriqueFilled);
  if (!list.length) return null;
  return (
    <div className={`space-y-8 ${className}`}>
      {list.map((r) => (
        <section key={r.id}>
          <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-3">{r.title}</h3>
          {r.kind === "texte" && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.text}</p>}
          {r.kind === "liste" && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(r.items ?? []).filter((x) => x.trim()).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-[#b8924a] mt-0.5">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {r.kind === "infos" && (
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(r.rows ?? []).filter((x) => x.value.trim()).map((row, i) => (
                <div key={i} className="rounded-xl bg-[#f5eee1] border border-[#e4d8c4] px-4 py-3">
                  <dt className="text-[10px] text-[#8f6f33] uppercase tracking-wider font-bold">{row.label}</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
