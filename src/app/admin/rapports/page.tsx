"use client";

import { FileText, Download, BarChart2, Calendar, Users, Wallet, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminRapportsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const supabase = createClient();

  const exportCSV = async (type: 'events' | 'users' | 'transactions') => {
    setIsExporting(type);
    try {
      let dataToExport: any[] = [];
      let filename = "";

      if (type === 'events') {
        const { data: events } = await supabase.from('events').select('*');
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        
        dataToExport = (events || []).map(e => {
          const prof = profileMap.get(e.client_id);
          const isGold = (e.plan || '').toLowerCase() === 'gold';
          const isAnim = e.format?.toLowerCase().includes('carte') ? false : true;
          const purchaseAmount = isGold ? (isAnim ? 20000 : 15000) : (isAnim ? 10000 : 7500);

          return {
            ID: e.id,
            Nom: e.name,
            Type: e.type,
            Formule: isGold ? 'Gold' : 'Premium',
            Format: isAnim ? 'Animée' : 'Carte',
            Montant_Achat: purchaseAmount,
            Budget_Prevu: e.budget_total || e.budget?.total || 0,
            Organisateur: prof?.full_name || 'Inconnu',
            Email_Organisateur: prof?.email || 'N/A',
            Date_Creation: new Date(e.created_at).toLocaleDateString()
          };
        });
        filename = "rapport_evenements.csv";
      } else if (type === 'users') {
        const { data } = await supabase.from('profiles').select('*');
        dataToExport = data?.map(u => ({
          ID: u.id,
          Nom: u.full_name,
          Email: u.email,
          Role: u.role,
          Date_Inscription: new Date(u.created_at).toLocaleDateString()
        })) || [];
        filename = "rapport_utilisateurs.csv";
      } else if (type === 'transactions') {
        const { data } = await supabase.from('transactions').select('*');
        dataToExport = data?.map(t => ({
          ID: t.id,
          Libelle: t.libelle,
          Montant: t.montant,
          Date: new Date(t.date).toLocaleDateString()
        })) || [];
        filename = "rapport_finances.csv";
      }

      if (dataToExport.length === 0) {
        alert("Aucune donnée à exporter.");
        setIsExporting(null);
        return;
      }

      const headers = Object.keys(dataToExport[0]).join(",");
      const csv = [
        headers,
        ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      alert("Erreur lors de l'export.");
    }
    setIsExporting(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Rapports & Exports <FileText size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Générez et téléchargez vos données au format CSV.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">Base Utilisateurs</h2>
          <p className="text-gray-500 text-sm mb-6">Exportez la liste de tous les organisateurs, prestataires et admins inscrits.</p>
          <button 
            onClick={() => exportCSV('users')}
            disabled={isExporting !== null}
            className="w-full bg-black text-white rounded-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            {isExporting === 'users' ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Exporter (.CSV)
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Calendar size={32} />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">Événements Globaux</h2>
          <p className="text-gray-500 text-sm mb-6">Exportez la liste complète des événements créés et leurs budgets estimés.</p>
          <button 
            onClick={() => exportCSV('events')}
            disabled={isExporting !== null}
            className="w-full bg-black text-white rounded-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            {isExporting === 'events' ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Exporter (.CSV)
          </button>
        </div>

        <div className="bg-[#2b2118] text-white rounded-3xl border border-gray-800 shadow-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#b8924a]/20 text-[#b8924a] rounded-2xl flex items-center justify-center mb-6">
            <Wallet size={32} />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2 text-white">Transactions (Finances)</h2>
          <p className="text-gray-400 text-sm mb-6">Toutes les transactions financières effectuées via la plateforme.</p>
          <button 
            onClick={() => exportCSV('transactions')}
            disabled={isExporting !== null}
            className="w-full bg-[#b8924a] text-black rounded-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-[#C5A030] transition-colors"
          >
            {isExporting === 'transactions' ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Exporter (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
