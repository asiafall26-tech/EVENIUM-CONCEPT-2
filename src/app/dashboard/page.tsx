import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, ChevronRight, Crown } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Non autorisé</div>
  }

  // Fetch events with their plans
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      pricing_plans (name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-semibold">Mes Événements</h1>
        <Link 
          href="/create" 
          className="flex items-center gap-2 bg-[#111111] text-[#D4AF37] px-4 py-2 rounded-lg font-medium hover:bg-black transition-colors text-sm"
        >
          <Plus size={16} /> Créer un événement
        </Link>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Vos événements en cours</h2>
        
        {(!events || events.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            Vous n'avez pas encore d'événement.
            <br />
            <Link href="/create" className="text-[#D4AF37] font-medium hover:underline mt-2 inline-block">
              Commencez à organiser dès maintenant.
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event: any) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block group">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                    <ChevronRight className="text-[#D4AF37]" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-gray-50 rounded w-fit mb-4 text-gray-600">
                    <Calendar size={14} /> {event.date}
                  </div>
                  
                  <h3 className="font-serif text-2xl font-semibold mb-1 pr-8">{event.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{event.type}</p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Format:</span>
                      <span className="font-medium text-sm text-gray-700">{event.invitation_type}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded text-xs font-bold uppercase">
                      {event.pricing_plans?.name === 'Gold' && <Crown size={12} />}
                      {event.pricing_plans?.name || 'Premium'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
