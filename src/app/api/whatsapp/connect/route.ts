import { NextRequest, NextResponse } from "next/server";
import { whatsappService } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    if (!whatsappService) {
      throw new Error("WhatsApp service is not available");
    }

    if (!whatsappService.isConnected()) {
      await whatsappService.initialize();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error initializing WhatsApp:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to initialize WhatsApp" 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!whatsappService) {
      throw new Error("WhatsApp service is not available");
    }

    // Initialize if not already initialized
    if (!whatsappService.isConnected() && whatsappService.getConnectionState() === 'disconnected') {
      await whatsappService.initialize();
    }

    const qrCode = whatsappService.getQRCode();
    const connectionState = whatsappService.getConnectionState();
    const isConnected = whatsappService.isConnected();

    return NextResponse.json({
      qrCode,
      connectionState,
      isConnected,
    });
  } catch (error) {
    console.error("Error getting WhatsApp status:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to get WhatsApp status" 
    }, { status: 500 });
  }
} 