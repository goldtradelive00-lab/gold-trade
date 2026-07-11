"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifyWithdrawals, setNotifyWithdrawals] = useState(true);
  const [notifySignups, setNotifySignups] = useState(true);

  const save = () => {
    // Persist to backend once the settings endpoint is wired up.
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Profile</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" defaultValue={user?.full_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              Contact a super admin to change your login email.
            </p>
          </div>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Notifications</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3 text-sm text-foreground">
            <Checkbox
              checked={notifyWithdrawals}
              onCheckedChange={(v) => setNotifyWithdrawals(v === true)}
            />
            Email me when a withdrawal request is submitted
          </label>
          <label className="flex items-center gap-3 text-sm text-foreground">
            <Checkbox
              checked={notifySignups}
              onCheckedChange={(v) => setNotifySignups(v === true)}
            />
            Email me when a new investor applies
          </label>
        </div>
        <Separator className="my-6" />
        <Button onClick={save}>Save Changes</Button>
      </div>
    </div>
  );
}
