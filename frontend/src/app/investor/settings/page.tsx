"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/utils";

export default function InvestorSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [statementEmails, setStatementEmails] = useState(true);
  const [activityAlerts, setActivityAlerts] = useState(true);
  const [sendingReset, setSendingReset] = useState(false);

  const saveProfile = () => {
    // Persist profile fields via the backend once the endpoint is wired up.
    toast.success("Settings saved");
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await api.post("/api/auth/forgot-password", { email: user.email });
      toast.success("Password reset link sent to your email");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingReset(false);
    }
  };

  const logOut = () => {
    clearAccessToken();
    router.push("/login");
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
          </div>
          <Button onClick={saveProfile}>Save Changes</Button>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Notifications</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3 text-sm text-foreground">
            <Checkbox
              checked={statementEmails}
              onCheckedChange={(v) => setStatementEmails(v === true)}
            />
            Monthly statement emails
          </label>
          <label className="flex items-center gap-3 text-sm text-foreground">
            <Checkbox
              checked={activityAlerts}
              onCheckedChange={(v) => setActivityAlerts(v === true)}
            />
            Alerts for deposits, withdrawals, and trades
          </label>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Security</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={sendPasswordReset} disabled={sendingReset}>
            {sendingReset ? "Sending..." : "Change Password"}
          </Button>
          <Button variant="outline" onClick={logOut}>
            Log Out
          </Button>
        </div>
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground">
          Changing your password sends a secure reset link to your registered email.
        </p>
      </div>
    </div>
  );
}
