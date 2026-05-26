import { NextRequest, NextResponse } from "next/server";

interface RefreshRequest {
  refreshToken: string;
}

function generateToken(payload: Record<string, unknown>, expiresIn: number = 3600): string {
  return `token_${Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + expiresIn * 1000 })).toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshRequest = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // In production, verify the refresh token signature and expiration
    // For now, we'll do basic validation
    if (!refreshToken.startsWith("token_")) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Decode token to get user info (in production, verify JWT signature)
    let username = "demo"; // Default fallback
    try {
      const decodedPayload = Buffer.from(refreshToken.replace("token_", ""), "base64").toString("utf-8");
      const payload = JSON.parse(decodedPayload);
      username = payload.username || "demo";
    } catch (e) {
      // Continue with default username
    }

    // Generate new access token
    const newAccessToken = generateToken({ username, type: "access" }, 3600);

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken, // Usually stays the same unless rotated
          expiresIn: 3600,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Token refresh failed" },
      { status: 500 }
    );
  }
}
