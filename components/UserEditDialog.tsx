import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useTauriApiClient } from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPermissions } from "@/types";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Role {
  id: string;
  name: string;
  description?: string | null;
}

interface Permission {
  id: string;
  name: string;
  description?: string | null;
}

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserEditDialogProps) {
  const api = useTauriApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  const [formData, setFormData] = useState({
    nationalId: "",
    phoneNumber: "",
    email: "" as string | null,
    firstName: "",
    lastName: "",
    birthDate: "",
    address: "",
    adult: true,
    gender: "M" as "M" | "F" | "O",
    status: "active" as "ACTIVE" | "SUSPENDED" | "INACTIVE",
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        nationalId: user.nationalId,
        phoneNumber: user.phoneNumber,
        email: user.email || null,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : "",
        address: user.address || "",
        adult: user.adult,
        gender: user.gender,
        status: user.status,
      });
      fetchUserRolesAndPermissions(user.id);
    }
  }, [user]);

  // Fetch available roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const roles = await api.get<Role[]>("/roles");
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    }
  };

  const fetchUserRolesAndPermissions = async (userId: string) => {
    try {
      // Fetch user's current permissions
      const permissionsData = await api.get<UserPermissions>(
        `/permissions/user/${userId}`,
      );
      if (permissionsData && permissionsData.roles) {
        setUserRoles(permissionsData.roles.map((r: any) => r.id));
        setUserPermissions(permissionsData.permissions || []);
      }
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (
      !formData.nationalId ||
      !formData.phoneNumber ||
      !formData.firstName ||
      !formData.lastName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Update user basic info
      await api.patch(`/users/id/${user.id}`, {
        ...formData,
        birthDate: formData.birthDate || null,
      });

      // Update roles if changed - you'll need to implement this endpoint
      // This is a simplified example - your backend might handle this differently
      await api.put(`/users/${user.id}/roles`, {
        roleIds: userRoles,
      });

      toast.success("User updated successfully!");
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setUserRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and manage their roles and permissions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">
                      National ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) =>
                        setFormData({ ...formData, nationalId: e.target.value })
                      }
                      placeholder="00000000000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="+995 555 00 00 00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email ? formData.email : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value as "M" | "F" | "O",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adult"
                      checked={formData.adult}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, adult: !!checked })
                      }
                    />
                    <Label
                      htmlFor="adult"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is Adult
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as "ACTIVE" | "SUSPENDED" | "INACTIVE",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Email Verified:</span>{" "}
                      {user.emailVerified ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Phone Verified:</span>{" "}
                      {user.phoneVerified ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{" "}
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Manage User Roles</h3>
                <ScrollArea className="h-[350px] border rounded-md p-4">
                  <div className="space-y-3">
                    {availableRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={userRoles.includes(role.id)}
                            onCheckedChange={() => toggleRole(role.id)}
                          />
                          <div>
                            <Label
                              htmlFor={`role-${role.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {role.name}
                            </Label>
                            {role.description && (
                              <p className="text-xs text-muted-foreground">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {userRoles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Assigned roles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((roleId) => {
                      const role = availableRoles.find((r) => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} variant="secondary">
                          {role.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                These are the permissions inherited from the user's assigned
                roles. To modify permissions, edit the user's roles.
              </AlertDescription>
            </Alert>

            <div>
              <h3 className="text-sm font-medium mb-3">Current Permissions</h3>
              <ScrollArea className="h-[320px] border rounded-md p-4">
                {userPermissions.length > 0 ? (
                  <div className="space-y-2">
                    {userPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {permission.name}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Inherited
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No permissions assigned</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
