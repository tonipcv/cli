import { NextRequest, NextResponse } from "next/server";
import { whatsappService } from "@/lib/whatsapp";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chat = await whatsappService.getChatById(params.chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const messages = await chat.fetchMessages({ limit: 50 });
    
    // Transform message data to avoid serialization issues
    const serializedMessages = messages.map(message => ({
      id: message.id._serialized,
      body: message.body,
      timestamp: message.timestamp,
      fromMe: message.fromMe,
    }));

    return NextResponse.json({ messages: serializedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const message = await whatsappService.sendMessage(params.chatId, content);
    
    if (!message) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Transform message data to avoid serialization issues
    const serializedMessage = {
      id: message.id._serialized,
      body: message.body,
      timestamp: message.timestamp,
      fromMe: message.fromMe,
    };

    return NextResponse.json({ message: serializedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
} 