"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken, clearAccessToken } from "@/lib/session";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { SessionUser } from "@/types/domain";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }

      try {
        const me = await api.get<SessionUser>("/api/auth/me");
        if (cancelled) return;
        if (me.role !== "admin") {
          router.replace("/investor/dashboard");
          return;
        }
        setUser(me);
        setLoading(false);
      } catch {
        clearAccessToken();
        router.replace("/login");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-1 overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <DashboardTopbar title="Admin Console" user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
