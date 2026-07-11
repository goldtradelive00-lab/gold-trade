import { notFound } from "next/navigation";
import { InfoPage } from "@/components/marketing/info-page";
import { productPages } from "@/lib/content/footer-pages";

export function generateStaticParams() {
  return Object.keys(productPages).map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = productPages[slug];
  if (!page) notFound();
  return <InfoPage page={page} />;
}
