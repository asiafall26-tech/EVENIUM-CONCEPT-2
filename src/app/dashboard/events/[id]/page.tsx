"use client";

import { mockEvents } from "@/data/mock/events";
import { notFound } from "next/navigation";
import { Users, CheckCircle, Clock, Wallet, CheckSquare, Sparkles } from "lucide-react";
import { use } from "react";

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Event Header */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                {event.type}
              </span>
              <span className="text-gray-500 text-sm font-medium">{event.date} à {event.time}</span>
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-2">{event.name}</h1>
            <p className="text-gray-500">{event.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium mb-1">Formule choisie</p>
            <div className="flex items-center justify-end gap-1 text-accent font-semibold">
              <Sparkles size={16} /> {event.plan}
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${event.plan === "Gold" ? "lg:grid-cols-4" : "lg:grid-cols-2 max-w-2xl"} gap-6 mb-8`}>
        {/* Formule Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
            <Sparkles size={80} />
          </div>
          <div className="flex justify-between items-start mb-4 text-gray-600 font-medium relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" /> Formule {event.plan}
            </div>
            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {event.format === "Animée" ? "Vidéo" : "Statique"}
            </span>
          </div>
          <div className="mb-2 relative z-10">
            <span className="text-3xl font-semibold">
              {event.plan === "Premium" ? (event.format === "Animée" ? "10 000" : "7 500") : (event.format === "Animée" ? "20 000" : "15 000")}
            </span>
            <span className="text-gray-500 text-sm ml-1">FCFA</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Abonnement unique réglé</p>
          
          <ul className="text-xs text-gray-500 space-y-1.5 mt-auto relative z-10">
            {event.plan === "Gold" ? (
              <>
                <li>• Accès prestataires</li>
                <li>• Suivi du budget global</li>
                <li>• To-do list & Planning</li>
              </>
            ) : (
              <>
                <li>• Envoi d'invitations</li>
                <li>• Suivi des réponses (RSVP)</li>
                <li>• Galerie de modèles</li>
              </>
            )}
          </ul>
        </div>

        {/* Budget Card */}
        {event.plan === "Gold" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
              <Wallet size={18} /> Budget
            </div>
            <div className="mb-2">
              <span className="text-3xl font-semibold">{event.budget.spent.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-1">FCFA dépensés</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Sur un total de {event.budget.total.toLocaleString()} FCFA</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-auto overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(event.budget.spent / event.budget.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Guests Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
            <Users size={18} /> Invités ({event.guests.total})
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> Confirmés</span>
              <span className="font-semibold text-green-700">{event.guests.confirmed}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-amber-500"><Clock size={16} /> En attente</span>
              <span className="font-semibold text-amber-600">{event.guests.pending}</span>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        {event.plan === "Gold" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
              <CheckSquare size={18} /> To-do List
            </div>
            <div className="mb-2">
              <span className="text-3xl font-semibold">{event.tasks.completed}</span>
              <span className="text-gray-500 text-sm ml-1">/ {event.tasks.total} tâches</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{event.tasks.total - event.tasks.completed} tâches restantes</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-auto overflow-hidden">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${(event.tasks.completed / event.tasks.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
