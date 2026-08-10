import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Košík | SIMSAJ",
  alternates: { canonical: "/kosik" },
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
