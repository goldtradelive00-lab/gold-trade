"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const POLL_MS = 30_000;

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationRow[]>("/api/notifications"),
    refetchInterval: POLL_MS,
  });
  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<{ count: number }>("/api/notifications/unread-count"),
    refetchInterval: POLL_MS,
  });

  const unreadCount = unread?.count ?? 0;
  const list = notifications ?? [];

  // Surface newly arrived notifications with a toast, since visiting the page a
  // notification refers to (e.g. /admin/deposit-requests) immediately marks it read
  // and would otherwise leave the bell badge as the only (easy to miss) signal.
  const seenIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!notifications) return;
    const currentIds = new Set(notifications.map((n) => n.id));
    if (seenIdsRef.current) {
      for (const n of notifications) {
        if (!seenIdsRef.current.has(n.id)) {
          toast.message(n.title, { description: n.message });
        }
      }
    }
    seenIdsRef.current = currentIds;
  }, [notifications]);

  const clearAll = async () => {
    const previousNotifications = queryClient.getQueryData<NotificationRow[]>(["notifications"]);
    const previousUnread = queryClient.getQueryData<{ count: number }>(["notifications", "unread-count"]);

    // Clear instantly rather than waiting on the round trip; roll back only if it fails.
    queryClient.setQueryData(["notifications"], []);
    queryClient.setQueryData(["notifications", "unread-count"], { count: 0 });

    try {
      await api.delete("/api/notifications");
    } catch (err) {
      queryClient.setQueryData(["notifications"], previousNotifications);
      queryClient.setQueryData(["notifications", "unread-count"], previousUnread);
      toast.error(getErrorMessage(err));
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open || unreadCount === 0) return;
    try {
      await api.post("/api/notifications/mark-all-read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    } catch {
      // non-critical — the dot will just persist until the next successful check
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {list.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {list.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {list.slice(0, 20).map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                className={`block rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent ${
                  !n.is_read ? "bg-secondary/40" : ""
                }`}
              >
                <p className="text-foreground">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
