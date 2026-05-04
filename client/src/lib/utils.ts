import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/lib/data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Where the "buy" button sends the user. Amazon-destination products use
 * `affiliateUrl`; external-destination products use `externalUrl` (brand site,
 * Kickstarter, etc.). Falls back to affiliateUrl if externalUrl is missing.
 */
export function getBuyUrl(product: Product): string {
  if (product.destination === "external" && product.externalUrl) {
    return product.externalUrl;
  }
  return product.affiliateUrl;
}

/**
 * Human-readable label for the buy button. Amazon products get "Buy on Amazon";
 * external products derive a label from the URL hostname.
 */
export function getBuyLabel(product: Product): string {
  if (product.destination === "external" && product.externalUrl) {
    try {
      const host = new URL(product.externalUrl).hostname.replace(/^www\./, "");
      // Strip TLD for a prettier label: "kickstarter.com" -> "Kickstarter"
      const brand = host.split(".")[0];
      return `Buy on ${brand.charAt(0).toUpperCase()}${brand.slice(1)}`;
    } catch {
      return "Buy Now";
    }
  }
  return "Buy on Amazon";
}

/**
 * True when the product's buy button points at Amazon (so the site can show
 * Amazon-specific UI like the "a" icon badge).
 */
export function isAmazonDestination(product: Product): boolean {
  const effective = product.destination ?? "amazon";
  return effective === "amazon";
}
