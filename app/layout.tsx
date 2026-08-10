import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, siteUrl } from "@/lib/site";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SIMSAJ – Zdravie začína od nôh",
  description: "Ortopedická a zdravotná obuv, vložky, ponožky, meranie chodidiel a odborné poradenstvo.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "SIMSAJ – Zdravie začína od nôh",
    description: "Kvalitná ortopedická obuv a odborná starostlivosť pre vaše nohy.",
    type: "website",
    locale: "sk_SK",
    siteName: "SIMSAJ",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SIMSAJ – Zdravie začína od nôh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIMSAJ – Zdravie začína od nôh",
    description: "Kvalitná ortopedická obuv a odborná starostlivosť pre vaše nohy.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "SIMSAJ",
      url: siteUrl,
      logo: absoluteUrl("/brand/logo-simsaj-sk.jpeg"),
      description: metadata.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "SIMSAJ",
      url: siteUrl,
      inLanguage: "sk-SK",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/produkty")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return <html lang="sk"><body className={geist.variable}><StructuredData data={structuredData} /><CartProvider>{children}<SiteFooter /></CartProvider></body></html>;
}
