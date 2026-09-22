import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Download, Search, Filter } from "lucide-react";

export default function AdminBudgetPage() {
  const transactions = [
    { id: "TRX-9823", user: "Ndeye Astou", plan: "Formule Gold", format: "Animée", amount: "20 000 FCFA", date: "Aujourd'hui, 10:42", status: "completed" },
    { id: "TRX-9822", user: "Ousmane Diallo", plan: "Formule Premium", format: "Carte", amount: "7 500 FCFA", date: "Hier, 15:30", status: "completed" },
    { id: "TRX-9821", user: "Fatou Sow", plan: "Formule Gold", format: "Carte", amount: "15 000 FCFA", date: "15 Sept 2026", status: "completed" },
    { id: "TRX-9820", user: "Mamadou Diop", plan: "Formule Premium", format: "Animée", amount: "10 000 FCFA", date: "14 Sept 2026", status: "failed" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Finances SaaS</h1>
          <p className="text-gray-500 text-sm">Suivez les revenus générés par la vente de vos formules.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} /> Exporter le rapport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111111] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={64} />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Revenu Mensuel (MRR)</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-3xl font-bold text-[#D4AF37]">450 000 <span className="text-xl">FCFA</span></h2>
          </div>
          <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
            <ArrowUpRight size={16} /> +12.5% par rapport au mois dernier
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#F9F5EC] text-[#B8860B] rounded-lg">
                <CreditCard size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium">Ventes Formule Gold</p>
            </div>
            <div className="flex items-end justify-between mt-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">325 000 FCFA</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                <ArrowUpRight size={12} /> 8%
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Format Animée</span>
              <span className="font-medium text-gray-900">200 000 FCFA</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Format Carte</span>
              <span className="font-medium text-gray-900">125 000 FCFA</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium">Ventes Formule Premium</p>
            </div>
            <div className="flex items-end justify-between mt-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">125 000 FCFA</h2>
              <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                <ArrowDownRight size={12} /> 3%
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Format Animée</span>
              <span className="font-medium text-gray-900">75 000 FCFA</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Format Carte</span>
              <span className="font-medium text-gray-900">50 000 FCFA</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium">Droits d'adhésion (Prestataires)</p>
            </div>
            <div className="flex items-end justify-between mt-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">75 000 FCFA</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                <ArrowUpRight size={12} /> 12%
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Adhésions ce mois</span>
              <span className="font-medium text-gray-900">15 Payées</span>
            </div>
             <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">En attente</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Dernières transactions</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded text-gray-500 hover:text-black">
              <Filter size={16} />
            </button>
            <button className="p-2 border border-gray-200 rounded text-gray-500 hover:text-black">
              <Search size={16} />
            </button>
          </div>
        </div>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">ID Transaction</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Produit acheté</th>
              <th className="px-6 py-4 font-medium">Montant</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((trx, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{trx.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{trx.user}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      trx.plan.includes('Gold') ? 'bg-[#F9F5EC] text-[#B8860B]' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trx.plan}
                    </span>
                    <span className="text-xs text-gray-500">({trx.format})</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{trx.amount}</td>
                <td className="px-6 py-4 text-gray-500">{trx.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    trx.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${trx.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {trx.status === 'completed' ? 'Payé' : 'Échoué'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
