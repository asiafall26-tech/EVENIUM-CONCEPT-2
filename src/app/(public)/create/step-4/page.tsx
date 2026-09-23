'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventCreationStore } from '@/store/useEventCreationStore'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

interface Template {
  id: string
  name: string
  thumbnail_url: string
  is_premium: boolean
}

const FALLBACK_TEMPLATES: Template[] = [
  { id: 'tpl-1', name: 'Élégance Classique', thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop', is_premium: false },
  { id: 'tpl-2', name: 'Amour Éternel', thumbnail_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600&auto=format&fit=crop', is_premium: true },
  { id: 'tpl-3', name: 'Jardin Secret', thumbnail_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop', is_premium: false },
  { id: 'tpl-4', name: 'Soirée Royale', thumbnail_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop', is_premium: true },
]

export default function Step4Template() {
  const router = useRouter()
  const { invitationType, setTemplate } = useEventCreationStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!invitationType) {
      router.push('/create/step-2')
      return
    }

    const fetchTemplates = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('invitation_templates')
          .select('*')
          .eq('type', invitationType)

        if (data && data.length > 0) {
          setTemplates(data as Template[])
        } else {
          // Utilisation de données mockées si la table est vide ou erreur
          setTemplates(FALLBACK_TEMPLATES)
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des modèles", err)
        setTemplates(FALLBACK_TEMPLATES)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [invitationType, router])

  const handleSelect = (template: Template) => {
    setTemplate({ id: template.id, name: template.name, thumbnail: template.thumbnail_url })
    router.push('/create/step-5')
  }

  if (loading) return <div className="text-center py-12 text-gray-500 animate-pulse">Chargement des modèles...</div>

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-gray-900">Choisissez votre modèle</h3>
        <p className="text-sm text-gray-500 mt-2">Vous pourrez le personnaliser après l'achat.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="group relative rounded-xl border border-gray-200 overflow-hidden hover:border-[#D4AF37] transition-all hover:shadow-lg bg-white flex flex-col">
            <div className="aspect-[3/4] relative bg-gray-100 flex-shrink-0 cursor-pointer" onClick={() => handleSelect(tpl)}>
              {/* Fallback styling for images if they don't exist yet */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-4 text-center">
                Aperçu {tpl.name}
              </div>
              <Image 
                src={tpl.thumbnail_url} 
                alt={tpl.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover z-10 transition-transform duration-500 group-hover:scale-105"
                unoptimized // Temporaire si les images n'existent pas encore ou proviennent d'URL externes non configurées
              />
              
              {/* Hover Overlay for desktop preview */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20 pointer-events-none md:pointer-events-auto">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); /* Logic pour modal aperçu si besoin */ }}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors pointer-events-auto"
                >
                  Aperçu détaillé
                </button>
              </div>
            </div>
            
            <div className="p-5 flex flex-col justify-between flex-grow bg-white z-20">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-gray-900 text-lg">{tpl.name}</h4>
                {tpl.is_premium && (
                  <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs px-2.5 py-1 rounded-full font-semibold border border-[#D4AF37]/20">Premium</span>
                )}
              </div>
              <button 
                onClick={() => handleSelect(tpl)}
                className="w-full bg-[#D4AF37] text-white px-4 py-3 rounded-lg font-medium text-sm hover:bg-[#B4952F] transition-colors shadow-sm"
              >
                Choisir ce modèle
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 text-center">
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          ← Retour
        </button>
      </div>
    </div>
  )
}

