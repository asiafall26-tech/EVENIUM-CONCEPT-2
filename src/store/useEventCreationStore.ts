import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EventCreationState {
  // Step 1: Event Details
  name: string
  type: string
  date: string
  budgetEstimated?: number

  // Step 2: Invitation Type
  invitationType: 'Carte statique' | 'Invitation animée' | null

  // Step 3: Plan
  planId: string | null
  planName: 'Premium' | 'Gold' | null
  planPrice: number | null

  // Step 4: Template
  templateId: string | null
  templateName: string | null
  templateThumbnail: string | null

  // Actions
  setEventDetails: (details: { name: string; type: string; date: string; budgetEstimated?: number }) => void
  setInvitationType: (type: 'Carte statique' | 'Invitation animée') => void
  setPlan: (plan: { id: string; name: 'Premium' | 'Gold'; price: number }) => void
  setTemplate: (template: { id: string; name: string; thumbnail: string }) => void
  reset: () => void
}

const initialState = {
  name: '',
  type: '',
  date: '',
  budgetEstimated: undefined,
  invitationType: null,
  planId: null,
  planName: null,
  planPrice: null,
  templateId: null,
  templateName: null,
  templateThumbnail: null,
}

export const useEventCreationStore = create<EventCreationState>()(
  persist(
    (set) => ({
      ...initialState,
      setEventDetails: (details) => set(() => ({ ...details })),
      setInvitationType: (type) => set(() => ({ invitationType: type, planId: null, planName: null, planPrice: null, templateId: null, templateName: null, templateThumbnail: null })),
      setPlan: (plan) => set(() => ({ planId: plan.id, planName: plan.name, planPrice: plan.price })),
      setTemplate: (template) => set(() => ({ templateId: template.id, templateName: template.name, templateThumbnail: template.thumbnail })),
      reset: () => set(() => initialState),
    }),
    {
      name: 'evenium-event-creation', // name of the item in the storage (must be unique)
    }
  )
)
