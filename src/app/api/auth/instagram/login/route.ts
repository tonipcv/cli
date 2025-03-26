import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=${process.env.INSTAGRAM_SCOPE}&response_type=code`;
  
  return NextResponse.redirect(authUrl);
} 