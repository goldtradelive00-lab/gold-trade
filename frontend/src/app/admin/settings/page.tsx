"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { useAuthStore } from "@/stores/auth-store";

interface PaymentMethods {
  jazzcash_number: string;
  binance_address: string;
  binance_network: string;
}

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [binanceAddress, setBinanceAddress] = useState("");
  const [binanceNetwork, setBinanceNetwork] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const [goldPrice, setGoldPrice] = useState("");
  const [savingGoldPrice, setSavingGoldPrice] = useState(false);

  const { data: whatsapp } = useQuery({
    queryKey: ["settings", "deposit-whatsapp"],
    queryFn: () => api.get<{ whatsapp_number: string }>("/api/settings/deposit-whatsapp"),
  });
  const { data: paymentMethods } = useQuery({
    queryKey: ["settings", "payment-methods"],
    queryFn: () => api.get<PaymentMethods>("/api/settings/payment-methods"),
  });
  const { data: goldPriceSetting } = useQuery({
    queryKey: ["market", "gold"],
    queryFn: () => api.get<{ price: number; date: string }>("/api/market/gold"),
  });

  useEffect(() => {
    if (whatsapp?.whatsapp_number) setWhatsappNumber(whatsapp.whatsapp_number);
  }, [whatsapp]);

  useEffect(() => {
    if (paymentMethods) {
      setJazzcashNumber(paymentMethods.jazzcash_number);
      setBinanceAddress(paymentMethods.binance_address);
      setBinanceNetwork(paymentMethods.binance_network);
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (goldPriceSetting) setGoldPrice(goldPriceSetting.price.toString());
  }, [goldPriceSetting]);

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

  const savePaymentMethods = async () => {
    if (!jazzcashNumber.trim() || !binanceAddress.trim() || !binanceNetwork.trim()) {
      toast.error("Fill in all payment method fields");
      return;
    }
    setSavingPayment(true);
    try {
      await api.put("/api/admin/settings/payment-methods", {
        jazzcash_number: jazzcashNumber.trim(),
        binance_address: binanceAddress.trim(),
        binance_network: binanceNetwork.trim(),
      });
      toast.success("Payment methods updated");
      queryClient.invalidateQueries({ queryKey: ["settings", "payment-methods"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPayment(false);
    }
  };

  const saveGoldPrice = async () => {
    const value = parseFloat(goldPrice);
    if (!value || value <= 0) {
      toast.error("Enter a valid gold price");
      return;
    }
    setSavingGoldPrice(true);
    try {
      await api.put("/api/admin/market/gold", { price: value });
      toast.success("Gold price updated");
      queryClient.invalidateQueries({ queryKey: ["market", "gold"] });
      queryClient.invalidateQueries({ queryKey: ["market", "gold", "history"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingGoldPrice(false);
    }
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
            <p className="text-xs text-muted-foreground">
              Contact a super admin to change your login email.
            </p>
          </div>
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Security</h2>
        <div className="mt-4">
          <ChangePasswordDialog />
        </div>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6 md:col-span-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Deposit Receipts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Investors are shown this WhatsApp number to send their deposit receipt screenshots to.
        </p>
        <div className="mt-4 max-w-sm space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="03001234567"
          />
        </div>
        <Separator className="my-6" />
        <Button onClick={saveWhatsapp} loading={savingWhatsapp}>
          {savingWhatsapp ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6 md:col-span-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Payment Methods
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Investors see these details on the deposit page: JazzCash number as the 1st method,
          Binance USDT as the 2nd.
        </p>
        <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="jazzcash_number">JazzCash Number</Label>
            <Input
              id="jazzcash_number"
              value={jazzcashNumber}
              onChange={(e) => setJazzcashNumber(e.target.value)}
              placeholder="03001234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="binance_network">Binance Network</Label>
            <Input
              id="binance_network"
              value={binanceNetwork}
              onChange={(e) => setBinanceNetwork(e.target.value)}
              placeholder="TRX (TRC20)"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="binance_address">Binance Address / ID</Label>
            <Input
              id="binance_address"
              value={binanceAddress}
              onChange={(e) => setBinanceAddress(e.target.value)}
              placeholder="TRGqwZ85XoV1xxqRk1fu6KbhyGX4rG5DnV"
              className="font-mono"
            />
          </div>
        </div>
        <Separator className="my-6" />
        <Button onClick={savePaymentMethods} loading={savingPayment}>
          {savingPayment ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="hairline-border rounded-xl bg-card p-6 md:col-span-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
          Today&apos;s Gold Price
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sets today&apos;s gold rate (USD per troy ounce, 24K), shown on both the public
          landing page and the investor dashboard chart. Once set, it&apos;s stored — the
          same price shows everywhere until you update it again.
        </p>
        <div className="mt-4 max-w-xs space-y-2">
          <Label htmlFor="gold_price">Gold Price (USD / oz)</Label>
          <Input
            id="gold_price"
            type="number"
            min="0"
            step="0.01"
            value={goldPrice}
            onChange={(e) => setGoldPrice(e.target.value)}
            placeholder="2650.00"
          />
        </div>
        <Separator className="my-6" />
        <Button onClick={saveGoldPrice} loading={savingGoldPrice}>
          {savingGoldPrice ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
