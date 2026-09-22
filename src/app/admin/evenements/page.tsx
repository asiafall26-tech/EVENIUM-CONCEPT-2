import { Search, Filter, MoreHorizontal, Eye, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { mockEvents } from "@/data/mock/events";

export default function AdminEventsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Événements</h1>
          <p className="text-gray-500 text-sm">Gérez et surveillez tous les événements créés sur la plateforme.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un événement..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} /> Filtrer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Nom de l'événement</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Organisateur</th>
              <th className="px-6 py-4 font-medium">Formule</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockEvents.map((event, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{event.name}</div>
                  <div className="text-xs text-gray-500">{event.location}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {event.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon size={14} className="text-gray-400" />
                    {event.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  Ndeye Astou
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    event.plan === 'Gold' ? 'bg-[#F9F5EC] text-[#B8860B]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {event.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    event.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      event.status === 'published' ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                    {event.status === 'published' ? 'Actif' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors" title="Voir les détails">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Affichage de 1 à {mockEvents.length} sur {mockEvents.length} événements</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
