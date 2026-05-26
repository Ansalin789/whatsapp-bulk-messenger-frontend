import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
  username: string;
  password: string;
}

// Mock user database
const VALID_USERS = {
  demo: "password123",
  admin: "admin123",
};

// In production, use a proper JWT library and secure secrets
function generateToken(payload: Record<string, unknown>, expiresIn: number = 3600): string {
  // Mock token generation - in production use jsonwebtoken or jose
  return `token_${Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + expiresIn * 1000 })).toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate credentials
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check credentials (in production, query database and verify hashed password)
    const validPassword = VALID_USERS[username as keyof typeof VALID_USERS];
    if (!validPassword || validPassword !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateToken({ username, type: "access" }, 3600); // 1 hour
    const refreshToken = generateToken({ username, type: "refresh" }, 86400 * 7); // 7 days

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: 3600,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
