"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Circle, CheckCircle2, CheckSquare, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const [tasks, setTasks] = useState([
    { id: 1, text: "Définir la date et le lieu", completed: true },
    { id: 2, text: "Réserver le traiteur", completed: false },
    { id: 3, text: "Envoyer les invitations", completed: false },
    { id: 4, text: "Valider le budget prévisionnel", completed: true },
    { id: 5, text: "Trouver un photographe", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    setTasks([
      ...tasks,
      { id: Date.now(), text: newTaskText, completed: false }
    ]);
    setNewTaskText("");
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Checklist</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <Link href={`/dashboard/events/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-2">
            <ArrowLeft size={16} /> Retour à l'aperçu
          </Link>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-3">
            <CheckSquare className="text-[#D4AF37]" size={32} /> Checklist d'organisation
          </h1>
          <p className="text-gray-500 text-sm">Gérez toutes les tâches de votre événement pas à pas.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-sm text-gray-500 font-semibold mb-1">Progression</div>
            <div className="text-3xl font-bold text-gray-900">{progressPercentage}%</div>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {completedCount} sur {tasks.length} tâches
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-[#D4AF37] h-3 rounded-full transition-all duration-500" 
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
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
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
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucune tâche pour le moment.</div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl border group transition-all ${task.completed ? 'bg-gray-50 border-transparent opacity-75' : 'bg-white border-gray-100 hover:border-[#D4AF37]/50 hover:shadow-sm'}`}
                >
                  <button onClick={() => toggleTask(task.id)} className="shrink-0 transition-transform active:scale-90">
                    {task.completed ? (
                      <CheckCircle2 className="text-[#2E7D32]" size={24} />
                    ) : (
                      <Circle className="text-gray-300 group-hover:text-[#D4AF37]" size={24} />
                    )}
                  </button>
                  <span className={`flex-1 text-sm transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                    {task.text}
                  </span>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer la tâche"
                  >
                    <Trash2 size={18} />
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
