"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SessionUser } from "@/types/domain";

export function DashboardTopbar({ title, user }: { title: string; user: SessionUser | null }) {
  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-5">
      <h1 className="font-serif-display text-xl text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
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
