"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Plus, CalendarDays, X, Users, Phone, Mail, FileText, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";

export default function PrestatairePlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Oct 2026 by default
  const [unavailabilities, setUnavailabilities] = useState<string[]>(['2026-10-10', '2026-10-11']);
  
  const [events, setEvents] = useState([
    { id: 1, name: "Mariage Astou & Ali", date: "2026-10-24", time: "16:00", location: "Hôtel Terrou-Bi, Dakar", status: "upcoming", type: "Mariage", guests: 300, client: "Ndeye Astou", phone: "+221 77 123 45 67", notes: "Installation requise à 14h. Menu VIP." },
    { id: 2, name: "Dîner de Gala Annuel", date: "2026-11-15", time: "20:00", location: "King Fahd Palace", status: "upcoming", type: "Corporate", guests: 150, client: "Entreprise S.A", phone: "+221 77 999 88 77", notes: "Service à table." },
    { id: 3, name: "Cocktail Privé", date: "2026-09-15", time: "18:00", location: "Almadies", status: "completed", type: "Soirée", guests: 50, client: "Amina Diop", phone: "+221 76 000 00 00", notes: "Pas de notes." }
  ]);

  const [isAddUnavailabilityOpen, setIsAddUnavailabilityOpen] = useState(false);
  const [newUnavailability, setNewUnavailability] = useState("");
  const [selectedEventDetails, setSelectedEventDetails] = useState<typeof events[0] | null>(null);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: "",
    name: "",
    time: "",
    location: "",
    type: "Autre",
    guests: 0,
    client: "",
    phone: "",
    notes: ""
  });

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));

  const handleAddUnavailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnavailability) return;
    if (!unavailabilities.includes(newUnavailability)) {
      setUnavailabilities([...unavailabilities, newUnavailability]);
    }
    setIsAddUnavailabilityOpen(false);
    setNewUnavailability("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) return;
    
    setEvents([...events, {
      id: Date.now(),
      name: newEvent.name,
      date: newEvent.date,
      time: newEvent.time || "12:00",
      location: newEvent.location || "À définir",
      status: "upcoming",
      type: newEvent.type,
      guests: newEvent.guests || 0,
      client: newEvent.client || "Client Inconnu",
      phone: newEvent.phone || "",
      notes: newEvent.notes || ""
    }]);
    
    setIsAddEventOpen(false);
    setNewEvent({
      date: "", name: "", time: "", location: "", type: "Autre", guests: 0, client: "", phone: "", notes: ""
    });
  };

  const openAddEventModal = (dateStr?: string) => {
    setNewEvent(prev => ({ ...prev, date: dateStr || "" }));
    setIsAddEventOpen(true);
  };

  const nextUpcomingEvent = useMemo(() => {
    const upcoming = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  }, [events]);

  const completedEvents = useMemo(() => {
    return events.filter(e => e.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const changeEventStatus = (id: number, newStatus: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Planning</h1>
          <p className="text-gray-500 text-sm">Gérez vos disponibilités et consultez vos interventions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex text-sm font-semibold">
            <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-black">Mois</button>
            <button className="px-4 py-2 text-gray-500 hover:text-black transition-colors">Semaine</button>
          </div>
          <button onClick={() => openAddEventModal()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md transition-all">
            <Plus size={16} /> Planifier une intervention
          </button>
          <button onClick={() => setIsAddUnavailabilityOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition-all border border-gray-200">
            Bloquer une date
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Calendar View */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{monthNames[currentMonthIdx]} {currentYear}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-50 transition-colors shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-50 transition-colors shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
            {/* Days Header */}
            {daysOfWeek.map(day => (
              <div key={day} className="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}
            
            {/* Empty slots for start of month */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-white min-h-[100px] p-2 opacity-50" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const dayEvents = events.filter(e => e.date === dateStr);
              const isUnavailable = unavailabilities.includes(dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div 
                  key={day} 
                  onClick={() => !isUnavailable && openAddEventModal(dateStr)}
                  className={`bg-white min-h-[120px] p-2 border-t border-gray-100 transition-colors ${!isUnavailable ? 'hover:bg-gray-50 cursor-pointer' : ''} ${isUnavailable ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNFMkU4RjAiLz48L3N2Zz4=")]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-[#B8860B] text-white shadow-md' : dayEvents.length > 0 ? 'text-[#B8860B] bg-[#F9F5EC]' : 'text-gray-700'}`}>
                      {day}
                    </span>
                  </div>
                  
                  {dayEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      onClick={(e) => { e.stopPropagation(); setSelectedEventDetails(evt); }} 
                      className={`mt-1 p-2 rounded-lg text-xs font-semibold leading-tight shadow-sm truncate cursor-pointer transition-colors ${evt.status === 'completed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-[#B8860B] text-white hover:bg-[#996B00]'}`}
                    >
                      <div className="flex items-center gap-1 mb-1 opacity-80"><Clock size={10} /> {evt.time}</div>
                      {evt.name}
                    </div>
                  ))}

                  {isUnavailable && (
                    <div className="mt-1 p-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg text-xs font-semibold text-center bg-white/50 backdrop-blur-sm">
                      Indisponible
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Empty slots for end of month */}
            {Array.from({ length: (7 - ((startOffset + daysInMonth) % 7)) % 7 }).map((_, idx) => (
              <div key={`empty-end-${idx}`} className="bg-white min-h-[100px] p-2 opacity-50" />
            ))}
          </div>
        </div>

        {/* Upcoming event sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-3xl border border-gray-800 shadow-xl p-6 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#D4AF37]">
              <CalendarDays size={100} />
            </div>
            
            <div className="flex items-center gap-2 mb-6 z-10">
              <span className={`w-2.5 h-2.5 rounded-full ${nextUpcomingEvent?.status === 'ongoing' ? 'bg-green-500 animate-pulse' : 'bg-[#D4AF37] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]'}`}></span>
              <h3 className="font-bold text-gray-300 text-xs uppercase tracking-wider">
                {nextUpcomingEvent?.status === 'ongoing' ? 'Intervention en cours' : 'Prochaine intervention'}
              </h3>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              {nextUpcomingEvent ? (
                <>
                  <h4 className="font-serif text-2xl font-bold mb-1 text-white">{nextUpcomingEvent.name}</h4>
                  <p className="text-[#D4AF37] font-semibold text-sm mb-6 bg-[#D4AF37]/10 inline-block px-3 py-1 rounded-lg border border-[#D4AF37]/20 self-start">{nextUpcomingEvent.type}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <CalendarIcon size={16} className="text-[#D4AF37]" />
                      </div>
                      <span className="font-semibold capitalize">{formatDate(nextUpcomingEvent.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <Clock size={16} className="text-[#D4AF37]" />
                      </div>
                      <span className="font-semibold">{nextUpcomingEvent.time}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                        <MapPin size={16} className="text-[#D4AF37]" />
                      </div>
                      <span className="leading-snug font-semibold">{nextUpcomingEvent.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    {nextUpcomingEvent.status === 'upcoming' && (
                      <button onClick={() => changeEventStatus(nextUpcomingEvent.id, 'ongoing')} className="w-full py-3 bg-[#B8860B] hover:bg-[#996B00] text-white font-bold rounded-xl text-sm transition-colors shadow-lg">
                        Démarrer l'intervention
                      </button>
                    )}
                    {nextUpcomingEvent.status === 'ongoing' && (
                      <button onClick={() => changeEventStatus(nextUpcomingEvent.id, 'completed')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg flex justify-center items-center gap-2">
                        <CheckCircle size={18} /> Marquer comme terminée
                      </button>
                    )}
                    <button onClick={() => setSelectedEventDetails(nextUpcomingEvent)} className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors">
                      Voir la fiche technique
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <CheckCircle size={48} className="opacity-20 mb-4" />
                  <p>Aucune intervention prévue pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historique des événements */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Historique des interventions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {completedEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun historique disponible.</div>
          ) : (
            completedEvents.map(evt => (
              <div key={evt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{evt.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{formatDate(evt.date)} • {evt.location}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEventDetails(evt)} className="mt-4 sm:mt-0 text-sm font-semibold text-[#B8860B] hover:underline px-4 py-2 border border-gray-200 rounded-lg bg-white">
                  Voir les détails
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Unavailability */}
      <Modal isOpen={isAddUnavailabilityOpen} onClose={() => setIsAddUnavailabilityOpen(false)} title="Bloquer une date" maxWidth="md">
        <form onSubmit={handleAddUnavailability} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date à bloquer</label>
            <input 
              type="date" required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
              value={newUnavailability} onChange={e => setNewUnavailability(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500">Cette date apparaîtra comme indisponible dans votre calendrier pour les organisateurs.</p>
          
          <button type="submit" className="w-full py-3 mt-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
            Confirmer l'indisponibilité
          </button>
        </form>
      </Modal>

      {/* Modal Détails Fiche Technique */}
      <Modal isOpen={!!selectedEventDetails} onClose={() => setSelectedEventDetails(null)} title="Fiche technique détaillée" maxWidth="lg">
        {selectedEventDetails && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedEventDetails.name}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {selectedEventDetails.type}
                </span>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedEventDetails.status === 'completed' ? 'bg-gray-100 text-gray-600' : 
                  selectedEventDetails.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedEventDetails.status === 'completed' ? 'Terminée' : 
                   selectedEventDetails.status === 'ongoing' ? 'En cours' : 'À venir'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                    <CalendarIcon size={16} className="text-[#B8860B]" /> Date & Heure
                  </div>
                  <p className="font-bold text-gray-900 capitalize">{formatDate(selectedEventDetails.date)}</p>
                  <p className="text-sm text-gray-600">{selectedEventDetails.time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                    <MapPin size={16} className="text-[#B8860B]" /> Lieu
                  </div>
                  <p className="font-bold text-gray-900 truncate" title={selectedEventDetails.location}>{selectedEventDetails.location}</p>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Ouvrir Maps</a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-gray-400" /> Informations Client
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{selectedEventDetails.client}</p>
                    <p className="text-sm text-gray-500">{selectedEventDetails.guests} invités prévus</p>
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
                  <FileText size={18} className="text-gray-400" /> Notes & Consignes
                </h4>
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {selectedEventDetails.notes}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedEventDetails(null)} className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Planifier Événement */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Planifier une intervention" maxWidth="lg">
        <form onSubmit={handleAddEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de l'événement</label>
              <input 
                type="date" required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Heure d'intervention</label>
              <input 
                type="time" required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'événement</label>
            <input 
              type="text" required placeholder="Ex: Mariage Ndeye & Modou"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
              value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieu</label>
              <input 
                type="text" required placeholder="Ex: Radisson Blu"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'événement</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}
              >
                <option value="Mariage">Mariage</option>
                <option value="Corporate">Corporate / B2B</option>
                <option value="Soirée">Soirée Privée</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="font-bold text-sm text-gray-900 mb-3">Informations Client (Optionnel)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du client / Contact</label>
                <input 
                  type="text" placeholder="Ex: Ndeye Astou"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={newEvent.client} onChange={e => setNewEvent({...newEvent, client: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input 
                  type="tel" placeholder="Ex: +221 77 123 45 67"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={newEvent.phone} onChange={e => setNewEvent({...newEvent, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes ou consignes pour l'équipe</label>
            <textarea 
              rows={3} placeholder="Détails importants, restrictions alimentaires..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none resize-none"
              value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 mt-6 flex justify-end gap-2 border-t border-gray-100">
            <button type="button" onClick={() => setIsAddEventOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 bg-[#B8860B] text-white font-bold rounded-xl hover:bg-[#996B00] transition-colors shadow-lg">
              Ajouter au planning
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
