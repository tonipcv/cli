import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.error('=== Instagram Callback Error: No Session ===');
      console.error('User not authenticated');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorCode = searchParams.get('error_code');
    const errorReason = searchParams.get('error_reason');

    // Log detalhado dos parâmetros recebidos
    console.log('=== Instagram Callback Parameters ===');
    console.log('Code:', code);
    console.log('State:', state);
    console.log('Error:', error);
    console.log('Error Description:', errorDescription);
    console.log('Error Code:', errorCode);
    console.log('Error Reason:', errorReason);

    if (error) {
      console.error('=== Instagram Callback Error: Facebook OAuth Error ===');
      console.error('Error Type:', error);
      console.error('Error Description:', errorDescription);
      console.error('Error Code:', errorCode);
      console.error('Error Reason:', errorReason);
      throw new Error(`Facebook OAuth Error: ${errorDescription || error} (Code: ${errorCode}, Reason: ${errorReason})`);
    }

    if (!code) {
      console.error('=== Instagram Callback Error: No Code ===');
      console.error('No authorization code received from Facebook');
      throw new Error('No authorization code received from Facebook');
    }

    // Log da tentativa de troca de código por token
    console.log('=== Instagram Token Exchange Attempt ===');
    console.log('Client ID:', process.env.INSTAGRAM_APP_ID);
    console.log('Redirect URI:', process.env.INSTAGRAM_REDIRECT_URI);

    // Troca o código pelo token de acesso do Facebook
    const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?` +
      `client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
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
      const errorData = await tokenResponse.json();
      console.error('=== Instagram Callback Error: Token Exchange Failed ===');
      console.error('Status:', tokenResponse.status);
      console.error('Status Text:', tokenResponse.statusText);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to exchange code for Facebook token: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code})`);
    }

    const tokenData = await tokenResponse.json();
    console.log('=== Instagram Token Exchange Success ===');
    console.log('Token Data:', JSON.stringify(tokenData, null, 2));

    const fbAccessToken = tokenData.access_token;

    // Obter lista de páginas do usuário
    console.log('=== Instagram Pages Fetch Attempt ===');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${fbAccessToken}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      console.error('=== Instagram Callback Error: Pages Fetch Failed ===');
      console.error('Status:', pagesResponse.status);
      console.error('Status Text:', pagesResponse.statusText);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to get Facebook pages: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code})`);
    }

    const pagesData = await pagesResponse.json();
    console.log('=== Instagram Pages Fetch Success ===');
    console.log('Pages Data:', JSON.stringify(pagesData, null, 2));

    const page = pagesData.data[0]; // Usar a primeira página encontrada

    if (!page) {
      console.error('=== Instagram Callback Error: No Pages Found ===');
      console.error('User has no Facebook pages');
      throw new Error('No Facebook pages found for this user');
    }

    // Obter o Instagram Business Account conectado à página
    console.log('=== Instagram Business Account Fetch Attempt ===');
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!igAccountResponse.ok) {
      const errorData = await igAccountResponse.json();
      console.error('=== Instagram Callback Error: Business Account Fetch Failed ===');
      console.error('Status:', igAccountResponse.status);
      console.error('Status Text:', igAccountResponse.statusText);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to get Instagram business account: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code})`);
    }

    const igAccountData = await igAccountResponse.json();
    console.log('=== Instagram Business Account Fetch Success ===');
    console.log('Account Data:', JSON.stringify(igAccountData, null, 2));
    
    if (!igAccountData.instagram_business_account) {
      console.error('=== Instagram Callback Error: No Business Account ===');
      console.error('Page has no Instagram business account connected');
      throw new Error('No Instagram business account connected to the page');
    }

    // Salvar as informações no banco de dados
    console.log('=== Instagram Database Update Attempt ===');
    try {
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
      console.log('=== Instagram Database Update Success ===');
    } catch (dbError) {
      console.error('=== Instagram Callback Error: Database Update Failed ===');
      console.error('Database Error:', dbError);
      throw new Error('Failed to save Instagram account data to database');
    }

    // Log de sucesso
    console.log('=== Instagram Connection Success ===');
    console.log('User ID:', session.user.id);
    console.log('Page ID:', page.id);
    console.log('Instagram Business Account:', igAccountData.instagram_business_account);

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('=== Instagram Callback Error: General Error ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url));
  }
} 