"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useSession } from "@/contexts/SessionContext";
import { usePathname } from "next/navigation";
import localFont from "next/font/local";
import { useEffect, useState } from "react";

const nicoMoji = localFont({
  src: "../public/NicoMoji-Regular.ttf",
});

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  if (pathname === "/" || pathname === "") return "Dashboard";
  if (pathname.startsWith("/users")) return "Users";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/settings")) return "Settings";

  // Convert pathname to title (e.g., "/some-page" -> "Some Page")
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    ? lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Dashboard";
}

export default function WindowHeader() {
  const { isAuthenticated } = useSession();
  const pathname = usePathname();
  const [platform, setPlatform] = useState<string>("");

  async function getPlatform() {
    const { platform } = await import("@tauri-apps/plugin-os");
    setPlatform(platform());
  }

  useEffect(() => {
    getPlatform();
  }, [platform]);

  // Only show sidebar trigger on protected routes
  const isProtectedRoute = isAuthenticated && pathname !== "/login";
  const pageTitle = getPageTitle(pathname);

  return (
    <div
      data-tauri-drag-region
      className="h-13 bg-background w-full z-50 border-b border-muted flex-shrink-0 flex items-center px-4 select-none"
    >
      <div className="flex items-center gap-4 min-w-0 select-none">
        {/* Left side - Sidebar trigger and logo/title */}
        {platform === "macos" ? <div style={{ width: "55px" }} /> : null}
        {isProtectedRoute && (
          <div data-tauri-drag-region={false}>
            <SidebarTrigger />
          </div>
        )}

        {/* Center - Page title */}
        {/* <div className="flex-1 text-center min-w-0">
          {isProtectedRoute && (
            <h1 className="text-sm font-medium text-muted-foreground truncate">
              {pageTitle}
            </h1>
          )}
        </div> */}

        {/* Right side - You can add user menu, notifications, etc. here */}
        {/* <div className="flex items-center gap-2 flex-shrink-0"> */}
        {/* Placeholder for future additions like user menu, notifications, etc. */}
        {/* When adding interactive elements here, wrap them in data-tauri-drag-region={false} */}
        {/* </div> */}
      </div>
    </div>
  );
}
