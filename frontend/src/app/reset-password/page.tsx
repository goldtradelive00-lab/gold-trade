"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthCard } from "@/components/marketing/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

const schema = z
  .object({
    new_password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", { token, new_password: values.new_password });
      toast.success("Password reset. Please log in.");
      router.push("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Set a New Password" backgroundImage="/media/pexels-steve-26628060.jpg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="new_password">
            New Password <span className="text-red-500">*</span>
          </Label>
          <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
          {errors.new_password && (
            <p className="text-xs text-red-500">{errors.new_password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
          {errors.confirm_password && (
            <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </AuthCard>
  );
}
