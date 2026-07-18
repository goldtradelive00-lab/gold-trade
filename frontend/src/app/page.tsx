import Link from "next/link";
import Image from "next/image";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { LandingGoldChart } from "@/components/marketing/landing-gold-chart";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Lock,
  Wallet,
  MessageCircleMore,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <MarketingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <Image
            src="/media/pexels-3d-render-1058120333-33539235.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif-display text-4xl leading-tight text-foreground md:text-5xl">
              Grow Your Savings, {" "}
              <span className="text-primary">Backed by Gold</span>
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground">
              Deposit via Binance USDT, earn 1% profit on your principal every day,
              and track every dollar in one simple dashboard.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link href="/join">Open an Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary" asChild>
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>

          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Gold Rate · 24K / Tola (USD)
            </p>
            <div className="mt-2">
              <LandingGoldChart />
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Daily Profit <span className="text-primary">1% on principal</span></span>
              <span>Referral Bonus <span className="text-foreground">5% per deposit</span></span>
            </div>
          </div>
          </div>
        </section>

        {/* Stats */}
        <section className="hairline-border border-x-0 bg-card/40 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 text-center md:grid-cols-3">
            <div>
              <p className="font-serif-display text-2xl text-primary">1% Daily Profit</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">On your deposited principal</p>
            </div>
            <div>
              <p className="font-serif-display text-2xl text-primary">5% Referral Bonus</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Every time your referral deposits</p>
            </div>
            <div>
              <p className="font-serif-display text-2xl text-primary">24 Hour Review</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Deposits &amp; withdrawals confirmed fast</p>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Every Deposit Manually Verified
            </span>
            <span className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" /> Binance USDT Accepted
            </span>
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Encrypted Account Access
            </span>
          </div>
        </section>

        {/* Tools */}
        <section id="platform" className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="font-serif-display mt-2 text-2xl text-foreground md:text-3xl">
            A Simple Path From Deposit to Daily Profit
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Wallet className="size-5 text-primary" />}
              title="Deposit Your Way"
              body="Pay via Binance USDT, then confirm your receipt over WhatsApp."
            />
            <FeatureCard
              icon={<TrendingUp className="size-5 text-primary" />}
              title="Earn 1% Daily"
              body="Once approved, your deposit starts earning 1% profit every day, credited straight to your cash balance: simple and transparent, no compounding tricks."
            />
            <FeatureCard
              icon={<Users className="size-5 text-primary" />}
              title="Refer & Earn 5%"
              body="Share your personal referral link. Every time someone you referred makes an approved deposit, you earn a 5% bonus automatically."
            />
          </div>
        </section>

        {/* Testimonial */}
        <section className="relative overflow-hidden border-t border-border bg-card/60 py-20">
          <Image
            src="/media/pexels-ellie-burgin-1661546-6662656.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-card/85 via-card/80 to-card/90" />
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <p className="font-serif-display text-5xl text-primary/40">&rdquo;</p>
            <blockquote className="font-serif-display text-xl italic leading-relaxed text-foreground md:text-2xl">
              I deposited through Binance USDT, confirmed my receipt on WhatsApp, and my profit
              started showing up the very next day. Referring two friends made it even better:
              their deposits earn me a bonus too.
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-primary">Sara Ahmed</p>
            <p className="text-xs text-muted-foreground">GoldTrade Member</p>
          </div>
        </section>

        {/* Security & Trust */}
        <section id="security" className="border-t border-border py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs uppercase tracking-widest text-primary">Built on Trust</p>
            <h2 className="font-serif-display mt-2 max-w-lg text-2xl text-foreground md:text-3xl">
              Every Dollar Accounted For
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<MessageCircleMore className="size-5 text-primary" />}
                title="Manual Verification"
                body="Every deposit receipt is checked by our team on WhatsApp before your account is credited, no automated guesswork."
              />
              <FeatureCard
                icon={<Lock className="size-5 text-primary" />}
                title="Secure Account Access"
                body="Passwords are encrypted end-to-end, and every session is protected: your account details stay yours alone."
              />
              <FeatureCard
                icon={<ShieldCheck className="size-5 text-primary" />}
                title="Transparent Ledger"
                body="Every deposit, withdrawal, referral bonus, and daily profit credit is logged and visible in your dashboard, in real time."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-border py-20 text-center">
          <Image
            src="/media/pexels-deepesh-raj-1934768-20429577.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
          <div className="relative">
            <h2 className="font-serif-display text-3xl text-foreground">Start Earning Today</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Open an account, make your first deposit, and watch your 1% daily profit start
              the next day. Membership applications are typically reviewed within 24 hours.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/join">Open an Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <p className="font-serif-display text-lg tracking-widest text-primary">GOLDTRADE</p>
              <p className="mt-3 max-w-xs text-xs text-muted-foreground">
                GoldTrade is a gold-linked savings and referral rewards platform, built for
                everyday investors in Pakistan.
              </p>
            </div>
            <FooterColumn
              title="Product"
              links={[
                { label: "Dashboard", href: "/product/dashboard" },
                { label: "Daily Profit", href: "/product/daily-profit" },
                { label: "Referral Program", href: "/product/referral-program" },
                { label: "Security & Verification", href: "/product/security-architecture" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About Us", href: "/company/about-us" },
                { label: "Ethics", href: "/company/ethics" },
                { label: "Careers", href: "/company/careers" },
                { label: "Privacy", href: "/company/privacy" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Terms of Service", href: "/legal/terms-of-service" },
                { label: "Disclosures", href: "/legal/disclosures" },
                { label: "Cookie Policy", href: "/legal/cookie-policy" },
              ]}
            />
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} GoldTrade. All rights reserved. Daily profit and referral
            bonus rates are subject to change. Past profit credits are not a guarantee of future
            payouts.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-primary">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="hairline-border rounded-lg bg-card p-6">
      <div className="flex size-9 items-center justify-center rounded-md bg-secondary">{icon}</div>
      <h3 className="mt-4 font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
