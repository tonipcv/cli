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

    if (!instagramAccount) {
      return NextResponse.json(
        { error: 'Instagram not connected' },
        { status: 400 }
      );
    }

    // Get threads from Instagram API
    const response = await fetch(
      `https://graph.instagram.com/me/conversations?access_token=${instagramAccount.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch threads from Instagram');
    }

    const data = await response.json();

    // Update or create threads in database
    const threads = await Promise.all(
      data.data.map(async (thread: any) => {
        return prisma.instagramThread.upsert({
          where: {
            threadId: thread.id,
          },
          update: {
            participantId: thread.participants.data[0].id,
            participantName: thread.participants.data[0].username,
            lastMessage: thread.last_message?.text,
            lastMessageAt: thread.last_message?.timestamp
              ? new Date(thread.last_message.timestamp)
              : undefined,
          },
          create: {
            threadId: thread.id,
            userId: session.user.id,
            participantId: thread.participants.data[0].id,
            participantName: thread.participants.data[0].username,
            lastMessage: thread.last_message?.text,
            lastMessageAt: thread.last_message?.timestamp
              ? new Date(thread.last_message.timestamp)
              : undefined,
          },
        });
      })
    );

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 