import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      isConnected: !!instagramAccount,
      expiresAt: instagramAccount?.expiresAt,
    });
  } catch (error) {
    console.error('Error checking Instagram status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 