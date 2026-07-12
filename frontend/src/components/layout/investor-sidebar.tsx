"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  UserPlus,
  Settings,
  LogOut,
} from "lucide-react";
import { logout as logoutRequest } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { name: "Dashboard", href: "/investor/dashboard", icon: LayoutDashboard },
  { name: "Withdraw", href: "/investor/withdraw", icon: ArrowUpFromLine },
  { name: "Deposit", href: "/investor/deposit", icon: ArrowDownToLine },
  { name: "Referral", href: "/investor/refer", icon: UserPlus },
  { name: "Settings", href: "/investor/settings", icon: Settings },
];

export function InvestorSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await logoutRequest();
    onNavigate?.();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar px-4 py-6",
        className
      )}
    >
      <div className="px-2">
        <p className="font-serif-display text-lg tracking-widest text-primary">GOLDTRADE</p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Private Client</p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-card text-primary"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
      >
        <LogOut className="size-4" />
        Logout
      </button>
    </aside>
  );
}
