import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Primeiro, verificar se temos uma conta do Instagram no banco de dados
    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!instagramAccount) {
      return NextResponse.json({ 
        error: 'No Instagram account connected',
        needsLogin: true 
      });
    }

    // Verificar o token e obter informações da página
    const pageResponse = await fetch(
      `https://graph.facebook.com/v20.0/${instagramAccount.pageId}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${instagramAccount.pageAccessToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!pageResponse.ok) {
      const error = await pageResponse.json();
      console.error('Page verification error:', error);
      
      // Se o token expirou, precisamos de um novo login
      if (error.error?.code === 190) {
        return NextResponse.json({ 
          error: 'Token expired',
          needsLogin: true 
        });
      }
      
      throw new Error(`Failed to verify page: ${JSON.stringify(error)}`);
    }

    const pageData = await pageResponse.json();

    // Log para debug
    console.log('=== Instagram Account Data ===');
    console.log(JSON.stringify(pageData, null, 2));

    return NextResponse.json({ 
      success: true, 
      data: pageData,
      account: {
        pageId: instagramAccount.pageId,
        instagramId: pageData.instagram_business_account?.id,
        username: pageData.instagram_business_account?.username,
        profilePicture: pageData.instagram_business_account?.profile_picture_url
      }
    });
  } catch (error) {
    console.error('=== Instagram Verify Error ===');
    console.error(error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 