"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Marks every notification in a section as read once the investor/admin visits the page
// that section covers (e.g. visiting /investor/deposit clears "deposit" notifications).
export function useMarkSectionRead(section: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    api
      .post("/api/notifications/mark-read-section", { section })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      })
      .catch(() => {});
  }, [section, queryClient]);
}
