"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Circle, CheckCircle2, CheckSquare, Plus, Trash2, ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEvents } from "@/store/EventsContext";
import EventBreadcrumb from "@/components/dashboard/EventBreadcrumb";

type Task = {
  id: string;
  titre: string;
  is_completed: boolean;
};

export default function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const { events, isLoaded } = useEvents();

  const eventFromContext = events.find((e) => e.id === id);
  const [directEvent, setDirectEvent] = useState<any>(null);
  const [loadingDirect, setLoadingDirect] = useState(!eventFromContext);

  const event = eventFromContext || directEvent;

  useEffect(() => {
    if (eventFromContext) {
      setLoadingDirect(false);
      return;
    }

    const fetchDirect = async () => {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (data) {
          setDirectEvent(data);
        }
      } catch {
        // Ignorer
      } finally {
        setLoadingDirect(false);
      }
    };
    fetchDirect();
  }, [id, eventFromContext, supabase]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('event_id', id).order('created_at', { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId);
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const text = newTaskText;
    setNewTaskText("");
    
    const { data } = await supabase.from('tasks').insert([{
      event_id: id,
      titre: text,
      is_completed: false
    }]).select().single();

    if (data) {
      setTasks(prev => [...prev, data]);
    }
  };

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement de votre to-do list...</p>
      </div>
    );
  }

  if (event && event.plan !== "Gold") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="To-do List & Planning" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-xl max-w-md text-center">
            <div className="w-20 h-20 bg-[#f5eee1] text-[#8f6f33] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-black mb-3">Fonctionnalité Gold</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              La gestion de la to-do list et du planning Jour J est exclusivement réservée aux événements utilisant la formule Gold. Suivez chaque étape de vos préparatifs en toute sérénité.
            </p>
            <Link
              href={`/dashboard/events/${event.id}/settings`}
              className="block w-full bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#8f6f33]/20 transition-colors text-center"
            >
              Évoluer vers la formule Gold
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPercentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="To-do List & Planning" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">To-do list &amp; Planning</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos préparatifs étape par étape pour le Jour J.</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f5eee1] text-[#8f6f33] rounded-xl">
              <CheckSquare size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{progressPercentage}%</div>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {completedCount} sur {tasks.length} tâches
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-[#b8924a] h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Ex: Confirmer le nombre d'invités..." 
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!newTaskText.trim()}
              className="bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:bg-gray-300 shadow-md shadow-black/5"
            >
              <Plus size={18} /> Ajouter
            </button>
          </form>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucune tâche pour le moment. Ajoutez-en une ci-dessus !</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    task.is_completed 
                      ? 'bg-gray-50/60 border-gray-100 opacity-60' 
                      : 'bg-white border-gray-100 hover:border-gray-200 shadow-xs'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id, task.is_completed)}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={20} className="text-[#b8924a] shrink-0" />
                    ) : (
                      <Circle size={20} className="text-gray-300 shrink-0 hover:text-gray-400" />
                    )}
                    <span className={`text-sm ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {task.titre}
                    </span>
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-300 hover:text-red-500 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                    title="Supprimer la tâche"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
