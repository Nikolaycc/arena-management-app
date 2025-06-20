"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetch } from "@tauri-apps/plugin-http";
import { User, SessionData, UserPermissions } from "@/types/index";

interface SessionContextType {
  session: SessionData | null;
  user: User | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "arena_session";
const REFRESH_TOKEN_KEY = "arena_refresh_token";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Parse JWT helper
  const parseJWT = (token: string) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  };

  // Fetch user profile
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

      const user = await response.json();
      return user;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async (
    accessToken: string,
  ): Promise<UserPermissions | null> => {
    try {
      const response = await fetch("http://localhost:3000/v1/permissions/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user permissions");
      }

      const permissions = await response.json();
      return permissions;
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      return null;
    }
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setSession(null);
  };

  // Refresh tokens
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
          deviceId: "web-app",
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

      // Fetch updated user profile and permissions
      const user = await fetchUserProfile(tokens.accessToken);
      const permissions = await fetchUserPermissions(tokens.accessToken);

      if (!user) {
        return false;
      }

      const sessionData: SessionData = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        permissions: permissions || undefined,
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

  // Login function
  const login = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      setIsLoading(true);

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

      // Fetch user permissions
      const permissions = await fetchUserPermissions(tokens.accessToken);

      const sessionData: SessionData = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        permissions: permissions || undefined,
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

  // Logout function
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

  // Fetch and update permissions helper
  const fetchAndUpdatePermissions = async (sessionData: SessionData) => {
    const permissions = await fetchUserPermissions(sessionData.accessToken);
    if (permissions) {
      const updatedSession = { ...sessionData, permissions };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      setSession(updatedSession);
    }
  };

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
            // Fetch permissions if not already in session
            if (!sessionData.permissions) {
              await fetchAndUpdatePermissions(sessionData);
            }
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

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    return session?.permissions?.permissionNames?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!session?.permissions?.permissionNames) return false;
    return permissions.some((perm) =>
      session.permissions!.permissionNames.includes(perm),
    );
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!session?.permissions?.permissionNames) return false;
    return permissions.every((perm) =>
      session.permissions!.permissionNames.includes(perm),
    );
  };

  const hasRole = (role: string): boolean => {
    return session?.permissions?.roles?.some((r) => r.name === role) || false;
  };

  const value: SessionContextType = {
    session,
    user: session?.user || null,
    permissions: session?.permissions || null,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
    refreshSession: refreshTokens,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
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
