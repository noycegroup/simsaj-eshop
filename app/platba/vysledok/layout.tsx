import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Výsledok platby | SIMSAJ",
  robots: { index: false, follow: false },
};

export default function PaymentResultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
