import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

import { NextResponse } from 'next/server'
import { STAGED_PAGE } from '@/lib/modelPreview'

const MOBILE_UA = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini/i

/**
 * Invitation ouverte directement sur ordinateur (démo, modèle importé, lien d'invitation) : affichée au centre,
 * devant la couverture floutée (/apercu), à la même adresse. Pas dans un cadre (studios, aperçus), pas sur mobile.
 */
function stagedInvitation(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  if (request.method !== 'GET' || !STAGED_PAGE.test(pathname) || searchParams.get('demo') === '1') return null
  if (request.headers.get('sec-fetch-dest') !== 'document') return null
  if (MOBILE_UA.test(request.headers.get('user-agent') ?? '')) return null
  const url = request.nextUrl.clone()
  url.pathname = '/apercu'
  url.search = `?${new URLSearchParams({ src: pathname })}`
  return NextResponse.rewrite(url)
}

export default async function proxy(request: NextRequest) {
  return stagedInvitation(request) ?? (await updateSession(request))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
