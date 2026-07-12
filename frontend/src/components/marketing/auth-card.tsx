import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  backgroundImage,
  children,
}: {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-y-auto bg-background px-6 py-16">
      {backgroundImage && (
        <>
          <Image src={backgroundImage} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-background" />
        </>
      )}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Home
      </Link>
      <Link
        href="/"
        className="font-serif-display relative mb-8 text-lg tracking-widest text-primary"
      >
        GOLDTRADE
      </Link>
      <div className="hairline-border relative w-full max-w-md rounded-xl bg-card p-8">
        <h1 className="font-serif-display text-2xl text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
