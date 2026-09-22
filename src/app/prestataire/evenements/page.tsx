"use client";

import { Search, Filter, Calendar as CalendarIcon, MapPin, Clock, Users, CheckCircle, X, FileText, Phone, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";

export default function PrestataireEvenementsPage() {
  const [evenements, setEvenements] = useState([
    { id: 1, name: "Mariage Astou & Ali", type: "Mariage", date: "24 Oct 2026", time: "18:00 - 02:00", location: "Hôtel Terrou-Bi, Dakar", guests: 300, status: "confirmed", amount: "850 000 FCFA" },
    { id: 2, name: "Dîner de Gala Annuel", type: "Corporate", date: "15 Nov 2026", time: "20:00 - 23:00", location: "King Fahd Palace", guests: 150, status: "confirmed", amount: "1 200 000 FCFA" },
    { id: 3, name: "Anniversaire Sophie", type: "Anniversaire", date: "05 Déc 2026", time: "15:00 - 19:00", location: "Villa Privée, Almadies", guests: 50, status: "pending", amount: "250 000 FCFA", client: "Fatou Sow", phone: "+221 76 000 00 00", notes: "Besoin de menus enfants (10)." },
  ]);

  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<typeof evenements[0] | null>(null);

  const filteredEvents = useMemo(() => {
    return evenements.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()));
  }, [evenements, search]);

  const toggleStatus = (id: number) => {
    setEvenements(evenements.map(e => e.id === id ? { ...e, status: e.status === 'confirmed' ? 'pending' : 'confirmed' } : e));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Mes Prestations</h1>
          <p className="text-gray-500 text-sm">Gérez les événements pour lesquels vous avez été engagé.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un événement..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} /> Filtrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => toggleStatus(evt.id)}
                    title="Cliquez pour changer le statut"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      evt.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {evt.status === 'confirmed' ? 'Confirmé' : 'En attente d\'acompte'}
                  </button>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {evt.type}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{evt.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">Montant Prestation</p>
                <p className="font-bold text-gray-900">{evt.amount}</p>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{evt.date}</p>
                  <p className="text-xs">{evt.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 truncate max-w-[120px]">{evt.location}</p>
                  <a href="#" className="text-xs text-[#B8860B] hover:underline">Voir sur la carte</a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{evt.guests}</p>
                  <p className="text-xs">Invités prévus</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                  NA
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                  +2
                </div>
              </div>
              <button onClick={() => setSelectedEvent(evt)} className="text-sm font-semibold text-[#B8860B] hover:text-[#996B00] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 shadow-sm">
                Détails de la mission &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Détails de la mission */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Détails de la mission" maxWidth="lg">
        {selectedEvent && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedEvent.name}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {selectedEvent.type}
                </span>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedEvent.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
                <p className="font-bold text-lg text-[#B8860B] mt-2">{selectedEvent.amount}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                    <CalendarIcon size={16} className="text-[#B8860B]" /> Date & Heure
                  </div>
                  <p className="font-bold text-gray-900">{selectedEvent.date}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                    <MapPin size={16} className="text-[#B8860B]" /> Lieu
                  </div>
                  <p className="font-bold text-gray-900 truncate" title={selectedEvent.location}>{selectedEvent.location}</p>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Ouvrir Maps</a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-gray-400" /> Informations Client
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{selectedEvent.client}</p>
                    <p className="text-sm text-gray-500">{selectedEvent.guests} invités prévus</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Appeler">
                      <Phone size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center hover:bg-[#E8DCC4] transition-colors" title="Contacter">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" /> Notes pour la prestation
                </h4>
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {selectedEvent.notes}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setSelectedEvent(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Fermer
              </button>
              <button className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
                Télécharger la fiche (PDF)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
