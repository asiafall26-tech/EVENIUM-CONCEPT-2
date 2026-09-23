'use client'

import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'

export default function Step2InvitationType() {
  const router = useRouter()
  const { invitationType, setInvitationType } = useEventCreationStore()

  const handleSelect = (type: 'Carte statique' | 'Invitation animée') => {
    setInvitationType(type)
    router.push('/create/step-3')
  }

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-xl font-medium text-gray-900 mb-6">Quelle invitation souhaitez-vous ?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => handleSelect('Carte statique')}
          className={`p-6 border-2 rounded-xl text-left transition-all hover:border-[#D4AF37] hover:shadow-md ${invitationType === 'Carte statique' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-2xl">
            💌
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Carte Statique</h4>
          <p className="mt-2 text-sm text-gray-500">Un design épuré sous forme de carte classique, élégant et intemporel.</p>
        </button>

        <button 
          onClick={() => handleSelect('Invitation animée')}
          className={`p-6 border-2 rounded-xl text-left transition-all hover:border-[#D4AF37] hover:shadow-md ${invitationType === 'Invitation animée' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200'}`}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-2xl">
            ✨
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Invitation Animée</h4>
          <p className="mt-2 text-sm text-gray-500">Une expérience dynamique et moderne avec des animations captivantes.</p>
        </button>
      </div>
      
      <div className="pt-6">
        <button 
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Retour
        </button>
      </div>
    </div>
  )
}
