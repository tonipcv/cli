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

    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!instagramAccount) {
      return NextResponse.json(
        { error: 'Instagram not connected' },
        { status: 400 }
      );
    }

    // Extract threadId from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const threadId = segments[segments.length - 1];

    // Get messages from Instagram API
    const response = await fetch(
      `https://graph.instagram.com/${threadId}/messages?access_token=${instagramAccount.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages from Instagram');
    }

    const data = await response.json();

    // Update or create messages in database
    const messages = await Promise.all(
      data.data.map(async (message: any) => {
        return prisma.instagramMessage.upsert({
          where: {
            messageId: message.id,
          },
          update: {
            content: message.text,
            timestamp: new Date(message.timestamp),
            isRead: true,
          },
          create: {
            messageId: message.id,
            threadId,
            fromId: message.from.id,
            toId: message.to.id,
            content: message.text,
            timestamp: new Date(message.timestamp),
            userId: session.user.id,
          },
        });
      })
    );

    return NextResponse.json({
      messages: messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      ),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 