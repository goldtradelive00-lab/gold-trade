import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/marketing/scroll-progress";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif-display text-lg tracking-widest text-primary">
          GOLDTRADE
        </Link>
        <nav className="hidden items-center gap-8 text-sm uppercase tracking-wide text-muted-foreground md:flex">
          <Link href="/#platform" className="hover:text-foreground">Platform</Link>
          <Link href="/#security" className="hover:text-foreground">Security</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-foreground hover:text-primary">
            Log In
          </Link>
          <Button asChild>
            <Link href="/join">Open an Account</Link>
          </Button>
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
