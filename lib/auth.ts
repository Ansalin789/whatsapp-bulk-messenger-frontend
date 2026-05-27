import {
  setAccessToken,
  setRefreshToken,
  getAccessToken as getToken,
  getRefreshToken as getStoredRefreshToken,
  logout as clearTokens,
  setEmail,
  setUsername,
  setUserId,
  setRefreshExp,
  setAccessExp,
  getUsername as getStoredUsername,
  getUserId as getStoredUserId,

} from "../utils/authStorage";

const API_URL = "http://localhost:5000/auth/v1/login";

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  accessExp: number;
  refreshExp: number;
  username: string;
  email: string;
  userId?: string;
  id?: string;
}

export interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  error?: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    // console.log("🔐 Attempting login with URL:", API_URL);
    // console.log("📤 Request payload:", {
    //   username,
    //   deviceId: "device-001",
    //   appVersion: "1.0.0",
    //   role: "ADMIN",
    // });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        deviceId: "device-001",
        appVersion: "1.0.0",
        role: "ADMIN",
      }),
    });

    console.log("📍 Response status:", response.status, response.statusText);

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError);
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Login failed (${response.status})`,
      };
    }
    const accessExpiry =
  Math.floor(Date.now() / 1000) +
  data.accessExp;

const refreshExpiry =
  Math.floor(Date.now() / 1000) +
  data.refreshExp;
setAccessToken(data.accessToken);
setRefreshToken(data.refreshToken);

setAccessExp(accessExpiry);
setRefreshExp(refreshExpiry);

setUsername(data.username);
setEmail(data.email);
if (data.userId) {
  setUserId(data.userId);
} else if (data.id) {
  setUserId(data.id);
}

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Login error:", errorMsg);
    return {
      success: false,
      error: errorMsg.includes("Failed to fetch")
        ? "Cannot connect to server at http://localhost:5000. Is the backend running?"
        : errorMsg,
    };
  }
}

export async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return { success: false, error: "No refresh token available" };
  }

  try {
    const response = await fetch("http://localhost:5000/auth/v1/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || `Unable to refresh token (${response.status})`,
      };
    }

    const result = await response.json();
    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
      if (result.data.refreshToken) {
        setRefreshToken(result.data.refreshToken);
      }
      return {
        success: true,
        data: {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        },
      };
    }

    return {
      success: false,
      error: result.error || "Failed to refresh token",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

export function logout() {
  clearTokens();
}

export function getAccessToken() {
  return getToken();
}

export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

export function getUserId() {
  return getStoredUserId();
}

export function getUsername() {
  return getStoredUsername();
}



export function initializeAuth() {
  const token = getToken();

  if (!token) {
    logout();
  }
}
