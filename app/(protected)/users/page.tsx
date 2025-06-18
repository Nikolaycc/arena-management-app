"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useTauriApiClient } from "@/lib/api-client";
import { TauriApiClient } from "@/lib/api-client";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/UsersTable/user-table";
import { userColumns } from "@/components/UsersTable/columns";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

async function getUser(api: TauriApiClient) {
  const users = await api.get<User[]>("/users");
  return users;
}

function NoPermissionFallback() {
  return (
    <SidebarInset className="flex flex-col h-full">
      <SiteHeader title="Users" />
      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-destructive">
              <AlertCircle className="h-full w-full" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to view the users page. Please contact
              your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useTauriApiClient();
  const { hasPermission } = useSession();

  const canViewUsers = hasPermission("user.read");
  const canCreateUsers = hasPermission("user.create");
  const canUpdateUsers = hasPermission("user.update");
  const canDeleteUsers = hasPermission("user.delete");

  useEffect(() => {
    if (canViewUsers && users.length === 0 && !isLoadingUsers) {
      setIsLoadingUsers(true);
      setError(null);

      getUser(api)
        .then((fetchedUsers) => {
          setUsers(fetchedUsers);
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
          setError("Failed to load users. Please try again.");
        })
        .finally(() => {
          setIsLoadingUsers(false);
        });
    }
  }, [canViewUsers, users.length, isLoadingUsers, api]);

  // Show access denied if user doesn't have permission
  return (
    <PermissionWrapper
      permission="user.read"
      fallback={<NoPermissionFallback />}
      showFallback={true}
    >
      <SidebarInset className="flex flex-col h-full">
        <SiteHeader title="Users" />
        <div className="flex flex-1 flex-col overflow-auto px-10">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Show permissions info for debugging */}
              {process.env.NODE_ENV === "development" && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">
                    User Permissions (Dev Only):
                  </h3>
                  <ul className="text-sm space-y-1">
                    <li>View Users: {canViewUsers ? "✅" : "❌"}</li>
                    <li>Create Users: {canCreateUsers ? "✅" : "❌"}</li>
                    <li>Update Users: {canUpdateUsers ? "✅" : "❌"}</li>
                    <li>Delete Users: {canDeleteUsers ? "✅" : "❌"}</li>
                  </ul>
                </div>
              )}

              {error && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-destructive">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingUsers ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <DataTable columns={userColumns} data={users} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </PermissionWrapper>
  );
}
