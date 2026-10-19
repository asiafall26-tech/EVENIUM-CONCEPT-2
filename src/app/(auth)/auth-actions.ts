'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !authData.user) {
    const errorUrl = redirectTo 
      ? `/login?error=Email ou mot de passe incorrect&redirectTo=${encodeURIComponent(redirectTo)}` 
      : '/login?error=Email ou mot de passe incorrect'
    redirect(errorUrl)
  }

  // Fetch user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const role = profile?.role || authData.user.user_metadata?.role || 'client'

  // Determine destination
  let destination = '/dashboard'
  if (role === 'prestataire') {
    destination = '/prestataire'
  } else if (role === 'admin') {
    destination = '/admin'
  }

  // Honor redirectTo if it is a valid path appropriate for the user's role
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    if (role === 'admin') {
      destination = redirectTo
    } else if (role === 'prestataire' && redirectTo.startsWith('/prestataire')) {
      destination = redirectTo
    } else if (role === 'client' && (redirectTo.startsWith('/dashboard') || redirectTo.startsWith('/events'))) {
      destination = redirectTo
    }
  }

  if (role === 'prestataire') {
    revalidatePath('/prestataire', 'layout')
  } else if (role === 'admin') {
    revalidatePath('/admin', 'layout')
  } else {
    revalidatePath('/dashboard', 'layout')
  }

  redirect(destination)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const role = (formData.get('role') as string) || 'client'
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error || !authData.user) {
    const errorUrl = redirectTo 
      ? `/register?error=Erreur lors de la création du compte&redirectTo=${encodeURIComponent(redirectTo)}` 
      : '/register?error=Erreur lors de la création du compte'
    redirect(errorUrl)
  }

  let destination = role === 'prestataire' ? '/prestataire' : '/dashboard'
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    if (role === 'prestataire' && redirectTo.startsWith('/prestataire')) {
      destination = redirectTo
    } else if (role === 'client' && (redirectTo.startsWith('/dashboard') || redirectTo.startsWith('/events'))) {
      destination = redirectTo
    }
  }

  if (role === 'prestataire') {
    revalidatePath('/prestataire', 'layout')
  } else {
    revalidatePath('/dashboard', 'layout')
  }

  redirect(destination)
}

export async function loginWithProvider(provider: 'google' | 'apple' | 'github') {
  const supabase = await createClient()
  
  // NOTE: This approach requires the browser to redirect to the URL returned
  // by Supabase. So we return the URL and let the client handle the redirect.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
