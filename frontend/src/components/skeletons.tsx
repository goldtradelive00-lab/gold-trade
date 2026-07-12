import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton({ big }: { big?: boolean }) {
  return (
    <div className="hairline-border rounded-xl bg-card p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className={big ? "mt-3 h-9 w-40" : "mt-3 h-6 w-28"} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="hairline-border rounded-xl bg-card p-6">
      <Skeleton className="h-3 w-32" />
      <div className="mt-4 space-y-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardBlockSkeleton({ className }: { className?: string }) {
  return (
    <div className={`hairline-border rounded-xl bg-card p-6 ${className ?? ""}`}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}
