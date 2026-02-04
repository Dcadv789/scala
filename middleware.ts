import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/superadmin/login',
    '/admin/login',
    '/api/auth',
  ]

  const { pathname } = request.nextUrl

  // Verificar se a rota é pública
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  )

  // Se for rota pública, permitir acesso
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verificar autenticação
  // Verificar se tem token no cookie ou header
  const token = request.cookies.get('scalazap_auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Se não tiver token e estiver tentando acessar rota protegida
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/superadmin'))) {
    // Redirecionar para login apropriado
    const loginUrl = pathname.startsWith('/superadmin') 
      ? new URL('/superadmin/login', request.url)
      : new URL('/login', request.url)
    
    // Adicionar redirect_to para voltar após login
    loginUrl.searchParams.set('redirect_to', pathname)
    
    console.log('[MIDDLEWARE] ❌ Acesso negado - Redirecionando para login:', loginUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

