import { prisma } from "@/lib/prisma";

export async function refreshInstagramToken(userId: string): Promise<string> {
  const instagramAccount = await prisma.instagramAccount.findUnique({
    where: { userId }
  });

  if (!instagramAccount?.accessToken) {
    throw new Error("No Instagram token found");
  }

  try {
    // Verify if token is still valid
    const response = await fetch(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/me?access_token=${instagramAccount.accessToken}`
    );

    if (response.ok) {
      return instagramAccount.accessToken;
    }

    // If token is invalid, refresh it
    const refreshResponse = await fetch(
      `${process.env.INSTAGRAM_GRAPH_API_URL}/refresh_access_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "ig_refresh_token",
          access_token: instagramAccount.accessToken,
        }),
      }
    );

    if (!refreshResponse.ok) {
      throw new Error("Failed to refresh token");
    }

    const { access_token: newToken } = await refreshResponse.json();

    // Update token in database
    await prisma.instagramAccount.update({
      where: { userId },
      data: {
        accessToken: newToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    });

    return newToken;
  } catch (error) {
    console.error("Error refreshing Instagram token:", error);
    throw new Error("Failed to refresh Instagram token");
  }
}

export async function getValidInstagramToken(userId: string): Promise<string> {
  try {
    return await refreshInstagramToken(userId);
  } catch (error) {
    throw new Error("Failed to get valid Instagram token");
  }
} 