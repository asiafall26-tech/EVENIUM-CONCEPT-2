'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'
import { processCheckout } from './actions'

export default function CheckoutPage() {
  const router = useRouter()
  const store = useEventCreationStore()
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState<'Wave' | 'Orange Money' | 'Carte Bancaire'>('Carte Bancaire')

  useEffect(() => {
    // Basic guard
    if (!store.name || !store.planId) {
      router.push('/create')
    }
  }, [store, router])

  const handlePay = () => {
    startTransition(async () => {
      try {
        await processCheckout({
          name: store.name,
          type: store.type,
          date: store.date,
          budgetEstimated: store.budgetEstimated,
          planId: store.planId,
          planPrice: store.planPrice,
          invitationType: store.invitationType,
          templateId: store.templateId,
          paymentMethod
        })
      } catch (e) {
        console.error(e)
        alert("Erreur lors du paiement")
      }
    })
  }

  if (!store.name) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-gray-900 mb-8 text-center">Paiement</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Summary side */}
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Récapitulatif de la commande</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Événement</p>
                  <p className="text-sm text-gray-500">{store.name}</p>
                </div>
              </div>
              
              <div className="flex justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Formule {store.planName}</p>
                  <p className="text-sm text-gray-500">{store.invitationType}</p>
                </div>
                <p className="font-medium text-gray-900">{store.planPrice?.toLocaleString('fr-FR')} FCFA</p>
              </div>

              <div className="flex justify-between pt-4">
                <p className="text-lg font-bold text-gray-900">Total à payer</p>
                <p className="text-xl font-bold text-[#D4AF37]">{store.planPrice?.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          {/* Payment side */}
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Moyen de paiement</h2>
            
            <div className="space-y-3">
              {(['Wave', 'Orange Money', 'Carte Bancaire'] as const).map(method => (
                <label 
                  key={method}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300"
                  />
                  <span className="ml-3 font-medium text-gray-900">{method}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={handlePay}
              disabled={isPending}
              className="mt-8 w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#B4952F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50"
            >
              {isPending ? 'Traitement en cours...' : `Payer ${store.planPrice?.toLocaleString('fr-FR')} FCFA`}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
