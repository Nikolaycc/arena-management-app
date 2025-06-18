"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconPackage,
  IconPackages,
  IconReport,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useSession } from "@/contexts/SessionContext";

interface NavItem {
  title: string;
  url: string;
  icon: Icon;
  permission?: string;
  permissions?: string[];
  roles?: string[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, hasPermission } = useSession();

  if (isLoading) return null;
  if (!user) return null;

  // Define navigation items with their required permissions
  const navMainItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
      // Dashboard is usually accessible to all authenticated users
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
      permission: "user.read", // Requires user.read permission
    },
    {
      title: "Packets",
      url: "#",
      icon: IconShoppingCart,
      permission: "packet.read", // Example permission
    },
    {
      title: "Inventory",
      url: "#",
      icon: IconPackage,
      permission: "inventory.read", // Example permission
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
      permissions: ["analytics.read", "reports.read"], // Requires any of these permissions
    },
  ];

  const navSecondaryItems: NavItem[] = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
      permission: "settings.read", // Only show to users with settings permission
    },
  ];

  const documentItems = [
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
      permission: "reports.read",
    },
  ];

  // Filter navigation items based on permissions
  const filterNavItems = (items: NavItem[]) => {
    return items.filter((item) => {
      // If no permission required, show the item
      if (!item.permission && !item.permissions && !item.roles) {
        return true;
      }

      // Check single permission
      if (item.permission) {
        return hasPermission(item.permission);
      }

      // Check multiple permissions (user needs ANY of them)
      if (item.permissions && item.permissions.length > 0) {
        return item.permissions.some((perm) => hasPermission(perm));
      }

      // For roles, you can add similar logic here
      return true;
    });
  };

  const filteredNavMain = filterNavItems(navMainItems);
  const filteredNavSecondary = filterNavItems(navSecondaryItems);

  // Filter documents that require permissions
  const filteredDocuments = documentItems.filter((doc) => {
    if (!doc.permission) return true;
    return hasPermission(doc.permission);
  });

  const data = {
    user: {
      name: user.firstName + " " + user.lastName,
      email: user.phoneNumber,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: filteredNavMain.map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    })),
    navSecondary: filteredNavSecondary.map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    })),
    documents: filteredDocuments.map((doc) => ({
      name: doc.name,
      url: doc.url,
      icon: doc.icon,
    })),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-13"></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Only show documents section if user has any document permissions */}
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}

        {/* Only show secondary nav if user has any secondary permissions */}
        {data.navSecondary.length > 0 && (
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
