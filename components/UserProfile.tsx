"use client";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useApiClient } from "@/lib/api-client";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function UserProfile() {
  const { user, logout } = useSession();
  const apiClient = useApiClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(user || null);

  if (!user) return null;
  if (!formData) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/users/id/${user.id}`, formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      // You might want to refresh the user data here
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Update profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "suspended":
        return "bg-red-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getStatusColor(user.status)} text-white`}
          >
            {user.status}
          </Badge>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            {isEditing ? (
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">{user.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            {isEditing ? (
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">{user.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.email || "Not provided"}
                {user.emailVerified && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Verified
                  </Badge>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">National ID</Label>
            <p className="text-sm text-muted-foreground">{user.nationalId}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            {isEditing ? (
              <Select
                value={formData.gender || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value as "M" | "F" | "O" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="O">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.gender === "M"
                  ? "Male"
                  : user.gender === "F"
                    ? "Female"
                    : "Other"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            {isEditing ? (
              <Input
                id="birthDate"
                type="date"
                value={
                  formData.birthDate
                    ? new Date(formData.birthDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.birthDate
                  ? new Date(user.birthDate).toLocaleDateString()
                  : "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.address || "Not provided"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              Phone {user.phoneVerified ? "Verified" : "Unverified"}
              <Badge
                variant={user.phoneVerified ? "default" : "outline"}
                className="ml-2"
              >
                {user.phoneVerified ? "✓" : "✗"}
              </Badge>
            </span>
            <span>Adult: {user.adult ? "Yes" : "No"}</span>
          </div>
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          <p>
            Account created: {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
