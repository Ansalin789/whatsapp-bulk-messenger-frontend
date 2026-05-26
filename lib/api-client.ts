// Utility for making authenticated API calls with automatic token refresh
import { getAccessToken, refreshAccessToken, logout } from "./auth";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function authenticatedFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get current access token
    const accessToken = getAccessToken();

    if (!accessToken) {
      return { success: false, error: "No authentication token available" };
    }

    // Add authorization header
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    // Make request
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired (401), try to refresh and retry once
    if (response.status === 401) {
      const refreshResult = await refreshAccessToken();

      if (refreshResult.success && refreshResult.data) {
        // Retry request with new token
        const newAccessToken = refreshResult.data.accessToken;
        headers.Authorization = `Bearer ${newAccessToken}`;

        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, logout user
        logout();
        return { success: false, error: "Session expired. Please login again." };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

// Example usage:
// const result = await authenticatedFetch<{ campaigns: any[] }>('/api/campaigns');
// if (result.success) {
//   console.log('Campaigns:', result.data);
// } else {
//   console.error('Error:', result.error);
// }
