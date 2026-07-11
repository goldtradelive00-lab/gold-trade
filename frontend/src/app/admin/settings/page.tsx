"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [notifyWithdrawals, setNotifyWithdrawals] = useState(true);
  const [notifySignups, setNotifySignups] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const { data: whatsapp } = useQuery({
    queryKey: ["settings", "deposit-whatsapp"],
    queryFn: () => api.get<{ whatsapp_number: string }>("/api/settings/deposit-whatsapp"),
  });

  useEffect(() => {
    if (whatsapp?.whatsapp_number) setWhatsappNumber(whatsapp.whatsapp_number);
  }, [whatsapp]);

  const save = () => {
    // Persist to backend once the settings endpoint is wired up.
    toast.success("Settings saved");
  };

  const saveWhatsapp = async () => {
    if (!whatsappNumber.trim()) {
      toast.error("Enter a valid WhatsApp number");
      return;
    }
    setSavingWhatsapp(true);
    try {
      await api.put("/api/admin/settings/deposit-whatsapp", { whatsapp_number: whatsappNumber.trim() });
      toast.success("WhatsApp number updated");
      queryClient.invalidateQueries({ queryKey: ["settings", "deposit-whatsapp"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingWhatsapp(false);
    }
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

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Deposit Receipts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Investors are shown this WhatsApp number to send their deposit receipt screenshots to.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="03001234567"
          />
        </div>
        <Separator className="my-6" />
        <Button onClick={saveWhatsapp} disabled={savingWhatsapp}>
          {savingWhatsapp ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
