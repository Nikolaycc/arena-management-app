"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useTauriApiClient } from "@/lib/api-client";
import { TauriApiClient } from "@/lib/api-client";
import { User } from "@/types";
import { DataTable } from "@/components/UsersTable/user-table";
import { userColumns } from "@/components/UsersTable/columns";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Plus, Search, Users } from "lucide-react";

async function getUser(api: TauriApiClient) {
  const users = await api.get<User[]>("/users");
  return users;
}

interface UserFilters {
  search: string;
  status: string[];
  gender: string[];
  adult: string[];
  emailVerified: string[];
  phoneVerified: string[];
  dateRange: {
    from: string;
    to: string;
  };
}

const defaultFilters: UserFilters = {
  search: "",
  status: [],
  gender: [],
  adult: [],
  emailVerified: [],
  phoneVerified: [],
  dateRange: {
    from: "",
    to: "",
  },
};

function NoPermissionFallback() {
  return (
    <SidebarInset className="flex flex-col h-full">
      <SiteHeader title="Users" />
      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-destructive">⚠️</div>
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

function UserStats({ users }: { users: User[] }) {
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const suspended = users.filter((u) => u.status === "SUSPENDED").length;
    const verified = users.filter(
      (u) => u.phoneVerified && u.emailVerified,
    ).length;

    return { total, active, suspended, verified };
  }, [users]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="flex items-center p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Users
            </p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Users
            </p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Suspended
            </p>
            <p className="text-2xl font-bold">{stats.suspended}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Verified
            </p>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterDropdown({
  filters,
  onFiltersChange,
  activeFilterCount,
}: {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  activeFilterCount: number;
}) {
  const updateFilter = (key: keyof UserFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof UserFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          🔍 Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground h-auto p-0"
              >
                Clear all
              </Button>
            )}
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {["active", "suspended", "inactive"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleArrayFilter("status", status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm capitalize"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Gender Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender</Label>
            <div className="space-y-2">
              {[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
                { value: "O", label: "Other" },
              ].map((gender) => (
                <div key={gender.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender.value}`}
                    checked={filters.gender.includes(gender.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("gender", gender.value)
                    }
                  />
                  <Label htmlFor={`gender-${gender.value}`} className="text-sm">
                    {gender.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Adult Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Adult Status</Label>
            <div className="space-y-2">
              {[
                { value: "true", label: "Adult" },
                { value: "false", label: "Minor" },
              ].map((adult) => (
                <div key={adult.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`adult-${adult.value}`}
                    checked={filters.adult.includes(adult.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("adult", adult.value)
                    }
                  />
                  <Label htmlFor={`adult-${adult.value}`} className="text-sm">
                    {adult.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Verification Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Verification</Label>
            <div className="space-y-2">
              {[
                { value: "true", label: "Verified" },
                { value: "false", label: "Not Verified" },
              ].map((verified) => (
                <div
                  key={verified.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`email-${verified.value}`}
                    checked={filters.emailVerified.includes(verified.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("emailVerified", verified.value)
                    }
                  />
                  <Label
                    htmlFor={`email-${verified.value}`}
                    className="text-sm"
                  >
                    {verified.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Verification</Label>
            <div className="space-y-2">
              {[
                { value: "true", label: "Verified" },
                { value: "false", label: "Not Verified" },
              ].map((verified) => (
                <div
                  key={verified.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`phone-${verified.value}`}
                    checked={filters.phoneVerified.includes(verified.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("phoneVerified", verified.value)
                    }
                  />
                  <Label
                    htmlFor={`phone-${verified.value}`}
                    className="text-sm"
                  >
                    {verified.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Registration Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label
                  htmlFor="date-from"
                  className="text-xs text-muted-foreground"
                >
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      from: e.target.value,
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div>
                <Label
                  htmlFor="date-to"
                  className="text-xs text-muted-foreground"
                >
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      to: e.target.value,
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActiveFilters({
  filters,
  onFiltersChange,
}: {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}) {
  const removeFilter = (type: keyof UserFilters, value: string) => {
    if (type === "search") {
      onFiltersChange({ ...filters, search: "" });
    } else if (Array.isArray(filters[type])) {
      const newArray = (filters[type] as string[]).filter((v) => v !== value);
      onFiltersChange({ ...filters, [type]: newArray });
    }
  };

  const clearDateRange = () => {
    onFiltersChange({ ...filters, dateRange: { from: "", to: "" } });
  };

  const activeFilters = [];

  // Search filter
  if (filters.search) {
    activeFilters.push({
      type: "search" as keyof UserFilters,
      value: filters.search,
      label: `Search: "${filters.search}"`,
    });
  }

  // Array filters
  (
    ["status", "gender", "adult", "emailVerified", "phoneVerified"] as const
  ).forEach((key) => {
    filters[key].forEach((value) => {
      let label = value;
      if (key === "adult") label = value === "true" ? "Adult" : "Minor";
      if (key === "emailVerified")
        label = `Email ${value === "true" ? "Verified" : "Unverified"}`;
      if (key === "phoneVerified")
        label = `Phone ${value === "true" ? "Verified" : "Unverified"}`;
      if (key === "gender") {
        label = value === "M" ? "Male" : value === "F" ? "Female" : "Other";
      }

      activeFilters.push({
        type: key,
        value,
        label: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${label}`,
      });
    });
  });

  // Date range filter
  if (filters.dateRange.from || filters.dateRange.to) {
    const fromDate = filters.dateRange.from
      ? new Date(filters.dateRange.from).toLocaleDateString()
      : "";
    const toDate = filters.dateRange.to
      ? new Date(filters.dateRange.to).toLocaleDateString()
      : "";
    activeFilters.push({
      type: "dateRange" as keyof UserFilters,
      value: "dateRange",
      label: `Date: ${fromDate || "Start"} - ${toDate || "End"}`,
      isDateRange: true,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if ((filter as any).isDateRange) {
              clearDateRange();
            } else {
              removeFilter(filter.type, filter.value);
            }
          }}
        >
          {filter.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);

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

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          user.firstName + " " + user.lastName,
          user.email || "",
          user.phoneNumber,
          user.nationalId,
        ];
        if (
          !searchFields.some((field) =>
            field.toLowerCase().includes(searchTerm),
          )
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(user.status)) {
        return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(user.gender)) {
        return false;
      }

      // Adult filter
      if (filters.adult.length > 0) {
        const adultString = user.adult.toString();
        if (!filters.adult.includes(adultString)) {
          return false;
        }
      }

      // Email verification filter
      if (filters.emailVerified.length > 0) {
        const verifiedString = user.emailVerified.toString();
        if (!filters.emailVerified.includes(verifiedString)) {
          return false;
        }
      }

      // Phone verification filter
      if (filters.phoneVerified.length > 0) {
        const verifiedString = user.phoneVerified.toString();
        if (!filters.phoneVerified.includes(verifiedString)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const userDate = new Date(user.createdAt);
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (userDate < fromDate) return false;
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          if (userDate > toDate) return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.gender.length > 0) count++;
    if (filters.adult.length > 0) count++;
    if (filters.emailVerified.length > 0) count++;
    if (filters.phoneVerified.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  }, [filters]);

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
              {/* User Statistics */}
              <UserStats users={filteredUsers} />

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Search />
                    </span>
                    <Input
                      placeholder="Search users by name, email, phone, or ID..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FilterDropdown
                    filters={filters}
                    onFiltersChange={setFilters}
                    activeFilterCount={activeFilterCount}
                  />

                  {canCreateUsers && (
                    <Button>
                      <Plus strokeWidth={3} /> Add User
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              <ActiveFilters filters={filters} onFiltersChange={setFilters} />

              {/* Results Summary */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
                {activeFilterCount > 0 && (
                  <span>
                    {" "}
                    (filtered by {activeFilterCount} filter
                    {activeFilterCount !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {/* Show permissions info for debugging */}

              {error && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-destructive">⚠️</span>
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
                <DataTable columns={userColumns} data={filteredUsers} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </PermissionWrapper>
  );
}
