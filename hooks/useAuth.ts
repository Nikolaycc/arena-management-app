import { useSession } from "@/contexts/SessionContext";
import { useApiClient } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

interface SendOtpParams {
  phone: string;
}

interface VerifyOtpParams {
  phone: string;
  code: string;
  deviceId?: string;
}

interface RegisterParams {
  nationalId: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  address?: string;
  adult: boolean;
  gender: "M" | "F" | "O";
  metadata?: string;
}

export function useAuth() {
  const { login, logout, isAuthenticated, isLoading, user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendOtp = async ({ phone }: SendOtpParams) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send OTP");
      }

      const result = await response.json();
      toast.success("OTP sent successfully!");
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async ({
    phone,
    code,
    deviceId = "web-app",
  }: VerifyOtpParams) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, code, deviceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid OTP");
      }

      const tokens = await response.json();
      await login(tokens);
      toast.success("Login successful!");
      return tokens;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid OTP";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (userData: RegisterParams) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();
      toast.success("Registration OTP sent successfully!");
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyRegistration = async (userData: RegisterParams, code: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/auth/register-verify/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration verification failed");
      }

      const tokens = await response.json();
      await login(tokens);
      toast.success("Registration successful!");
      return tokens;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration verification failed";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    isAuthenticated,
    isLoading,
    isSubmitting,
    user,

    // Actions
    sendOtp,
    verifyOtp,
    register,
    verifyRegistration,
    logout,
  };
}

export function usePermissions() {
  const { user } = useSession();
  const apiClient = useApiClient();

  const checkPermission = (permission: string): boolean => {
    // Since your backend handles permissions but the frontend doesn't get them
    // in the current user object, you might need to fetch them separately
    // or include them in the JWT payload
    return true; // Placeholder - implement based on your needs
  };

  const hasRole = (role: string): boolean => {
    // Similarly, implement role checking
    return true; // Placeholder
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => checkPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => checkPermission(permission));
  };

  return {
    checkPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
}
