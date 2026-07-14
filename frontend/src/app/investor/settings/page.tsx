"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { logout as logoutRequest } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function InvestorSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put<{ full_name: string }>("/api/auth/profile", { full_name: trimmed });
      if (user) setUser({ ...user, full_name: res.full_name });
      setFullName(res.full_name);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const logOut = async () => {
    await logoutRequest();
    router.push("/login");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Profile</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email ?? ""} disabled />
          </div>
          <Button onClick={saveProfile} loading={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Security</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ChangePasswordDialog />
          <Button variant="outline" onClick={logOut}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
