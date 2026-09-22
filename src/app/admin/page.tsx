import { 
  Calendar, 
  FileText, 
  Users, 
  Wallet,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Headphones
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboardPage() {
  const tickets = [
    { client: "Amina Diop", type: "Problème paiement", date: "12 oct. 2026", priorite: "Haute", status: "Nouveau" },
    { client: "Moussa Kane", type: "Bug affichage", date: "5 nov. 2026", priorite: "Moyenne", status: "En cours" },
    { client: "Sophie Fall", type: "Question facture", date: "28 sept. 2026", priorite: "Basse", status: "Résolu" },
    { client: "Ibrahima Ba", type: "Accès compte", date: "15 oct. 2026", priorite: "Haute", status: "Résolu" },
    { client: "Ndeye Diallo", type: "Demande de feature", date: "3 oct. 2026", priorite: "Basse", status: "En cours" },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Nouveau": return "bg-[#FFF8E1] text-[#F57F17]";
      case "En cours": return "bg-[#E3F2FD] text-[#1976D2]";
      case "Résolu": return "bg-[#E8F5E9] text-[#2E7D32]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Bonjour Ndeye Astou <span>👋</span>
          </h1>
          <p className="text-gray-500 text-sm">Voici l'activité de votre plateforme aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm cursor-pointer shadow-sm">
          <Calendar size={16} className="text-gray-500" />
          <div className="text-left leading-tight">
            <div className="text-[10px] text-gray-400 font-medium">Aujourd'hui</div>
            <div className="font-medium text-gray-800">14 sept. 2026</div>
          </div>
          <ChevronDown size={14} className="text-gray-400 ml-2" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center flex-shrink-0">
            <Calendar size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">48</h3>
            <p className="text-xs text-gray-500 font-medium mb-1">Événements</p>
            <div className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +12%</div>
          </div>
        </div>

        <div className="bg-[#111111] text-white p-5 rounded-2xl border border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">124</h3>
            <p className="text-xs text-gray-400 font-medium mb-1">Tickets Support</p>
            <div className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +28%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center flex-shrink-0">
            <Users size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">36</h3>
            <p className="text-xs text-gray-500 font-medium mb-1">Prestataires</p>
            <div className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +8%</div>
          </div>
        </div>

        <div className="bg-[#111111] text-white p-5 rounded-2xl border border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <Users size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">312</h3>
            <p className="text-xs text-gray-400 font-medium mb-1">Participants</p>
            <div className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +15%</div>
          </div>
        </div>

        <div className="bg-[#F9F5EC] p-5 rounded-2xl border border-[#D4AF37]/20 shadow-[0_2px_10px_-4px_rgba(212,175,55,0.1)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Wallet size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">8 450 000 <span className="text-xs">FCFA</span></h3>
            <p className="text-xs text-gray-600 font-medium mb-1 line-clamp-1">Chiffre d'affaires estimé</p>
            <div className="text-[10px] text-green-700 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +20%</div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-black">Croissance de la plateforme</h2>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Événements</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black" /> Nouveaux inscrits</div>
            </div>
          </div>
          
          <div className="h-[200px] w-full relative flex items-end pt-4 pb-6 px-4">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium pb-2 text-right">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-10 right-4 top-2 bottom-8 flex flex-col justify-between">
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
            </div>

            {/* Simulated Chart SVG */}
            <div className="absolute left-10 right-4 top-2 bottom-8 z-10">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Gradient Fill for Gold Line */}
                <defs>
                  <linearGradient id="gradientGold" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,90 L12.5,80 L25,75 L37.5,70 L50,60 L62.5,50 L75,35 L87.5,25 L100,10 L100,100 L0,100 Z" fill="url(#gradientGold)" />
                
                {/* Gold Line */}
                <path d="M0,90 L12.5,80 L25,75 L37.5,70 L50,60 L62.5,50 L75,35 L87.5,25 L100,10" fill="none" stroke="#D4AF37" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                
                {/* Black Line */}
                <path d="M0,95 L12.5,90 L25,85 L37.5,80 L50,75 L62.5,70 L75,55 L87.5,45 L100,40" fill="none" stroke="#111" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                
                {/* Dots */}
                {[
                  {x: 0, y: 90, color: '#D4AF37'}, {x: 12.5, y: 80, color: '#D4AF37'}, {x: 25, y: 75, color: '#D4AF37'}, 
                  {x: 37.5, y: 70, color: '#D4AF37'}, {x: 50, y: 60, color: '#D4AF37'}, {x: 62.5, y: 50, color: '#D4AF37'}, 
                  {x: 75, y: 35, color: '#D4AF37'}, {x: 87.5, y: 25, color: '#D4AF37'}, {x: 100, y: 10, color: '#D4AF37'},
                  {x: 0, y: 95, color: '#111'}, {x: 12.5, y: 90, color: '#111'}, {x: 25, y: 85, color: '#111'}, 
                  {x: 37.5, y: 80, color: '#111'}, {x: 50, y: 75, color: '#111'}, {x: 62.5, y: 70, color: '#111'}, 
                  {x: 75, y: 55, color: '#111'}, {x: 87.5, y: 45, color: '#111'}, {x: 100, y: 40, color: '#111'}
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={pt.color} stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
              
              {/* Tooltip mockup */}
              <div className="absolute top-[20%] right-[5%] bg-[#111] text-white p-2 rounded text-[10px] shadow-lg">
                <div className="font-bold border-b border-gray-700 pb-1 mb-1">Sept. 2026</div>
                <div><span className="text-[#D4AF37]">•</span> 45 événements</div>
                <div><span className="text-gray-400">•</span> 30 inscrits</div>
              </div>
            </div>
            
            {/* X Axis */}
            <div className="absolute left-10 right-4 bottom-0 flex justify-between text-[10px] text-gray-400 font-medium">
              <span>Janv.</span><span>Févr.</span><span>Mars</span><span>Avr.</span><span>Mai</span><span>Juin</span><span>Juil.</span><span>Août</span><span>Sept.</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="font-semibold text-lg text-black mb-6">Répartition des événements</h2>
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6">
            {/* Donut CSS representation */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center" 
                 style={{
                   background: 'conic-gradient(#D4AF37 0% 33%, #111111 33% 54%, #424242 54% 69%, #E0E0E0 69% 81%, #9E9E9E 81% 91%, #EEEEEE 91% 100%)'
                 }}>
              <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                <span className="text-2xl font-bold leading-none">48</span>
                <span className="text-[10px] text-gray-500 font-medium mt-1">Événements</span>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> <span className="text-gray-600 font-medium">Mariage</span></div>
                <span className="font-bold">33%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#111111]" /> <span className="text-gray-600 font-medium">Séminaire</span></div>
                <span className="font-bold">21%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#424242]" /> <span className="text-gray-600 font-medium">Anniversaire</span></div>
                <span className="font-bold">15%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E0E0E0]" /> <span className="text-gray-600 font-medium">Événement d'entreprise</span></div>
                <span className="font-bold">12%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#9E9E9E]" /> <span className="text-gray-600 font-medium">Baptême</span></div>
                <span className="font-bold">10%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EEEEEE]" /> <span className="text-gray-600 font-medium">Autres</span></div>
                <span className="font-bold">9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Table: Derniers tickets support */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-black">Derniers tickets support</h2>
            <button className="text-sm font-medium text-[#B8860B] flex items-center gap-1 hover:underline">Voir tous &rarr;</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                  <th className="pb-4 font-medium">Utilisateur</th>
                  <th className="pb-4 font-medium">Sujet</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Priorité</th>
                  <th className="pb-4 font-medium">Statut</th>
                  <th className="pb-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-semibold text-gray-800">{d.client}</td>
                    <td className="py-4 text-gray-600">{d.type}</td>
                    <td className="py-4 text-gray-500">{d.date}</td>
                    <td className="py-4 text-gray-600">{d.priorite}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${getStatusStyle(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-black">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mon planning */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-black">Mon planning</h2>
            <button className="text-sm font-medium text-[#B8860B] flex items-center gap-1 hover:underline">Voir tout &rarr;</button>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg mb-6">
            <ChevronLeft size={16} className="text-gray-400 cursor-pointer hover:text-black" />
            <span className="text-sm font-semibold text-gray-800">Lundi 14 septembre 2026</span>
            <ChevronRight size={16} className="text-gray-400 cursor-pointer hover:text-black" />
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex gap-4 items-start">
              <div className="flex flex-col text-xs text-gray-500 font-medium text-right w-12 shrink-0 pt-0.5">
                <span>10:00</span>
                <span>11:00</span>
              </div>
              <div className="border-l-2 border-[#D4AF37] pl-4">
                <h4 className="font-semibold text-sm text-gray-800">Réunion avec Amina Diop</h4>
                <p className="text-xs text-gray-500 mt-0.5">Visio</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex flex-col text-xs text-gray-500 font-medium text-right w-12 shrink-0 pt-0.5">
                <span>14:00</span>
                <span>15:30</span>
              </div>
              <div className="border-l-2 border-gray-300 pl-4">
                <h4 className="font-semibold text-sm text-gray-800">Suivi devis - Moussa Kane</h4>
                <p className="text-xs text-gray-500 mt-0.5">Téléphone</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex flex-col text-xs text-gray-500 font-medium text-right w-12 shrink-0 pt-0.5">
                <span>16:00</span>
                <span>17:00</span>
              </div>
              <div className="border-l-2 border-[#F57F17] pl-4">
                <h4 className="font-semibold text-sm text-gray-800">Validation menu - Saveurs d'Afrique</h4>
                <p className="text-xs text-gray-500 mt-0.5">Email</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2.5 bg-[#F9F5EC] text-[#B8860B] text-sm font-semibold rounded-lg hover:bg-[#F1E5C8] transition-colors flex items-center justify-center gap-2">
            <Calendar size={16} /> Voir le calendrier complet
          </button>
        </div>
      </div>

      {/* Very Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-[#F9F5EC] text-[#B8860B] flex items-center justify-center flex-shrink-0">
            <Target size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black mb-1">Objectif du mois</h3>
            <p className="text-xs text-gray-500 mb-2">Atteindre 50 événements confirmés</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-[#B8860B] h-2 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="font-bold text-sm text-black">48 / 50</div>
             <div className="text-xs text-gray-400 font-medium">96%</div>
          </div>
        </div>

        <div className="bg-[#F9F5EC] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-[0_2px_10px_-4px_rgba(212,175,55,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white text-[#B8860B] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-black text-sm">Besoin d'aide ?</h3>
              <p className="text-[10px] text-gray-600">Notre équipe est là pour vous accompagner.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#111] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-2">
            <Headphones size={14} /> Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
