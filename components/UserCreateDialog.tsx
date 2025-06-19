import React, { useState } from "react";
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
import { User } from "@/types";

interface Role {
  id: string;
  name: string;
  description?: string | null;
}

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function UserCreateDialog({
  open,
  onOpenChange,
  onUserCreated,
}: UserCreateDialogProps) {
  const api = useTauriApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nationalId: "",
    phoneNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    address: "",
    adult: true,
    gender: "M" as "M" | "F" | "O",
    metadata: "{}",
  });

  // Fetch available roles when dialog opens
  React.useEffect(() => {
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

  const handleSubmit = async () => {
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
      // First create the user
      const newUser = await api.post<User>("/users", {
        ...formData,
        metadata: formData.metadata || "{}",
      });

      // Then assign roles if any selected
      if (selectedRoles.length > 0) {
        // You'll need to implement this endpoint in your backend
        for (const roleId of selectedRoles) {
          await api.post(`/users/${newUser.id}/roles`, { roleId });
        }
      }

      toast.success("User created successfully!");
      onUserCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nationalId: "",
      phoneNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      address: "",
      adult: true,
      gender: "M",
      metadata: "{}",
    });
    setSelectedRoles([]);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Fill in the required information
            below.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
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
                    value={formData.email}
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
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Assign Roles</h3>
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
                            checked={selectedRoles.includes(role.id)}
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

              {selectedRoles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Selected roles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map((roleId) => {
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
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
