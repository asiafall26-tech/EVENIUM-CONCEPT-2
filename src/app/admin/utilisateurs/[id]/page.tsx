import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar as CalendarIcon, ShieldCheck, Activity, CreditCard, Ticket } from "lucide-react";

export default function AdminUserProfilePage({ params }: { params: { id: string } }) {
  // Mock data for the user
  const user = {
    id: params.id,
    name: "Ndeye Astou",
    email: "ndeye.astou@example.com",
    role: "Organisateur",
    plan: "Gold",
    status: "active",
    joinDate: "12 Jan 2026",
    totalSpent: "145 000 FCFA",
    eventsCount: 2,
    ticketsCount: 1,
  };

  const events = [
    { id: "EV-001", name: "Mariage de Ndeye & Modou", date: "24 Oct 2026", guests: 150, status: "published" },
    { id: "EV-002", name: "Dîner de Gala", date: "10 Nov 2026", guests: 50, status: "draft" },
  ];

  const transactions = [
    { id: "TRX-9823", date: "15 Sept 2026", amount: "20 000 FCFA", type: "Invitation Animée", status: "completed" },
    { id: "TRX-9801", date: "12 Jan 2026", amount: "125 000 FCFA", type: "Formule Gold", status: "completed" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header with Back button */}
      <div className="mb-8">
        <Link href="/admin/utilisateurs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors">
          <ArrowLeft size={16} /> Retour aux utilisateurs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-serif text-2xl font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-black">{user.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CalendarIcon size={14} /> Inscrite le {user.joinDate}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Se connecter en tant que
            </button>
            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              Suspendre le compte
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Abonnement</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{user.plan}</span>
            <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Actif</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CreditCard size={16} /> <p className="text-sm font-medium">Total Dépensé</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.totalSpent}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Activity size={16} /> <p className="text-sm font-medium">Événements créés</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.eventsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Ticket size={16} /> <p className="text-sm font-medium">Tickets Support</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.ticketsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Événements de l'utilisateur</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Événement</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Invités</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{ev.name}</td>
                    <td className="px-6 py-4 text-gray-500">{ev.date}</td>
                    <td className="px-6 py-4 text-gray-600">{ev.guests}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ev.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Historique des transactions</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Achat</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((trx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{trx.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{trx.type}</td>
                    <td className="px-6 py-4 text-gray-500">{trx.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{trx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
