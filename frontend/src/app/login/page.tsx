"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthCard } from "@/components/marketing/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { setSessionTokens } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/utils";
import type { SessionUser } from "@/types/domain";

const schema = z.object({
  email: z.string().min(1, "Email address is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: SessionUser;
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { access_token, refresh_token, user } = await api.post<LoginResponse>("/api/auth/login", values);
      setSessionTokens(access_token, refresh_token);
      setUser(user);
      toast.success(`Welcome back, ${user.full_name || user.email}`);
      router.push(user.role === "admin" ? "/admin/overview" : "/investor/dashboard");
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes("verify your email")) {
        sessionStorage.setItem("pendingVerificationEmail", values.email);
        router.push("/verify-email-pending");
        return;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Log In"
      subtitle="Access your private client dashboard."
      backgroundImage="/media/pexels-steve-26628060.jpg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Log In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not a member?{" "}
        <Link href="/join" className="text-primary hover:underline">
          Open an account
        </Link>
      </p>
    </AuthCard>
  );
}
