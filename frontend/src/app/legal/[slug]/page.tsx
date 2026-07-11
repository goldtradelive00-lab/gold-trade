import { notFound } from "next/navigation";
import { InfoPage } from "@/components/marketing/info-page";
import { legalPages } from "@/lib/content/footer-pages";

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) notFound();
  return <InfoPage page={page} />;
}
