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
      return NextResponse.redirect(new URL('/auth/signin', request.url));
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

    // Troca o código pelo token de acesso do Facebook usando o fluxo de Authorization Code
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

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('No Facebook pages found for this user');
    }

    // Encontrar a página do Instagram
    const instagramPage = pagesData.data.find((page: any) => page.instagram_business_account);
    if (!instagramPage) {
      throw new Error('No Instagram Business Account found for this user');
    }

    // Obter o token de acesso da página
    const pageAccessToken = instagramPage.access_token;

    // Obter informações da conta do Instagram
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v20.0/${instagramPage.instagram_business_account.id}?fields=id,username,profile_picture_url&access_token=${pageAccessToken}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    if (!instagramResponse.ok) {
      const errorData = await instagramResponse.json();
      console.error('=== Instagram Callback Error: Instagram Account Fetch Failed ===');
      console.error('Status:', instagramResponse.status);
      console.error('Status Text:', instagramResponse.statusText);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to get Instagram account info: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code})`);
    }

    const instagramData = await instagramResponse.json();
    console.log('=== Instagram Account Info ===');
    console.log('Instagram Data:', JSON.stringify(instagramData, null, 2));

    // Salvar ou atualizar a conta do Instagram no banco de dados
    const instagramAccount = await prisma.instagramAccount.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        accessToken: fbAccessToken,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        scope: tokenData.scope,
        pageId: instagramPage.id,
        pageAccessToken: pageAccessToken,
      },
      create: {
        userId: session.user.id,
        accessToken: fbAccessToken,
        tokenType: 'bearer',
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        scope: tokenData.scope,
        pageId: instagramPage.id,
        pageAccessToken: pageAccessToken,
      },
    });

    console.log('=== Instagram Account Saved ===');
    console.log('Instagram Account:', JSON.stringify(instagramAccount, null, 2));

    // Redirecionar para a página de sucesso
    return NextResponse.redirect(new URL('/instagram/inbox', request.url));
  } catch (error) {
    console.error('=== Instagram Callback Error ===');
    console.error(error);
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url));
  }
} 