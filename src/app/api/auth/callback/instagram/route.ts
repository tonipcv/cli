import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the code from URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error?message=No code provided`);
    }

    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error?message=Not authenticated`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_APP_ID!,
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Error exchanging code for token:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Failed to exchange code`
      );
    }

    const { access_token, user_id } = await tokenResponse.json();

    // Get long-lived token
    const longLivedTokenResponse = await fetch(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/oauth/access_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          access_token,
        }),
      }
    );

    if (!longLivedTokenResponse.ok) {
      const error = await longLivedTokenResponse.text();
      console.error("Error getting long-lived token:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Failed to get long-lived token`
      );
    }

    const { access_token: longLivedToken } = await longLivedTokenResponse.json();

    // Save to database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        instagramAccessToken: longLivedToken,
        instagramUserId: user_id,
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error("Error in Instagram callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Internal server error`
    );
  }
} 