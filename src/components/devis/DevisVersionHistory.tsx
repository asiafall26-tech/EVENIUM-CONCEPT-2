'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { History, ChevronRight, CheckCircle, Clock, AlertCircle, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DevisVersionItem {
  id?: string;
  version_number: number;
  created_at: string;
  total: number;
  subtotal?: number;
  discount?: number;
  extra_fees?: number;
  status?: string;
  items?: any[];
  options?: any[];
  notes?: string;
  isCurrent?: boolean;
}

interface DevisVersionHistoryProps {
  devisId: string;
  currentDevis?: {
    id?: string;
    version?: number;
    total?: number;
    subtotal?: number;
    discount?: number;
    extra_fees?: number;
    status?: string;
    created_at?: string;
    sent_at?: string;
    notes?: string;
  };
  currentVersion?: number;
  currentTotal?: number;
  currentItems?: any[];
  currentOptions?: any[];
  onSelectVersionSnapshot?: (versionData: any) => void;
  selectedVersionNumber?: number;
}

export function DevisVersionHistory({
  devisId,
  currentDevis,
  currentVersion,
  currentTotal,
  currentItems = [],
  currentOptions = [],
  onSelectVersionSnapshot,
  selectedVersionNumber
}: DevisVersionHistoryProps) {
  const [versions, setVersions] = useState<DevisVersionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('devis_versions')
        .select('*')
        .eq('devis_id', devisId)
        .order('version_number', { ascending: true });

      const list: DevisVersionItem[] = [];

      if (data && data.length > 0) {
        data.forEach((v: any) => {
          const snapshot = v.data || {};
          const d = snapshot.devis || {};
          list.push({
            id: v.id,
            version_number: v.version_number,
            created_at: v.created_at,
            total: Number(d.total || snapshot.total || 0),
            subtotal: Number(d.subtotal || snapshot.subtotal || 0),
            discount: Number(d.discount || snapshot.discount || 0),
            extra_fees: Number(d.extra_fees || snapshot.extra_fees || 0),
            status: d.status || 'Archivée',
            items: snapshot.items || [],
            options: snapshot.options || [],
            notes: d.notes || snapshot.notes || '',
            isCurrent: false
          });
        });
      }

      // Ajouter la version courante
      const activeDevis = currentDevis || {
        version: currentVersion || 1,
        total: currentTotal || 0,
        status: 'En attente de validation',
        created_at: new Date().toISOString()
      };
      const currentVersionNum = activeDevis.version || currentVersion || 1;
      const alreadyInList = list.some(item => item.version_number === currentVersionNum);

      if (!alreadyInList) {
        list.push({
          version_number: currentVersionNum,
          created_at: activeDevis.sent_at || activeDevis.created_at || new Date().toISOString(),
          total: Number(activeDevis.total || currentTotal || 0),
          subtotal: Number(activeDevis.subtotal || 0),
          discount: Number(activeDevis.discount || 0),
          extra_fees: Number(activeDevis.extra_fees || 0),
          status: activeDevis.status || 'En attente de validation',
          items: currentItems,
          options: currentOptions,
          notes: activeDevis.notes || '',
          isCurrent: true
        });
      } else {
        // Mettre à jour l'indicateur isCurrent
        const item = list.find(x => x.version_number === currentVersionNum);
        if (item) item.isCurrent = true;
      }

      // Trier par version croissante
      list.sort((a, b) => a.version_number - b.version_number);
      setVersions(list);
      setLoading(false);
    };

    if (devisId) {
      fetchHistory();
    }
  }, [devisId, currentDevis, currentItems, currentOptions]);

  if (loading) {
    return <div className="py-4 text-center text-xs text-stone-600">Chargement de l'historique des versions...</div>;
  }

  if (versions.length <= 1) {
    return null; // Pas besoin d'afficher s'il n'y a qu'une seule version (version initiale v1)
  }

  const activeNum = selectedVersionNumber || currentDevis?.version || currentVersion || 1;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#8f6f33]/10 text-[#8f6f33]">
            <History size={18} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Historique des versions</h3>
            <p className="text-xs text-stone-600 font-medium">Ce devis a fait l'objet de {versions.length} versions successives.</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
          Version active : v{currentDevis?.version || currentVersion || 1}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {versions.map((v, idx) => {
          const isSelected = v.version_number === activeNum;
          const prevVersion = idx > 0 ? versions[idx - 1] : null;
          const diff = prevVersion ? v.total - prevVersion.total : 0;

          return (
            <button
              key={v.version_number}
              type="button"
              onClick={() => onSelectVersionSnapshot && onSelectVersionSnapshot(v)}
              className={`text-left p-4 rounded-xl border transition-all relative ${
                isSelected
                  ? 'border-[#8f6f33] ring-2 ring-[#8f6f33]/30 bg-[#fbf9f5] shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-sm text-stone-900">
                  <span>Version v{v.version_number}</span>
                  {v.isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Actuelle
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium text-stone-600">
                  {new Date(v.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="font-serif font-bold text-base text-stone-950">
                  {v.total.toLocaleString('fr-FR')} FCFA
                </span>
                {diff !== 0 && (
                  <span className={`text-[11px] font-bold inline-flex items-center ${diff > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {diff > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(diff).toLocaleString('fr-FR')} F
                  </span>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>{v.items?.length || 0} prestation(s)</span>
                <span className="font-semibold text-stone-700">{v.status}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
