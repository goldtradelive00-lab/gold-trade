"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthCard } from "@/components/marketing/auth-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

const schema = z
  .object({
    full_name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email address is required").email("Enter a valid email address"),
    phone_number: z.string().min(1, "Phone number is required").min(7, "Enter a valid phone number"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    agree_terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms and Conditions to continue",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type FormValues = z.infer<typeof schema>;

export default function JoinPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agree_terms: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await api.post("/api/auth/register", {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
      });
      sessionStorage.setItem("pendingVerificationEmail", values.email);
      router.push("/verify-email-pending");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Join the Inner Circle"
      subtitle="Membership is limited to ensure concierge-level attention."
      backgroundImage="/media/pexels-koprivakart-6638269.jpg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input id="full_name" autoComplete="name" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input id="phone_number" type="tel" autoComplete="tel" {...register("phone_number")} />
          {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5">
            <Controller
              name="agree_terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="agree_terms"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              )}
            />
            <Label
              htmlFor="agree_terms"
              className="whitespace-nowrap text-sm font-normal text-muted-foreground"
            >
              I agree to the{" "}
              <Link
                href="/legal/terms-of-service"
                target="_blank"
                className="text-primary hover:underline"
              >
                Terms and Conditions
              </Link>
              <span className="text-red-500"> *</span>
            </Label>
          </div>
          {errors.agree_terms && <p className="text-xs text-red-500">{errors.agree_terms.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Open an Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
