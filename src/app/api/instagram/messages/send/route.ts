import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { threadId, message } = body;

    if (!threadId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Send message through Instagram API
    const response = await fetch(
      `https://graph.instagram.com/${threadId}/messages?access_token=${instagramAccount.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message to Instagram');
    }

    const data = await response.json();

    // Save message to database
    const savedMessage = await prisma.instagramMessage.create({
      data: {
        messageId: data.id,
        threadId: threadId,
        fromId: session.user.id,
        toId: threadId, // This should be the participant's ID in a real implementation
        content: message,
        timestamp: new Date(),
        userId: session.user.id,
      },
    });

    // Update thread's last message
    await prisma.instagramThread.update({
      where: {
        threadId: threadId,
      },
      data: {
        lastMessage: message,
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 