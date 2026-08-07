"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink() {
  const { count } = useCart();
  return <Link className="cart-link" href="/kosik">Košík <span>{count}</span></Link>;
}
