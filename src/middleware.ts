import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  // Log para debug
  console.log('=== Middleware Debug ===');
  console.log('Path:', request.nextUrl.pathname);

  // Ignorar requisições para arquivos estáticos e rotas do Instagram
  if (
    request.nextUrl.pathname.includes('manifest.json') ||
    request.nextUrl.pathname.includes('icon.png') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/instagram') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    console.log('Skipping middleware for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isAuthenticated = !!token
  console.log('Is authenticated:', isAuthenticated);

  // Lista de rotas protegidas (excluindo Instagram)
  const protectedRoutes = [
    '/checklist',
    '/oneweek', 
    '/circles',
    '/tasks',
    '/thoughts',
    '/checkpoints',
    '/profile'
  ]

  // Lista de rotas de autenticação
  const authRoutes = ['/auth/signin', '/auth/register']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  console.log('Is protected route:', isProtectedRoute);
  console.log('Is auth route:', isAuthRoute);

  // Se for uma rota protegida e o usuário não está autenticado
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl)
  }

  // Se for uma rota de auth e o usuário já está autenticado
  if (isAuthRoute && isAuthenticated) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    if (callbackUrl && callbackUrl.startsWith('/')) {
      console.log('Redirecting to callback URL:', callbackUrl);
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
    console.log('Redirecting to checklist');
    return NextResponse.redirect(new URL('/checklist', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 