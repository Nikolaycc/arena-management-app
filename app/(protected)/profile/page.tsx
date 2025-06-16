"use client";

import { UserProfile } from "@/components/UserProfile";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="relative justify-center content-center w-full h-full">
      <UserProfile />
      <ArrowLeft
        className="absolute left-5 top-5 cursor-pointer"
        onClick={() => router.back()}
      />
    </div>
  );
}
