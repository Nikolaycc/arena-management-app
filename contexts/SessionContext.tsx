"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  birthDate?: string;
  address?: string;
  adult: boolean;
  gender: "M" | "F" | "O";
  status: "active" | "suspended" | "inactive";
  emailVerified: boolean;
  phoneVerified: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

interface SessionContextType {
  session: SessionData | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "arena_session";
const REFRESH_TOKEN_KEY = "arena_refresh_token";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSession) {
          const sessionData: SessionData = JSON.parse(storedSession);

          // Check if token is expired
          if (Date.now() >= sessionData.expiresAt) {
            // Try to refresh token
            const refreshed = await refreshTokens();
            if (!refreshed) {
              clearSession();
            }
          } else {
            setSession(sessionData);
          }
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!session) return;

    const timeUntilExpiry = session.expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000); // 5 minutes before expiry, min 1 minute

    const timer = setTimeout(() => {
      refreshTokens();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [session]);

  const parseJWT = (token: string) => {
    console.log(token);
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  };

  const fetchUserProfile = async (
    accessToken: string,
  ): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:3000/v1/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  };

  const login = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      setIsLoading(true);

      console.log(tokens);

      // Parse JWT to get expiry
      const payload = parseJWT(tokens.accessToken);
      if (!payload) {
        throw new Error("Invalid access token");
      }

      // Fetch user profile
      const user = await fetchUserProfile(tokens.accessToken);
      if (!user) {
        throw new Error("Failed to fetch user profile");
      }

      const sessionData: SessionData = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        expiresAt: payload.exp * 1000, // Convert to milliseconds
      };

      // Store in localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      setSession(sessionData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return false;
      }

      const response = await fetch("http://localhost:3000/v1/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          deviceId: "web-app", // You can make this dynamic
        }),
      });

      if (!response.ok) {
        return false;
      }

      const tokens = await response.json();

      // Parse new access token
      const payload = parseJWT(tokens.accessToken);
      if (!payload) {
        return false;
      }

      // Fetch updated user profile
      const user = await fetchUserProfile(tokens.accessToken);
      if (!user) {
        return false;
      }

      const sessionData: SessionData = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        expiresAt: payload.exp * 1000,
      };

      // Update storage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      setSession(sessionData);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setSession(null);
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a session
      if (session) {
        await fetch("http://localhost:3000/v1/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  const value: SessionContextType = {
    session,
    user: session?.user || null,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
    refreshSession: refreshTokens,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
