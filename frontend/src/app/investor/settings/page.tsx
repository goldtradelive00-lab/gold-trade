"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { logout as logoutRequest } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function InvestorSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const saveProfile = () => {
    // Persist profile fields via the backend once the endpoint is wired up.
    toast.success("Settings saved");
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
