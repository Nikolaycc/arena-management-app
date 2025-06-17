"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useTauriApiClient } from "@/lib/api-client";
import { TauriApiClient } from "@/lib/api-client";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/UsersTable/user-table";
import { userColumns } from "@/components/UsersTable/columns";

async function getUser(api: TauriApiClient) {
  const users = await api.get<User[]>("/users");
  return users;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const api = useTauriApiClient();

  useEffect(() => {
    if (users.length === 0) {
      getUser(api).then((user) => {
        setUsers(user);
      });
    }
  }, [users, api]);

  useEffect(() => console.log(users), [users]);

  return (
    <SidebarInset className="flex flex-col h-full">
      <SiteHeader title="Users" />
      <div className="flex flex-1 flex-col overflow-auto px-10">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable columns={userColumns} data={users} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
