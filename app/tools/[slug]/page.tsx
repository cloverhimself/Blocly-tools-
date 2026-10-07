import { notFound } from "next/navigation";
import { toolRegistry } from "../../../src/registry/tools";
import { ToolPageClient } from "../../../src/next/ToolPageClient";
import { toolComponentSlugs } from "../../../src/next/toolSlugs";

type Props = {
  params: Promise<{ slug: string }>;
};

function findToolBySlug(slug: string) {
  return Object.values(toolRegistry).find((tool) => tool.route === `/tools/${slug}`);
}

export async function generateStaticParams() {
  return toolComponentSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tool = findToolBySlug(slug);
  if (!tool) return { title: "Tool - Blocly Tools" };
  return {
    title: `${tool.name} - Blocly Tools`,
    description: tool.description,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!toolComponentSlugs.some((toolSlug) => toolSlug === slug)) notFound();
  return <ToolPageClient slug={slug} />;
}
