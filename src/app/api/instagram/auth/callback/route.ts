import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=auth_failed', request.url)
      );
    }

    // Troca o código pelo token de acesso do Facebook
    const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?` +
      `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
      `&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}` +
      `&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI as string)}` +
      `&code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for Facebook token');
    }

    const tokenData = await tokenResponse.json();
    const fbAccessToken = tokenData.access_token;

    // Obter lista de páginas do usuário
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${fbAccessToken}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to get Facebook pages');
    }

    const pagesData = await pagesResponse.json();
    const page = pagesData.data[0]; // Usar a primeira página encontrada

    if (!page) {
      throw new Error('No Facebook pages found');
    }

    // Obter o Instagram Business Account conectado à página
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!igAccountResponse.ok) {
      throw new Error('Failed to get Instagram business account');
    }

    const igAccountData = await igAccountResponse.json();
    
    if (!igAccountData.instagram_business_account) {
      throw new Error('No Instagram business account connected to the page');
    }

    // Salvar as informações no banco de dados
    await prisma.instagramAccount.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        accessToken: page.access_token,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        scope: 'instagram_basic,instagram_manage_messages,pages_messaging',
        pageId: page.id,
        pageAccessToken: page.access_token,
      },
      create: {
        userId: session.user.id,
        accessToken: page.access_token,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        scope: 'instagram_basic,instagram_manage_messages,pages_messaging',
        pageId: page.id,
        pageAccessToken: page.access_token,
      },
    });

    return NextResponse.redirect(new URL('/instagram/inbox', request.url));
  } catch (error) {
    console.error('Instagram callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
} 