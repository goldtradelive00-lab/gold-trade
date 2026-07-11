import { notFound } from "next/navigation";
import { InfoPage } from "@/components/marketing/info-page";
import { companyPages } from "@/lib/content/footer-pages";

export function generateStaticParams() {
  return Object.keys(companyPages).map((slug) => ({ slug }));
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = companyPages[slug];
  if (!page) notFound();
  return <InfoPage page={page} />;
}
