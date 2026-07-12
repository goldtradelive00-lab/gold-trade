"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { InvestorSidebar } from "@/components/layout/investor-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken, clearSessionTokens } from "@/lib/session";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { SessionUser } from "@/types/domain";

const PAGE_TITLES: Record<string, string> = {
  "/investor/dashboard": "Overview",
  "/investor/withdraw": "Withdraw",
  "/investor/deposit": "Deposit",
  "/investor/refer": "Referral",
  "/investor/settings": "Settings",
};

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
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
        if (me.role !== "investor") {
          router.replace("/admin/overview");
          return;
        }
        setUser(me);
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-1 overflow-hidden bg-background">
      <InvestorSidebar className="hidden md:flex" />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <InvestorSidebar
            className="absolute inset-y-0 left-0 flex animate-in slide-in-from-left duration-200"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <DashboardTopbar
          title={PAGE_TITLES[pathname] ?? "Overview"}
          user={user}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
