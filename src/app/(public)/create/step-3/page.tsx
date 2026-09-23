'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'
import { createClient } from '@/utils/supabase/client'

interface PricingPlan {
  id: string
  name: 'Premium' | 'Gold'
  price: number
  features: string[]
}

export default function Step3Plan() {
  const router = useRouter()
  const { invitationType, setPlan } = useEventCreationStore()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!invitationType) {
      router.push('/create/step-2')
      return
    }

    const fetchPlans = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('invitation_type', invitationType)
        .order('price', { ascending: true })

      if (data) {
        setPlans(data as PricingPlan[])
      }
      setLoading(false)
    }

    fetchPlans()
  }, [invitationType, router])

  const handleSelect = (plan: PricingPlan) => {
    setPlan({ id: plan.id, name: plan.name, price: plan.price })
    router.push('/create/step-4')
  }

  if (loading) return <div className="text-center py-12">Chargement des formules...</div>

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-gray-900">Choisissez votre formule</h3>
        <p className="text-sm text-gray-500 mt-2">Pour une invitation de type {invitationType}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`flex flex-col p-6 border-2 rounded-xl transition-all hover:border-[#D4AF37] hover:shadow-md border-gray-200`}
          >
            <h4 className="text-2xl font-semibold text-gray-900">{plan.name}</h4>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
              {plan.price.toLocaleString('fr-FR')} <span className="ml-1 text-xl font-medium text-gray-500">FCFA</span>
            </div>
            
            <ul className="mt-6 space-y-4 flex-1">
              <li className="flex">
                <span className="text-[#D4AF37] mr-3">✓</span>
                <span className="text-gray-600">Personnalisation du modèle</span>
              </li>
              <li className="flex">
                <span className="text-[#D4AF37] mr-3">✓</span>
                <span className="text-gray-600">Gestion des invités & RSVP</span>
              </li>
              {plan.name === 'Gold' && (
                <>
                  <li className="flex">
                    <span className="text-[#D4AF37] mr-3">✓</span>
                    <span className="text-gray-900 font-medium">Gestion du Budget</span>
                  </li>
                  <li className="flex">
                    <span className="text-[#D4AF37] mr-3">✓</span>
                    <span className="text-gray-900 font-medium">Checklist & Tâches</span>
                  </li>
                  <li className="flex">
                    <span className="text-[#D4AF37] mr-3">✓</span>
                    <span className="text-gray-900 font-medium">Accès aux prestataires</span>
                  </li>
                </>
              )}
            </ul>

            <button 
              onClick={() => handleSelect(plan)}
              className="mt-8 w-full bg-gray-900 text-white hover:bg-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Sélectionner
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 text-center">
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← Retour
        </button>
      </div>
    </div>
  )
}
