'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'

const EVENT_TYPES = [
  'Mariage', 'Anniversaire', 'Baptême', 'Communion', 'Fiançailles', 
  'Baby shower', 'Naissance', 'Graduation', 'Événement religieux', 
  'Événement professionnel', 'Conférence', 'Séminaire', 'Gala', 
  'Cocktail', 'Dîner', 'Soirée', 'Festival', 'Autre'
]

export default function Step1EventDetails() {
  const router = useRouter()
  const { name, type, date, budgetEstimated, setEventDetails } = useEventCreationStore()

  const [localName, setLocalName] = useState(name)
  const [localType, setLocalType] = useState(type || EVENT_TYPES[0])
  const [localDate, setLocalDate] = useState(date)
  const [localBudget, setLocalBudget] = useState(budgetEstimated?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEventDetails({
      name: localName,
      type: localType,
      date: localDate,
      budgetEstimated: localBudget ? parseFloat(localBudget) : undefined
    })
    router.push('/create/step-2')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom de l'événement *</label>
        <input 
          required 
          type="text" 
          value={localName}
          onChange={e => setLocalName(e.target.value)}
          placeholder="Ex: Mariage de Ndeye & Abdou"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-3 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type d'événement *</label>
        <select 
          required
          value={localType}
          onChange={e => setLocalType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-3 border"
        >
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date de l'événement *</label>
        <input 
          required 
          type="date" 
          value={localDate}
          onChange={e => setLocalDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-3 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Budget estimé (FCFA) - <span className="text-gray-400">Facultatif</span></label>
        <input 
          type="number" 
          value={localBudget}
          onChange={e => setLocalBudget(e.target.value)}
          placeholder="Ex: 1500000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-3 border"
        />
      </div>

      <button 
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#B4952F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
      >
        Continuer
      </button>
    </form>
  )
}
