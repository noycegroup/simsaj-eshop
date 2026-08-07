import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://simsaj.sk"),
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
  return <html lang="sk"><body className={geist.variable}><CartProvider>{children}<SiteFooter /></CartProvider></body></html>;
}
