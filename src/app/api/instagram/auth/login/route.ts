import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Configuração básica
    const config = {
      client_id: '737017615149021',
      redirect_uri: 'https://f486-2804-7f0-bf83-c1e7-8015-a25f-f675-e1b8.ngrok-free.app/api/instagram/auth/callback',
      scope: 'pages_show_list,instagram_basic,instagram_manage_messages,pages_messaging',
      response_type: 'code',
      state: Math.random().toString(36).substring(7)
    };

    // Log de configuração
    console.log('=== Facebook Login Configuration ===');
    console.log(JSON.stringify(config, null, 2));

    // URL simplificada do Facebook
    const baseUrl = 'https://www.facebook.com/v20.0/dialog/oauth';
    const params = new URLSearchParams(config);
    const loginUrl = `${baseUrl}?${params.toString()}`;

    // Log da URL final
    console.log('=== Facebook Login URL ===');
    console.log(loginUrl);

    return NextResponse.json({ 
      url: loginUrl,
      debug: {
        config,
        baseUrl,
        finalUrl: loginUrl
      }
    });
  } catch (error) {
    console.error('=== Facebook Login Error ===');
    console.error(error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: errorMessage,
        debug: { error: String(error) }
      },
      { status: 500 }
    );
  }
} 