"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Share2, UserCheck, Gift } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth-store";
import { useMarkSectionRead } from "@/lib/use-mark-section-read";

interface ReferralEarningRow {
  id: string;
  referred_user_name: string;
  referred_user_email: string;
  deposit_amount: number;
  commission_amount: number;
  created_at: string;
}

interface ReferredUserRow {
  id: string;
  full_name: string;
  email: string;
  joined_at: string;
}

interface ReferralsResponse {
  referred_users: ReferredUserRow[];
  earnings: ReferralEarningRow[];
  total_earned: number;
}

export default function ReferralPage() {
  useMarkSectionRead("referral");
  const user = useAuthStore((s) => s.user);
  const code = user?.referral_code ?? "";
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = code && origin ? `${origin}/join?ref=${code}` : "";

  const { data, isLoading } = useQuery({
    queryKey: ["portfolio", "referrals"],
    queryFn: () => api.get<ReferralsResponse>("/api/portfolio/referrals"),
  });

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="hairline-border gold-glow rounded-xl bg-card p-8">
        <h2 className="font-serif-display text-2xl text-foreground">Refer a Friend</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Invite someone to the inner circle. You earn a 5% commission on every deposit they
          make, credited to your account automatically once it&apos;s approved.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your Referral Code
          </p>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={code} className="font-mono text-lg tracking-wide text-primary" />
            <Button variant="outline" size="icon" onClick={() => copy(code)}>
              <Copy className="size-4" />
            </Button>
          </div>
        </div>

        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Invite Link</p>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={link} className="text-sm" />
            <Button variant="outline" size="icon" onClick={() => copy(link)} disabled={!link}>
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <StatCardSkeleton big />
          <StatCardSkeleton big />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Earned</p>
            <p className="font-serif-display mt-2 text-3xl text-primary">
              {formatCurrency(data?.total_earned ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">5% of every approved deposit</p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Investors Referred
            </p>
            <p className="font-serif-display mt-2 text-3xl text-foreground">
              {data?.referred_users.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Joined using your link or code</p>
          </div>
        </div>
      )}

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Referral Earnings
        </h2>
        {isLoading || !data ? (
          <Skeleton className="mt-4 h-32 w-full" />
        ) : data.earnings.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No earnings yet. Once someone you referred makes an approved deposit, your 5%
            commission will show up here.
          </p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Their Deposit</TableHead>
                <TableHead className="text-right">Your Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="text-foreground">{e.referred_user_name}</p>
                    <p className="text-xs text-muted-foreground">{e.referred_user_email}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {new Date(e.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(e.deposit_amount)}
                  </TableCell>
                  <TableCell className="font-serif-display text-right text-primary">
                    +{formatCurrency(e.commission_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">How It Works</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="hairline-border rounded-xl bg-card p-6">
            <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
              <Share2 className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-medium text-foreground">Share Your Link</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send your personal invite link or code to someone who values discretion and
              precision.
            </p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
              <UserCheck className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-medium text-foreground">They Join &amp; Deposit</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Once their membership is approved and they make a deposit, it&apos;s linked back to
              you.
            </p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
              <Gift className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-medium text-foreground">You Earn 5%</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              As soon as their deposit is approved, 5% of it is credited straight to your
              balance, with no limit on how many friends you refer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
