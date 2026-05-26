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
    // Store tokens
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("accessExp", accessExpiry.toString());
    localStorage.setItem("refreshExp", refreshExpiry.toString());
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", data.email);
    localStorage.setItem("userId", data.userId || data.id || data.username);

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

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessExp");
  localStorage.removeItem("refreshExp");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function isAuthenticated() {
  const token = localStorage.getItem("accessToken");
  return !!token;
}

export function getUserId() {
  return localStorage.getItem("userId");
}

export function initializeAuth() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    logout();
  }
}
