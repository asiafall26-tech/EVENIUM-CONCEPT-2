import { mockEvents } from "@/data/mock/events";
import Link from "next/link";
import { Calendar, Plus, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-semibold">Vue Générale</h1>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Mes événements à venir</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEvents.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-accent transition-all flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="text-accent" />
                </div>
                
                <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-gray-50 rounded w-fit mb-4 text-gray-600">
                  <Calendar size={14} /> {event.date}
                </div>
                
                <h3 className="font-serif text-2xl font-semibold mb-2 pr-8">{event.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{event.location}</p>
                
                <div className="mt-auto grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Invités</p>
                    <p className="font-semibold text-lg">{event.guests.confirmed}<span className="text-sm text-gray-400 font-normal">/{event.guests.total}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Tâches</p>
                    <p className="font-semibold text-lg">{event.tasks.completed}<span className="text-sm text-gray-400 font-normal">/{event.tasks.total}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Formule</p>
                    <p className="font-semibold text-sm mt-1 text-accent">{event.plan}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          

        </div>
      </div>
    </div>
  );
}
