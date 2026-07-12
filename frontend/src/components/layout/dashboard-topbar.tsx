"use client";

import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <Bell className="size-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-right md:block">
            <p className="text-sm text-foreground">{user?.full_name || user?.email}</p>
            <p className="text-xs uppercase tracking-wide text-primary">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
