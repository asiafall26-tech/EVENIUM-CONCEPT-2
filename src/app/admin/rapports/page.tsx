import { BarChart3, TrendingUp, Users, Activity, Download } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Rapports & Analytics</h1>
          <p className="text-gray-500 text-sm">Analysez les performances et l'utilisation de la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
            <option>Ce mois-ci</option>
            <option>Le mois dernier</option>
            <option>Cette année</option>
          </select>
          <button className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors">
            <Download size={16} /> Exporter PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Nouveaux événements", value: "45", increase: "+12%", icon: <Activity size={20} /> },
          { label: "Nouveaux utilisateurs", value: "128", increase: "+5%", icon: <Users size={20} /> },
          { label: "Taux de conversion", value: "3.2%", increase: "+0.4%", icon: <TrendingUp size={20} /> },
          { label: "Invitations envoyées", value: "12.5k", increase: "+22%", icon: <BarChart3 size={20} /> },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                {kpi.icon}
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                {kpi.increase}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Création d'événements (6 derniers mois)</h2>
          <div className="flex-1 flex items-end justify-between gap-2 pt-10">
            {[40, 55, 35, 75, 60, 90].map((height, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-gray-100 rounded-t-sm group-hover:bg-[#D4AF37] transition-colors relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded">
                    {height}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {['Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Répartition des Formules</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-48 h-48 rounded-full border-[24px] border-[#F9F5EC] border-t-[#D4AF37] border-r-[#D4AF37] transform rotate-45">
              <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45">
                <span className="text-3xl font-bold text-black">65%</span>
                <span className="text-xs font-medium text-gray-500">Gold</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <span className="text-sm font-medium text-gray-600">Gold (65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F9F5EC]" />
              <span className="text-sm font-medium text-gray-600">Premium (35%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
