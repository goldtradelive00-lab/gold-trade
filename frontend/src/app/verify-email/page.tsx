"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "@/components/marketing/auth-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    api
      .get<null>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. Your account is now active, you can log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  return (
    <AuthCard title="Email Verification">
      <p className="text-sm text-muted-foreground">
        {status === "verifying" ? "Verifying your email address..." : message}
      </p>
      {status !== "verifying" && (
        <Button className="mt-6 w-full" asChild>
          <Link href="/login">Back to Log In</Link>
        </Button>
      )}
    </AuthCard>
  );
}
