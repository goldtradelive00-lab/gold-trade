"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken, clearSessionTokens } from "@/lib/session";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { SessionUser } from "@/types/domain";

const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/admin/overview", title: "Dashboard" },
  { prefix: "/admin/finance", title: "Finance" },
  { prefix: "/admin/deposit-requests", title: "Deposit Requests" },
  { prefix: "/admin/withdrawals", title: "Withdraw Requests" },
  { prefix: "/admin/investors", title: "Investors" },
  { prefix: "/admin/settings", title: "Settings" },
];

function titleForPath(pathname: string): string {
  return PAGE_TITLES.find((p) => pathname.startsWith(p.prefix))?.title ?? "Admin Console";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [verified, setVerified] = useState(user?.role === "admin");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        setVerified(true);
      } catch {
        clearSessionTokens();
        router.replace("/login");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  if (!verified) {
    return (
      <div className="flex h-screen min-h-0 flex-1 overflow-hidden bg-background">
        <AdminSidebar className="hidden md:flex" />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <DashboardTopbar title={titleForPath(pathname)} user={null} />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="hairline-border rounded-xl bg-card p-6">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-3 h-7 w-32" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-72" />
              <Skeleton className="h-64" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-1 overflow-hidden bg-background">
      <AdminSidebar className="hidden md:flex" />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <AdminSidebar
            className="absolute inset-y-0 left-0 flex animate-in slide-in-from-left duration-200"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <DashboardTopbar
          title={titleForPath(pathname)}
          user={user}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
