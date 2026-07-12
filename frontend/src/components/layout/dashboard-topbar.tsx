"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { clearAccessToken } from "@/lib/session";
import type { SessionUser } from "@/types/domain";

export function DashboardTopbar({
  title,
  user,
  onMenuClick,
}: {
  title: string;
  user: SessionUser | null;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const settingsHref = user?.role === "admin" ? "/admin/settings" : "/investor/settings";

  const logout = () => {
    clearAccessToken();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="-ml-1 flex size-8 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-serif-display text-lg text-foreground sm:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md" aria-label="Account menu">
              <Avatar className="size-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-right md:block">
                <p className="text-sm text-foreground">{user?.full_name || user?.email}</p>
                <p className="text-xs uppercase tracking-wide text-primary">{user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={settingsHref} className="flex items-center gap-2">
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout} className="flex items-center gap-2">
              <LogOut className="size-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
