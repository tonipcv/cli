import { NextRequest, NextResponse } from "next/server";
import { whatsappService } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  try {
    const chats = await whatsappService.getChats();
    
    // Transform chat data to avoid serialization issues
    const serializedChats = chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name,
      timestamp: chat.timestamp,
      lastMessage: chat.lastMessage?.body || '',
      unreadCount: chat.unreadCount || 0,
    }));

    return NextResponse.json({ chats: serializedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
} 