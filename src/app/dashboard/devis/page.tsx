"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ClientDevisPage() {
  const [devisList, setDevisList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDevis();
    
    // Configurer le temps réel pour les devis du client
    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      channel = supabase.channel(`client_devis_sync_${user.id}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'devis', filter: `client_id=eq.${user.id}` }, () => {
          fetchDevis();
        })
        .subscribe();
    };
    
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchDevis = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupérer les devis (qui ne sont pas des brouillons) adressés à ce client
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, events(name, type, date)')
      .eq('client_id', user.id)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    if (devisData) {
      const providerIds = [...new Set(devisData.map(d => d.prestataire_id).filter(Boolean))];
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, category, phone')
        .in('id', providerIds);
      
      const profMap: Record<string, any> = {};
      (profs || []).forEach(p => profMap[p.id] = p);

      const formatted = devisData.map(d => ({
        ...d,
        profiles: profMap[d.prestataire_id] || { full_name: 'Prestataire', category: 'Service' }
      }));
      setDevisList(formatted);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En attente de validation': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Accepté': return 'bg-green-100 text-green-700 border-green-200';
      case 'Modification demandée': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Refusé': return 'bg-red-100 text-red-700 border-red-200';
      case 'Expiré': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'En attente de validation': return <Clock size={16} />;
      case 'Accepté': return <CheckCircle size={16} />;
      case 'Modification demandée': return <RefreshCw size={16} />;
      case 'Refusé': return <XCircle size={16} />;
      case 'Expiré': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Mes Devis</h1>
        <p className="text-gray-500">Consultez et gérez les devis envoyés par vos prestataires.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement de vos devis...</div>
      ) : devisList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">Aucun devis reçu</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Vous n'avez pas encore reçu de devis de la part de prestataires. Explorez le catalogue pour faire vos premières demandes.</p>
          <Link href="/dashboard" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors inline-block shadow-lg">
            Explorer les événements
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devisList.map((devis) => (
            <div key={devis.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-3 ${getStatusColor(devis.status)}`}>
                    {getStatusIcon(devis.status)}
                    {devis.status === 'En attente de validation' ? 'En attente' : devis.status}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{devis.reference || `DEV-${devis.id.substring(0,8).toUpperCase()}`}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> Émis le {new Date(devis.date_emission).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {devis.profiles?.avatar_url ? (
                    <img src={devis.profiles.avatar_url} alt={devis.profiles.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                      {devis.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs font-bold text-[#b8924a] uppercase tracking-wider mb-1">{devis.profiles?.category || 'Prestataire'}</p>
                  <p className="font-medium text-gray-900">{devis.profiles?.full_name || 'Prestataire Inconnu'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Pour l'événement</p>
                  <p className="font-bold text-gray-900">{devis.events?.name || 'Événement Inconnu'}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{devis.events?.type} • {devis.events?.date}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Montant Total TTC</p>
                    <p className="font-bold text-2xl text-black">{devis.total?.toLocaleString()} <span className="text-sm font-medium text-gray-500">FCFA</span></p>
                  </div>
                  <Link 
                    href={`/dashboard/devis/${devis.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f5eee1] text-[#8f6f33] hover:bg-[#F0E6D2] font-bold rounded-lg transition-colors text-sm"
                  >
                    <Eye size={16} /> Voir 
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
