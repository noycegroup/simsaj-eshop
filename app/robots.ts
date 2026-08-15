import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const hostname = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
  const isPublicHost = hostname === "simsaj.sk" || hostname === "www.simsaj.sk";

  if (!isPublicHost) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/kosik", "/pokladna", "/platba/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
