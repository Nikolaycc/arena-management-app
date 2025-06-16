"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { useSession } from "@/contexts/SessionContext";
import data from "../data.json";

export default function Page() {
  const { user } = useSession();

  return (
    <SidebarInset className="flex flex-col h-full">
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Welcome message */}
            {user && (
              <div className="px-4 lg:px-6">
                <h2 className="text-2xl font-bold">
                  Welcome back, {user.firstName}!
                </h2>
                <p className="text-muted-foreground">
                  Here's what's happening with your arena today.
                </p>
              </div>
            )}
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
        <div className="mb-10" />
      </div>
    </SidebarInset>
  );
}
