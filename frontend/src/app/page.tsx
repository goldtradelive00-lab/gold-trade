import Link from "next/link";
import Image from "next/image";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  LineChart,
  Sparkles,
  Lock,
  Landmark,
  FileCheck,
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
              A Legacy of Growth,{" "}
              <span className="text-primary">Guarded with Precision</span>
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground">
              GoldTrade provides institutional-grade security and algorithmic precision for the
              world&apos;s most discerning private clients. Experience wealth management as a
              silent, powerful utility.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link href="/join">Open an Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary" asChild>
                <Link href="/#platform">See How It Works</Link>
              </Button>
            </div>
          </div>

          <div className="hairline-border rounded-xl bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Portfolio Value
            </p>
            <p className="font-serif-display mt-2 text-3xl text-primary">Rs 4,821,092.42</p>
            <div className="relative mt-6 h-24 overflow-hidden rounded-md">
              <Image
                src="/media/istockphoto-2149336956-612x612.jpg"
                alt=""
                fill
                className="object-cover"
              />
              <div className="chart-gradient absolute inset-0" />
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>30D Change <span className="text-primary">+1.24%</span></span>
              <span>Volatility <span className="text-foreground">Low Risk</span></span>
            </div>
          </div>
          </div>
        </section>

        {/* Stats */}
        <section className="hairline-border border-x-0 bg-card/40 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 text-center md:grid-cols-3">
            <div>
              <p className="font-serif-display text-2xl text-primary">Rs 14.2B AUM</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Assets Managed</p>
            </div>
            <div>
              <p className="font-serif-display text-2xl text-primary">8,500+ Investors</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Global Private Clients</p>
            </div>
            <div>
              <p className="font-serif-display text-2xl text-primary">12.4% Avg. Return</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">3-Year Net Performance</p>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> SOC 2 Type II Compliant
            </span>
            <span className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" /> SECP Regulated
            </span>
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> 256-bit AES Encryption
            </span>
          </div>
        </section>

        {/* Tools */}
        <section id="platform" className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-primary">The Architecture</p>
          <h2 className="font-serif-display mt-2 text-2xl text-foreground md:text-3xl">
            Sophisticated Tools for the Sophisticated Investor
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<LineChart className="size-5 text-primary" />}
              title="Portfolio Tracking"
              body="Aggregate all your global assets — from equities and real estate to digital collectibles — into a single, high-fidelity command center."
            />
            <FeatureCard
              icon={<Sparkles className="size-5 text-primary" />}
              title="Automated Investing"
              body="Leverage proprietary algorithms that tax-loss harvest and rebalance your strategy around the clock, without human intervention."
            />
            <FeatureCard
              icon={<ShieldCheck className="size-5 text-primary" />}
              title="Real-time Analytics"
              body="Access deep-dive risk analysis and stress-testing simulations that model your portfolio against global economic volatility."
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
              GoldTrade has fundamentally changed how I view my family&apos;s legacy. The level of
              transparency, coupled with the absolute silence of the automation, is a luxury I
              didn&apos;t know existed in finance.
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-primary">Ahsan Malik</p>
            <p className="text-xs text-muted-foreground">Principal at Malik Capital Partners</p>
          </div>
        </section>

        {/* Security & Trust */}
        <section id="security" className="border-t border-border py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs uppercase tracking-widest text-primary">Built for Discretion</p>
            <h2 className="font-serif-display mt-2 max-w-lg text-2xl text-foreground md:text-3xl">
              Institutional Custody, Personal Discretion
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<Lock className="size-5 text-primary" />}
                title="Bank-Grade Custody"
                body="Assets are held with regulated custodial partners under multi-signature, cold-storage protocols — never commingled, never at risk."
              />
              <FeatureCard
                icon={<Landmark className="size-5 text-primary" />}
                title="SECP-Regulated Custody"
                body="Every account is held through SECP-licensed custodians, with independent asset segregation for private wealth portfolios."
              />
              <FeatureCard
                icon={<FileCheck className="size-5 text-primary" />}
                title="Independent Audits"
                body="Annual SOC 2 Type II audits and quarterly third-party reserve verifications, available to members on request."
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
            <h2 className="font-serif-display text-3xl text-foreground">Join the Inner Circle</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Membership is limited to ensure concierge-level attention for every account.
              Application approval typically occurs within 24 hours.
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
                GoldTrade (dba Vault) is a financial technology company, not a bank. Banking
                services are provided by our partner banks, regulated by the State Bank of
                Pakistan.
              </p>
            </div>
            <FooterColumn
              title="Product"
              links={[
                { label: "Portfolio", href: "/product/portfolio" },
                { label: "Yield Optimization", href: "/product/yield-optimization" },
                { label: "Tax Efficiency", href: "/product/tax-efficiency" },
                { label: "Security Architecture", href: "/product/security-architecture" },
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
            © {new Date().getFullYear()} GoldTrade Wealth Management (Private) Limited. All rights
            reserved. Investment advisory services offered through GoldTrade Advisors (Private)
            Limited, an SECP-licensed investment adviser. Performance data shown represents past
            performance and is not a guarantee of future results.
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
