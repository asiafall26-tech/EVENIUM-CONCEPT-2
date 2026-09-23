'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { reset } = useEventCreationStore()

  useEffect(() => {
    // Clear the creation store since order is complete
    reset()
  }, [reset])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-serif text-gray-900 mb-4">Paiement confirmé !</h2>
        <p className="text-gray-600 mb-8">
          Votre événement est maintenant actif. Vous pouvez commencer à gérer vos invités, personnaliser votre invitation et utiliser vos outils d'organisation.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Accéder à mon dashboard
          </button>
          
          <button 
            onClick={() => alert("Fonctionnalité de facturation à venir")}
            className="w-full flex justify-center py-4 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Télécharger ma facture
          </button>
        </div>

      </div>
    </div>
  )
}
