'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Email ou mot de passe incorrect')
  }

  const redirectPath = formData.get('redirect') as string
  const nextPath = redirectPath === 'checkout' ? '/checkout' : '/dashboard'

  revalidatePath(nextPath, 'layout')
  redirect(nextPath)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('fullName') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=Erreur lors de la création du compte')
  }

  const redirectPath = formData.get('redirect') as string
  const nextPath = redirectPath === 'checkout' ? '/checkout' : '/dashboard'

  revalidatePath(nextPath, 'layout')
  redirect(nextPath)
}

export async function loginWithProvider(provider: 'google' | 'apple') {
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
