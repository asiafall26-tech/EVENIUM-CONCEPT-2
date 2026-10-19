"use client";

import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, X, ListTodo, AlertCircle, CalendarRange, User, ArrowRight, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import Image from "next/image";

export default function PrestatairePlanningPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Basic calendar logic
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters & Views
  const [filterType, setFilterType] = useState('Tous'); // Tous, Événements, Tâches, Indisponibilités, Rendez-vous
  const [viewMode, setViewMode] = useState('Mois'); // Mois, Semaine, Jour, Liste

  // Modals State
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [selectedDayString, setSelectedDayString] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    type: "indisponibilite", 
    date: "",
    isAllDay: true,
    startTime: "",
    endTime: ""
  });
  
  useEffect(() => {
    fetchPlanning();
  }, []);

  const parseEventTitle = (rawTitle: string, rawType: string) => {
    let name = rawTitle;
    let timeString = null;
    let isAllDay = true;
    let startTime = "";
    let endTime = "";

    const timeMatch = name.match(/^\[(\d{2}:\d{2})-(\d{2}:\d{2})\]\s(.*)/);
    if (timeMatch) {
      startTime = timeMatch[1];
      endTime = timeMatch[2];
      timeString = `${startTime} - ${endTime}`;
      name = timeMatch[3];
      isAllDay = false;
    }

    let typeLabel = 'Événement Externe';
    let typeColor = 'bg-[#f5eee1] text-[#8f6f33] border-[#e4d8c4]'; // Default Evenium accent
    let icon = <CalendarRange size={12} />;

    if (rawType === 'evenement') {
      typeLabel = 'Prestation Evenium';
      typeColor = 'bg-[#f5eee1] text-[#8f6f33] border-[#e4d8c4]';
      icon = <CalendarRange size={12} />;
    } else if (rawType === 'indisponibilite') {
      typeLabel = 'Indisponibilité';
      typeColor = 'bg-red-50 text-red-600 border-red-100';
      icon = <AlertCircle size={12} />;
    } else if (rawType === 'tache') {
      typeLabel = 'Tâche';
      typeColor = 'bg-blue-50 text-blue-600 border-blue-100';
      icon = <CheckCircle2 size={12} />;
    } else if (rawType === 'rendez-vous') {
      typeLabel = 'Rendez-vous';
      typeColor = 'bg-green-50 text-green-600 border-green-100';
      icon = <User size={12} />;
    }

    return { name, timeString, isAllDay, startTime, endTime, typeLabel, typeColor, icon };
  };

  const fetchPlanning = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: customData } = await supabase
        .from('provider_events')
        .select('*')
        .eq('prestataire_id', user.id);

      const { data: confirmedData } = await supabase
        .from('demandes_devis')
        .select('*, events(*)')
        .eq('prestataire_id', user.id)
        .eq('status', 'Confirmé');

      const { data: acceptedDevisData } = await supabase
        .from('devis')
        .select('*, events(*)')
        .eq('prestataire_id', user.id)
        .eq('status', 'Accepté');
        
      const allEvents: any[] = [];
      const seenKeys = new Set<string>();
      
      if (customData) {
        customData.forEach(evt => {
          const parsed = parseEventTitle(evt.title, evt.type);
          const key = `${evt.date}_${parsed.name.toLowerCase().trim()}`;
          seenKeys.add(key);

          allEvents.push({
            id: evt.id,
            rawTitle: evt.title,
            rawType: evt.type,
            name: parsed.name,
            typeLabel: parsed.typeLabel,
            typeColor: parsed.typeColor,
            icon: parsed.icon,
            timeString: parsed.timeString,
            isAllDay: parsed.isAllDay,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
            date: evt.date,
            isCustom: true
          });
        });
      }
      
      if (confirmedData) {
        confirmedData.forEach(d => {
          const evtDate = d.events?.date || d.event_date;
          if (!evtDate) return;
          const evtName = d.events?.name || 'Prestation Evenium';
          const key = `${evtDate}_${evtName.toLowerCase().trim()}`;
          if (seenKeys.has(key)) return;
          seenKeys.add(key);

          allEvents.push({
            id: d.id,
            name: evtName,
            rawType: 'evenement',
            typeLabel: `Prestation Evenium - ${d.events?.type || d.event_type || 'Confirmé'}`,
            typeColor: 'bg-[#f5eee1] text-[#8f6f33] border-[#e4d8c4]',
            icon: <CalendarRange size={12} />,
            timeString: d.events?.time || d.event_time || null,
            isAllDay: !(d.events?.time || d.event_time),
            date: evtDate,
            location: d.events?.location || d.event_location,
            clientName: d.client_name || d.events?.name || 'Client',
            isCustom: false
          });
        });
      }

      if (acceptedDevisData) {
        acceptedDevisData.forEach(dev => {
          const evtDate = dev.events?.date;
          if (!evtDate) return;
          const evtName = dev.events?.name || 'Prestation Evenium';
          const key = `${evtDate}_${evtName.toLowerCase().trim()}`;
          if (seenKeys.has(key)) return;
          seenKeys.add(key);

          allEvents.push({
            id: `devis-${dev.id}`,
            name: evtName,
            rawType: 'evenement',
            typeLabel: `Prestation Evenium - ${dev.events?.type || 'Confirmé'}`,
            typeColor: 'bg-[#f5eee1] text-[#8f6f33] border-[#e4d8c4]',
            icon: <CalendarRange size={12} />,
            timeString: dev.events?.time || null,
            isAllDay: !dev.events?.time,
            date: evtDate,
            location: dev.events?.location,
            clientName: dev.events?.name || 'Client Evenium',
            isCustom: false
          });
        });
      }
      
      setEvents(allEvents);
    } else {
      setEvents([]);
    }
    setLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const finalTitle = (!formData.isAllDay && formData.startTime) 
      ? `[${formData.startTime}-${formData.endTime || formData.startTime}] ${formData.title}`
      : formData.title;

    if (editingEventId) {
      await supabase.from('provider_events').update({ title: finalTitle, type: formData.type, date: formData.date }).eq('id', editingEventId);
    } else {
      await supabase.from('provider_events').insert([{ prestataire_id: user.id, title: finalTitle, type: formData.type, date: formData.date }]);
    }
    
    fetchPlanning();
    closeModal();
    if (isDayModalOpen && selectedDayString === formData.date) setIsDayModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    const { error } = await supabase.from('provider_events').delete().eq('id', id);
    if (!error) {
      setEvents(events.filter(evt => evt.id !== id));
      setSelectedDayEvents(selectedDayEvents.filter(evt => evt.id !== id));
    }
  };

  const openDayModal = (dayEvents: any[], dateString: string) => {
    setSelectedDayEvents(dayEvents);
    setSelectedDayString(dateString);
    setIsDayModalOpen(true);
  };

  const openFormModal = (defaultType = "indisponibilite", dateOverride = "") => {
    setEditingEventId(null);
    setFormData({ 
      title: "", type: defaultType, date: dateOverride || selectedDayString || new Date().toISOString().split('T')[0],
      isAllDay: true, startTime: "", endTime: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: any) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.name, type: evt.rawType || "externe", date: evt.date,
      isAllDay: evt.isAllDay, startTime: evt.startTime || "", endTime: evt.endTime || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
  };

  const changeMonth = (offset: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  const goToToday = () => setCurrentDate(new Date());

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  // FILTERS
  const filteredEvents = events.filter(e => {
    if (filterType === 'Tous') return true;
    if (filterType === 'Événements') return e.rawType === 'externe' || e.rawType === 'evenement';
    if (filterType === 'Tâches') return e.rawType === 'tache';
    if (filterType === 'Indisponibilités') return e.rawType === 'indisponibilite';
    if (filterType === 'Rendez-vous') return e.rawType === 'rendez-vous';
    return true;
  });

  const currentMonthEvents = filteredEvents.filter(e => {
    if (!e.date) return false;
    const evtDate = new Date(e.date);
    return evtDate.getMonth() === currentDate.getMonth() && evtDate.getFullYear() === currentDate.getFullYear();
  });

  // STATS
  const currentMonthAllEvents = events.filter(e => {
    if (!e.date) return false;
    const evtDate = new Date(e.date);
    return evtDate.getMonth() === currentDate.getMonth() && evtDate.getFullYear() === currentDate.getFullYear();
  });
  const countEvents = currentMonthAllEvents.filter(e => e.rawType === 'externe' || e.rawType === 'evenement').length;
  const countTasks = currentMonthAllEvents.filter(e => e.rawType === 'tache').length;
  const countIndisp = currentMonthAllEvents.filter(e => e.rawType === 'indisponibilite').length;
  const countRdv = currentMonthAllEvents.filter(e => e.rawType === 'rendez-vous').length;

  // UPCOMING
  const upcomingEvents = events
    .filter(e => (e.rawType === 'externe' || e.rawType === 'evenement') && new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const filterButtons = [
    { label: 'Tous', color: 'bg-[#8f6f33] text-white', inactive: 'bg-[#f5eee1] text-[#8f6f33]', icon: <CalendarRange size={14} /> },
    { label: 'Événements', color: 'bg-[#8f6f33] text-white', inactive: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200', icon: <span className="w-2 h-2 rounded-full border-2 border-[#8f6f33]"></span> },
    { label: 'Tâches', color: 'bg-blue-600 text-white', inactive: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200', icon: <span className="w-2 h-2 rounded-full bg-blue-500"></span> },
    { label: 'Indisponibilités', color: 'bg-red-600 text-white', inactive: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200', icon: <span className="w-2 h-2 rounded-full bg-red-500"></span> },
    { label: 'Rendez-vous', color: 'bg-green-600 text-white', inactive: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200', icon: <span className="w-2 h-2 rounded-full bg-green-500"></span> }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 bg-[#fbf7f0] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Mon Planning <CalendarIcon size={28} className="text-[#8f6f33]" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez vos disponibilités, vos événements et vos tâches en un seul endroit.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openFormModal("tache")} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm">
            <Plus size={18} /> Ajouter une tâche
          </button>
          <button onClick={() => openFormModal("indisponibilite")} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-900 transition-all font-semibold text-sm shadow-md">
            <Plus size={18} /> Ajouter une indisponibilité
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map(btn => (
            <button key={btn.label} onClick={() => setFilterType(btn.label)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${filterType === btn.label ? btn.color : btn.inactive}`}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm overflow-hidden">
          {['Mois', 'Semaine', 'Jour', 'Liste'].map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === v ? 'bg-[#8f6f33] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* CALENDAR AREA */}
        <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          {viewMode === 'Mois' && (
            <>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize flex items-center gap-4">
                  {monthName}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={() => changeMonth(1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                {['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'].map(d => (
                  <div key={d} className="bg-white text-center text-[10px] font-bold text-gray-400 py-3">{d}</div>
                ))}

                {/* Blanks */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-gray-50/30 h-32"></div>
                ))}
                
                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                  const isToday = new Date().toISOString().split('T')[0] === dateString;
                  
                  const dayEvents = currentMonthEvents.filter(e => {
                    const d = new Date(e.date);
                    return d.getDate() === dayNumber;
                  });

                  return (
                    <div 
                      key={`day-${dayNumber}`} 
                      onClick={() => openDayModal(dayEvents, dateString)}
                      className={`bg-white h-32 p-2 flex flex-col cursor-pointer transition-colors hover:bg-gray-50 group relative`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-[#8f6f33] text-white shadow-sm' : 'text-gray-700'}`}>
                          {dayNumber}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"><Plus size={14} /></button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                        {dayEvents.map((evt, idx) => (
                          <div key={idx} className={`text-[10px] p-1.5 rounded-md border ${evt.typeColor} flex flex-col gap-0.5 leading-tight`}>
                            <div className="flex items-start gap-1 font-bold">
                              <span className="mt-0.5 shrink-0 opacity-80">{evt.icon}</span>
                              <span className="line-clamp-1">{evt.name}</span>
                            </div>
                            {evt.timeString && <span className="pl-4 opacity-70 text-[9px]"><Clock size={8} className="inline mr-0.5"/>{evt.timeString}</span>}
                            {evt.isAllDay && <span className="pl-4 opacity-70 text-[9px]"><Clock size={8} className="inline mr-0.5"/>Toute la journée</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SEMAINE VIEW */}
          {viewMode === 'Semaine' && (() => {
            const getWeekDays = () => {
              const current = new Date(currentDate);
              const week = [];
              const day = current.getDay();
              const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
              current.setDate(diff);
              for (let i = 0; i < 7; i++) {
                week.push(new Date(current));
                current.setDate(current.getDate() + 1);
              }
              return week;
            };
            const weekDays = getWeekDays();
            
            return (
              <>
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize flex items-center gap-4">
                    Semaine du {weekDays[0].getDate()} {weekDays[0].toLocaleString('fr-FR', { month: 'short' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronLeft size={18} /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                  {weekDays.map((d, i) => {
                    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const isToday = new Date().toISOString().split('T')[0] === dateString;
                    const dayEvents = filteredEvents.filter(e => e.date === dateString);
                    
                    return (
                      <div key={i} className="bg-white min-h-[400px] p-2 flex flex-col group transition-colors hover:bg-gray-50">
                        <div className="text-center mb-4 pb-2 border-b border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{d.toLocaleString('fr-FR', { weekday: 'short' })}</p>
                          <span className={`inline-flex w-7 h-7 mt-1 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-[#8f6f33] text-white shadow-sm' : 'text-gray-900'}`}>{d.getDate()}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {dayEvents.map((evt, idx) => (
                            <div key={idx} onClick={() => openEditModal(evt)} className={`cursor-pointer text-[10px] p-2 rounded-xl border shadow-sm ${evt.typeColor} flex flex-col gap-1`}>
                              <div className="font-bold flex items-center gap-1.5"><span className="opacity-80">{evt.icon}</span> <span className="line-clamp-1">{evt.name}</span></div>
                              {evt.timeString && <span className="opacity-80 font-medium"><Clock size={10} className="inline mr-1"/>{evt.timeString}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* JOUR VIEW */}
          {viewMode === 'Jour' && (() => {
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => e.date === dateString).sort((a,b) => (a.startTime || '24:00').localeCompare(b.startTime || '24:00'));
            
            return (
              <>
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize flex items-center gap-4">
                    {currentDate.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>
                
                <div className="space-y-4 max-w-3xl">
                  {dayEvents.length > 0 ? dayEvents.map((evt, idx) => (
                    <div key={idx} onClick={() => openEditModal(evt)} className="flex items-stretch gap-4 cursor-pointer group">
                      <div className="w-16 shrink-0 text-right font-bold text-gray-500 pt-1">
                        {evt.isAllDay ? 'Journée' : evt.startTime || '--:--'}
                      </div>
                      <div className="w-px bg-gray-200 relative">
                        <div className={`absolute top-2 -left-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${evt.rawType === 'tache' ? 'bg-blue-500' : evt.rawType === 'indisponibilite' ? 'bg-red-500' : evt.rawType === 'rendez-vous' ? 'bg-green-500' : 'bg-[#8f6f33]'}`}></div>
                      </div>
                      <div className={`flex-1 p-4 rounded-2xl border transition-all group-hover:shadow-md ${evt.typeColor}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base">{evt.name}</h4>
                          <span className="text-xs font-bold opacity-80">{evt.typeLabel}</span>
                        </div>
                        {evt.timeString && <p className="text-xs mt-1 font-medium opacity-90"><Clock size={12} className="inline mr-1"/>{evt.timeString}</p>}
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <CalendarIcon size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Votre journée est libre ✨</p>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* LISTE VIEW */}
          {viewMode === 'Liste' && (
            <>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize flex items-center gap-4">Agenda</h2>
              </div>
              <div className="space-y-3">
                {filteredEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0))).length > 0 ? 
                  filteredEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0))).map((evt, idx) => (
                  <div key={idx} onClick={() => openEditModal(evt)} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-[#e4d8c4] hover:shadow-sm cursor-pointer transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${evt.typeColor.split(' ')[0]} ${evt.typeColor.split(' ')[1]}`}>{evt.icon}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{evt.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{evt.typeLabel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">{new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{evt.timeString || (evt.isAllDay ? 'Toute la journée' : '')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">Aucun élément à venir.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          
          {/* Événements du mois */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarRange size={20} className="text-[#8f6f33]"/> Événements du mois
              </h3>
            </div>
            
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {currentMonthEvents.filter(e => e.rawType === 'evenement' || e.rawType === 'externe').length > 0 ? (
                currentMonthEvents.filter(e => e.rawType === 'evenement' || e.rawType === 'externe')
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((e, idx) => (
                  <div key={idx} onClick={() => openEditModal(e)} className="flex items-start gap-4 p-4 rounded-2xl bg-[#fbf7f0] border border-[#e4d8c4]/50 hover:border-[#b8924a] hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{new Date(e.date).toLocaleString('fr-FR', { month: 'short' })}</span>
                      <span className="text-lg font-black text-[#8f6f33] leading-none mt-1">{new Date(e.date).getDate()}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-gray-900 truncate mb-1 group-hover:text-[#8f6f33] transition-colors">{e.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{e.typeLabel}</p>
                      {e.timeString && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                          <Clock size={12} className="text-gray-400" /> {e.timeString}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <CalendarIcon size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Aucun événement ce mois-ci.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Day Detail Modal (Redesigned Premium) */}
      <Modal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} title="">
        <div className="pb-2">
          {/* Hero Header */}
          <div className="relative -mt-6 -mx-6 px-8 py-8 bg-[#fbf7f0] border-b border-[#e4d8c4]/40 rounded-t-3xl mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b8924a]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white border border-[#e4d8c4] text-[#8f6f33] text-xs font-bold rounded-full mb-3 shadow-sm uppercase tracking-wider">
                  Agenda du jour
                </span>
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  {selectedDayString ? new Date(selectedDayString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Détails'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{selectedDayEvents.length} activité(s) prévue(s)</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-4xl font-serif font-black text-[#8f6f33]">{selectedDayString ? new Date(selectedDayString).getDate() : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-8 px-2">
            <button onClick={() => { setIsDayModalOpen(false); openFormModal("tache", selectedDayString); }} className="flex-1 py-3 bg-white border border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"><CheckCircle2 size={16} /> Tâche</button>
            <button onClick={() => { setIsDayModalOpen(false); openFormModal("rendez-vous", selectedDayString); }} className="flex-1 py-3 bg-white border border-gray-100 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"><User size={16} /> RDV</button>
            <button onClick={() => { setIsDayModalOpen(false); openFormModal("indisponibilite", selectedDayString); }} className="flex-1 py-3 bg-white border border-gray-100 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"><AlertCircle size={16} /> Blocage</button>
          </div>

          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent px-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.sort((a,b) => (a.startTime || '24:00').localeCompare(b.startTime || '24:00')).map((evt, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                  
                  {/* Timeline Dot */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${evt.rawType === 'indisponibilite' ? 'bg-red-500 text-white' : evt.rawType === 'tache' ? 'bg-blue-500 text-white' : evt.rawType === 'rendez-vous' ? 'bg-green-500 text-white' : 'bg-[#b8924a] text-white'}`}>
                    {evt.icon}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-[#e4d8c4] hover:shadow-md relative group-hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${evt.rawType === 'indisponibilite' ? 'text-red-500' : evt.rawType === 'tache' ? 'text-blue-500' : evt.rawType === 'rendez-vous' ? 'text-green-500' : 'text-[#8f6f33]'}`}>{evt.typeLabel}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setIsDayModalOpen(false); openEditModal(evt); }} className="p-1 text-gray-400 hover:text-[#8f6f33] rounded"><MoreHorizontal size={14}/></button>
                        <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><X size={14}/></button>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug mb-2">{evt.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-medium">
                      {evt.timeString && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock size={10} /> {evt.timeString}</span>}
                      {evt.isAllDay && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">Toute la journée</span>}
                      {evt.location && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md line-clamp-1">{evt.location}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <CalendarIcon size={24} className="text-gray-300" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">Aucune activité</h3>
                <p className="text-sm text-gray-500">Votre agenda est libre pour cette journée.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEventId ? "Modifier l'élément" : "Ajouter au planning"}>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Titre..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="tache">Tâche</option>
              <option value="rendez-vous">Rendez-vous</option>
              <option value="indisponibilite">Indisponibilité</option>
              <option value="externe">Événement externe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input type="checkbox" checked={formData.isAllDay} onChange={(e) => setFormData({...formData, isAllDay: e.target.checked})} className="w-4 h-4 text-[#b8924a] focus:ring-[#b8924a] border-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-700">Toute la journée</span>
            </label>
            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Heure de début</label>
                  <input type="time" required={!formData.isAllDay} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Heure de fin</label>
                  <input type="time" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold mt-6 hover:bg-gray-900 transition-colors shadow-lg">Enregistrer</button>
        </form>
      </Modal>

    </div>
  );
}
