"use client";

import { Headphones, ShieldAlert, CheckCircle, Search, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles(full_name, email, role)')
      .order('created_at', { ascending: false });

    if (data) {
      setTickets(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Support & Tickets <Headphones size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez les demandes d'assistance des utilisateurs.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-6 sm:p-10 lg:p-12">Chargement des tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Aucun ticket en attente</h2>
          <p className="text-gray-500 max-w-sm mb-6">Félicitations, tous les problèmes ont été résolus ou il n'y a pas de nouvelles demandes de support pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Sujet</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{t.profiles?.full_name || "Utilisateur inconnu"}</div>
                      <div className="text-xs text-gray-500">{t.profiles?.role}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-black">{t.sujet}</div>
                      <div className="text-xs truncate max-w-xs">{t.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.statut === 'Ouvert' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        {t.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" /> {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
