import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import type { FooterPage } from "@/lib/content/footer-pages";

export function InfoPage({ page }: { page: FooterPage }) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <p className="mt-8 text-xs uppercase tracking-widest text-primary">{page.kicker}</p>
          <h1 className="font-serif-display mt-2 text-3xl text-foreground md:text-4xl">
            {page.title}
          </h1>
          <div className="mt-8 space-y-5">
            {page.paragraphs.map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
