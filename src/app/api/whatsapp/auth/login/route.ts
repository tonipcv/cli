import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateState } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const state = generateState();
    const clientId = process.env.WHATSAPP_CLIENT_ID;
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://ig.booplabs.com"
      : process.env.NEXT_PUBLIC_APP_URL;

    const redirectUri = `${baseUrl}/api/whatsapp/auth/callback`;

    const url = `https://business.facebook.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=whatsapp_business_management,whatsapp_business_messaging&response_type=code&state=${state}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating WhatsApp auth URL:", error);
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
  }
} 