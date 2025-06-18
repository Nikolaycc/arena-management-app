"use client";

import React from "react";
import { useSession } from "@/contexts/SessionContext";

interface PermissionWrapperProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function PermissionWrapper({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null,
  showFallback = false,
}: PermissionWrapperProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isLoading,
  } = useSession();

  if (isLoading) {
    return showFallback ? <>{fallback}</> : null;
  }

  let hasRequiredPermissions = true;
  if (permission) {
    hasRequiredPermissions = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  let hasRequiredRoles = true;
  if (role) {
    hasRequiredRoles = hasRole(role);
  } else if (roles.length > 0) {
    hasRequiredRoles = requireAll
      ? roles.every((r) => hasRole(r))
      : roles.some((r) => hasRole(r));
  }

  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
}
