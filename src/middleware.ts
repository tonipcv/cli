import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  console.log("Middleware - URL:", request.url);
  console.log("Middleware - Pathname:", request.nextUrl.pathname);
  
  // Ignorar requisições para arquivos estáticos
  if (
    request.nextUrl.pathname.includes('manifest.json') ||
    request.nextUrl.pathname.includes('icon.png') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  console.log("Middleware - Token:", !!token);
  
  const isAuthenticated = !!token

  // Lista de rotas protegidas
  const protectedRoutes = [
    '/checklist',
    '/oneweek', 
    '/circles',
    '/tasks',
    '/thoughts',
    '/checkpoints',
    '/profile',
    '/instagram'
  ]

  // Lista de rotas de autenticação
  const authRoutes = ['/auth/signin', '/auth/register']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  console.log("Middleware - Protected Route:", isProtectedRoute);
  console.log("Middleware - Auth Route:", isAuthRoute);
  console.log("Middleware - Is Authenticated:", isAuthenticated);

  // Se for uma rota protegida e o usuário não está autenticado
  if (isProtectedRoute && !isAuthenticated) {
    console.log("Middleware - Redirecionando para login");
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se for uma rota de auth e o usuário já está autenticado
  if (isAuthRoute && isAuthenticated) {
    console.log("Middleware - Usuário autenticado em rota de auth");
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    if (callbackUrl && callbackUrl.startsWith('/')) {
      console.log("Middleware - Redirecionando para:", callbackUrl);
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
    return NextResponse.redirect(new URL('/checklist', request.url))
  }

  return NextResponse.next()
}

// Configurar o matcher para incluir todas as rotas que precisam de verificação
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 