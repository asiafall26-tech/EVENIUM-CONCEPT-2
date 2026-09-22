import { Save, AlertTriangle, Trash2 } from "lucide-react";
import { mockEvents } from "@/data/mock/events";
import { notFound } from "next/navigation";

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Paramètres</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres de l'événement</h1>
        <p className="text-gray-500 text-sm">Modifiez les informations générales ou gérez le statut de votre événement.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
                <input type="text" defaultValue={event.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
                <select defaultValue={event.type} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white">
                  <option value="Mariage">Mariage</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Soirée">Soirée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="text" defaultValue={event.date} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input type="text" defaultValue={event.location} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Abonnement actuel</h2>
            <div className="bg-[#F9F5EC] border border-[#D4AF37]/30 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-[#B8860B]">Formule {event.plan}</p>
                <p className="text-sm text-gray-600">Facturé annuellement. Renouvellement le 12 Dec 2026.</p>
              </div>
              <button className="text-sm font-medium text-[#B8860B] bg-white px-4 py-2 rounded-lg border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors">
                Gérer l'abonnement
              </button>
            </div>
          </section>
        </div>
        
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
          <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Save size={16} /> Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-2xl overflow-hidden">
        <div className="bg-red-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0 mt-1 md:mt-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-1">Zone de danger</h3>
              <p className="text-sm text-red-700">La suppression de cet événement est irréversible. Toutes les données, invitations, et budgets associés seront définitivement effacés.</p>
            </div>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Trash2 size={16} /> Supprimer l'événement
          </button>
        </div>
      </div>
    </div>
  );
}
