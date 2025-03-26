import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', '/instagram/inbox');
      return NextResponse.redirect(signInUrl);
    }

    console.log('=== Instagram Login Debug ===');
    console.log('User:', session.user);

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, '');
    const redirectUri = `${baseUrl}/api/instagram/auth/callback`;
    const state = Math.random().toString(36).substring(7);

    console.log('=== Instagram Login URL Parameters ===');
    console.log('Client ID:', process.env.INSTAGRAM_APP_ID);
    console.log('Base URL:', baseUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('State:', state);

    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?` +
      `client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging` +
      `&state=${state}` +
      `&response_type=code` +
      `&auth_type=rerequest` +
      `&display=popup` +
      `&client_type=business` +
      `&app_type=business`;

    console.log('=== Facebook OAuth URL ===');
    console.log(authUrl);

    // Return the URL instead of redirecting
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Error in Instagram login:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Instagram login' },
      { status: 500 }
    );
  }
} 