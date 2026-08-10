import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokladňa | SIMSAJ",
  alternates: { canonical: "/pokladna" },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
