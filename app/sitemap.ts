import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produkty"), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug,updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (error) return staticPages;

    return [
      ...staticPages,
      ...(data ?? []).map((product) => ({
        url: absoluteUrl(`/produkty/${product.slug}`),
        lastModified: product.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticPages;
  }
}
