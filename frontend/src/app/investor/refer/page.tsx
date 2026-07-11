"use client";

import { Copy, Share2, UserCheck, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function ReferralPage() {
  const user = useAuthStore((s) => s.user);
  const code = user?.referral_code ?? "";
  const link = code ? `https://goldtrade.example/join?ref=${code}` : "";

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="hairline-border gold-glow rounded-xl bg-card p-8">
        <h2 className="font-serif-display text-2xl text-foreground">Refer a Friend</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Invite someone to the inner circle. When their membership is approved and funded, you
          both receive a fee credit on your accounts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your Referral Code
          </p>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={code} className="font-serif-display text-lg text-primary" />
            <Button variant="outline" size="icon" onClick={() => copy(code)}>
              <Copy className="size-4" />
            </Button>
          </div>
        </div>

        <div className="hairline-border rounded-xl bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Invite Link</p>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={link} className="text-sm" />
            <Button variant="outline" size="icon" onClick={() => copy(link)}>
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
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
            <h3 className="mt-4 font-medium text-foreground">They Join &amp; Get Approved</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Once their membership application is verified and approved, the referral is
              confirmed.
            </p>
          </div>
          <div className="hairline-border rounded-xl bg-card p-6">
            <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
              <Gift className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-medium text-foreground">You Both Earn</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A fee credit is applied to both accounts — no limit on how many friends you refer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
