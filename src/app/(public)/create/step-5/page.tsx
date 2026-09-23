'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'

export default function Step5Summary() {
  const router = useRouter()
  const store = useEventCreationStore()

  useEffect(() => {
    // If they skipped steps, send them back to the start
    if (!store.name || !store.invitationType || !store.planId || !store.templateId) {
      router.push('/create')
    }
  }, [store, router])

  if (!store.name) return null // Prevent rendering until redirect happens if invalid

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif text-gray-900">Récapitulatif</h3>
        <p className="text-sm text-gray-500 mt-2">Vérifiez les informations de votre événement avant de continuer.</p>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-200">
        
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Mon Événement</h4>
          <p className="text-lg font-medium text-gray-900">{store.name}</p>
          <div className="mt-1 text-sm text-gray-600 flex gap-4">
            <span>Type: <strong className="text-gray-900">{store.type}</strong></span>
            <span>Date: <strong className="text-gray-900">{store.date}</strong></span>
          </div>
          {store.budgetEstimated && (
            <p className="mt-1 text-sm text-gray-600">Budget estimé: <strong className="text-gray-900">{store.budgetEstimated.toLocaleString('fr-FR')} FCFA</strong></p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Mon Invitation</h4>
          <p className="text-lg font-medium text-gray-900">{store.templateName}</p>
          <p className="mt-1 text-sm text-gray-600">Format: <strong className="text-gray-900">{store.invitationType}</strong></p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Ma Formule</h4>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-lg font-medium text-[#D4AF37]">{store.planName}</p>
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {store.planPrice?.toLocaleString('fr-FR')} <span className="text-sm font-medium text-gray-500">FCFA</span>
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col gap-4 pt-4">
        <button 
          onClick={() => router.push('/login?redirect=checkout')}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          Continuer vers le paiement
        </button>
        <button 
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 text-center py-2"
        >
          Modifier mes choix
        </button>
      </div>
    </div>
  )
}
