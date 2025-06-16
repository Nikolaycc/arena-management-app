import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export class TauriApiClient {
  private baseURL: string;
  private getAccessToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(
    baseURL: string,
    getAccessToken: () => string | null,
    onUnauthorized: () => void,
  ) {
    this.baseURL = baseURL;
    this.getAccessToken = getAccessToken;
    this.onUnauthorized = onUnauthorized;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      // Use Tauri's fetch instead of browser fetch
      const response = await tauriFetch(url, config);

      if (response.status === 401) {
        this.onUnauthorized();
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Hook to use the Tauri API client with session context
import { useSession } from "@/contexts/SessionContext";

export class BrowserApiClient {
  private baseURL: string;
  private getAccessToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(
    baseURL: string,
    getAccessToken: () => string | null,
    onUnauthorized: () => void,
  ) {
    this.baseURL = baseURL;
    this.getAccessToken = getAccessToken;
    this.onUnauthorized = onUnauthorized;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.onUnauthorized();
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export function useTauriApiClient() {
  const { session, logout } = useSession();

  const client = new TauriApiClient(
    "http://localhost:3000/v1", // Direct localhost URL for Tauri
    () => session?.accessToken || null,
    logout,
  );

  return client;
}

export function useBrowserApiClient() {
  const { session, logout } = useSession();

  const client = new BrowserApiClient(
    "http://localhost:3000/v1", // Direct localhost URL for Tauri
    () => session?.accessToken || null,
    logout,
  );

  return client;
}

// For environments where Tauri's fetch might not be available (like web),
// fall back to regular fetch
export function useApiClient() {
  // Check if we're in a Tauri environment
  const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

  if (isTauri) {
    return useTauriApiClient();
  }

  // Fallback to regular fetch-based client
  const client = useBrowserApiClient();

  return client;
}
