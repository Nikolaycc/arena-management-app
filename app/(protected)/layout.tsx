"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-full w-full">
        <AppSidebar variant="sidebar" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
