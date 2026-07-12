"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/marketing/auth-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

const RESEND_COOLDOWN_S = 60;

export default function VerifyEmailPendingPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(sessionStorage.getItem("pendingVerificationEmail"));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await api.post("/api/auth/resend-verification", { email });
      toast.success("Verification email sent, check your inbox");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard
      title="Verify Your Email"
      backgroundImage="/media/pexels-koprivakart-6638269.jpg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-md bg-secondary">
          <MailCheck className="size-7 text-primary" />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          We&apos;ve sent a verification link to{" "}
          {email ? (
            <span className="text-foreground">{email}</span>
          ) : (
            "your email address"
          )}
          . Click the link in that email to activate your account.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Once verified, you can log in right away.
        </p>

        {email && (
          <Button
            variant="outline"
            className="mt-6 w-full border-primary text-primary"
            onClick={resend}
            disabled={sending || cooldown > 0}
          >
            {sending
              ? "Sending..."
              : cooldown > 0
                ? `Resend available in ${cooldown}s`
                : "Resend Verification Email"}
          </Button>
        )}

        <Button className="mt-3 w-full" asChild>
          <Link href="/login">Back to Log In</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
