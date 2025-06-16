"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types";

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nationalId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          National ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nationalId")}</div>
    ),
  },
  {
    id: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl} />
            <AvatarFallback>
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            {user.email && (
              <div className="text-sm text-muted-foreground">{user.email}</div>
            )}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = `${rowA.original.firstName} ${rowA.original.lastName}`;
      const nameB = `${rowB.original.firstName} ${rowB.original.lastName}`;
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("phoneNumber")}</div>
    ),
  },
  {
    accessorKey: "birthDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Birth Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const birthDate = row.original.birthDate;
      if (!birthDate) return <span className="text-muted-foreground">N/A</span>;

      const date = new Date(birthDate);
      const age = new Date().getFullYear() - date.getFullYear();

      return (
        <div>
          <div>{date.toLocaleDateString()}</div>
          <div className="text-sm text-muted-foreground">Age: {age}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      if (!address) return <span className="text-muted-foreground">N/A</span>;
      return (
        <div className="max-w-[200px] truncate" title={address}>
          {address}
        </div>
      );
    },
  },
  {
    accessorKey: "adult",
    header: "Adult Status",
    cell: ({ row }) => {
      const isAdult = row.original.adult;
      return (
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isAdult ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">{isAdult ? "Adult" : "Minor"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender;
      const genderMap = {
        M: { label: "Male", color: "bg-blue-100 text-blue-800" },
        F: { label: "Female", color: "bg-pink-100 text-pink-800" },
        O: { label: "Other", color: "bg-purple-100 text-purple-800" },
      };

      const genderInfo = genderMap[gender] || {
        label: "N/A",
        color: "bg-gray-100 text-gray-800",
      };

      return (
        <Badge variant="outline" className={genderInfo.color}>
          {genderInfo.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        active: { label: "Active", variant: "default" as const },
        suspended: { label: "Suspended", variant: "destructive" as const },
        inactive: { label: "Inactive", variant: "secondary" as const },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "outline" as const,
      };

      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "verification",
    header: "Verification",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-1 justify-evenly content-center">
          <div
            className={`w-3 h-3 rounded-full ${
              user.emailVerified ? "bg-green-500" : "bg-red-500"
            }`}
            title={`Email ${user.emailVerified ? "verified" : "not verified"}`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              user.phoneVerified ? "bg-green-500" : "bg-red-500"
            }`}
            title={`Phone ${user.phoneVerified ? "verified" : "not verified"}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div>
          <div>{date.toLocaleDateString()}</div>
          <div className="text-sm text-muted-foreground">
            {date.toLocaleTimeString()}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
