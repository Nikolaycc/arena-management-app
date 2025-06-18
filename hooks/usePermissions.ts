import { useSession } from "@/contexts/SessionContext";

export function usePermissions() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    permissions,
    isLoading,
  } = useSession();

  const can = {
    viewUsers: () => hasPermission("user.read"),
    createUsers: () => hasPermission("user.create"),
    updateUsers: () => hasPermission("user.update"),
    deleteUsers: () => hasPermission("user.delete"),
    manageUsers: () =>
      hasAnyPermission(["user.create", "user.update", "user.delete"]),

    viewAnalytics: () => hasPermission("analytics.read"),
    viewReports: () => hasPermission("reports.read"),
    viewSettings: () => hasPermission("settings.read"),

    check: (permission: string) => hasPermission(permission),
    checkAny: (permissions: string[]) => hasAnyPermission(permissions),
    checkAll: (permissions: string[]) => hasAllPermissions(permissions),
    checkRole: (role: string) => hasRole(role),
  };

  const isAdmin = hasRole("Admin") || hasRole("SuperAdmin");
  const isSuperAdmin = hasRole("SuperAdmin");
  const allPermissions = permissions?.permissionNames || [];
  const allRoles = permissions?.roles?.map((r) => r.name) || [];

  return {
    can,
    isAdmin,
    isSuperAdmin,
    allPermissions,
    allRoles,
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
