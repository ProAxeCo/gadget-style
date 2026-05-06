/**
 * Brand directory for Gadget Style.
 *
 * Each brand has a dedicated /brand/:slug landing page (mirroring
 * thegadgetflow.com/brand/<slug>/). This file is the source of truth for
 * brand display metadata — name, tagline, description, logo. Products are
 * tagged into a brand via `Product.brand` (slug) in `data.ts`.
 *
 * Adding a new brand:
 *   1. Add an entry to `brands` below.
 *   2. Drop a square logo into `client/public/images/brands/<slug>.png`.
 *   3. Tag products by setting `brand: "<slug>"` on the relevant entries
 *      in `data.ts`.
 *   4. The /brand/<slug> page lights up automatically.
 *
 * The slug must match `Product.brand` exactly (case-sensitive, lowercase).
 */
import {
  products,
  getProductsByBrandSlug,
  getBrandProductCount,
  type Product,
} from "./data";

export interface Brand {
  /** URL-safe lowercase slug, e.g. "belkin". Must match Product.brand. */
  slug: string;
  /** Display name, e.g. "Belkin". */
  name: string;
  /** Short hero tagline. Used as the H1 sub-line on the brand page. */
  tagline: string;
  /** 1-3 sentence brand description. Shown beneath the hero. */
  description: string;
  /** Site-local logo path, e.g. "/images/brands/belkin.png". Square,
   * transparent background, ~512–1024px. */
  logoUrl: string;
  /** Optional hero background image. If set, used as the full-bleed hero
   * backdrop. If not, a solid dark gradient is used. */
  heroImageUrl?: string;
  /** Optional brand official website. If set, a "Visit official site"
   * CTA renders on the brand page. */
  website?: string;
  /** Optional brand-color accent (hex or any valid CSS color). Used as the
   * hero background tint. Defaults to a neutral dark gradient when unset. */
  accentColor?: string;
}

export const brands: Brand[] = [
  {
    slug: "belkin",
    name: "Belkin",
    tagline: "Products we love from Belkin",
    description:
      "No matter what devices you own, Belkin has something to make them better. From MagSafe-ready chargers to USB-C hubs and Thunderbolt docks, the brand has been quietly engineering the accessories that turn good gear into great workflows for over four decades.",
    logoUrl: "/images/brands/belkin.svg",
    heroImageUrl: "/images/brands/heroes/belkin.jpg",
    website: "https://www.belkin.com",
    accentColor: "#0070C0",
  },
  {
    slug: "amazon",
    name: "Amazon",
    tagline: "Products we love from Amazon",
    description:
      "From the original Echo to the Kindle and Fire TV, Amazon's first-party hardware quietly defines what mass-market smart home and entertainment look like. We pick the devices that actually earn their place on a shelf or wall.",
    logoUrl: "/images/brands/amazon.svg",
    heroImageUrl: "/images/brands/heroes/amazon.jpg",
    website: "https://www.amazon.com",
    accentColor: "#FF9900",
  },
  {
    slug: "apple",
    name: "Apple",
    tagline: "Products we love from Apple",
    description:
      "Apple's hardware sets the bar for design-led consumer electronics — and the accessory ecosystem around it has its own gravity. Our picks span Cupertino's own products and the third-party gear engineered specifically for them.",
    logoUrl: "/images/brands/apple.svg",
    heroImageUrl: "/images/brands/heroes/apple.jpg",
    website: "https://www.apple.com",
    accentColor: "#1d1d1f",
  },
  {
    slug: "sony",
    name: "Sony",
    tagline: "Products we love from Sony",
    description:
      "Sony's reach across audio, imaging, and gaming makes it one of the few brands you can build an entire home around. We curate the products where Sony's engineering still genuinely leads its category.",
    logoUrl: "/images/brands/sony.svg",
    heroImageUrl: "/images/brands/heroes/sony.jpg",
    website: "https://www.sony.com",
    accentColor: "#0e0e10",
  },
  {
    slug: "samsung",
    name: "Samsung",
    tagline: "Products we love from Samsung",
    description:
      "Samsung makes everything from flagship phones to fridges, and the products that earn a place here are the ones where vertical integration shows — Galaxy ecosystem hardware, OLED panels, and SmartThings-grade home tech.",
    logoUrl: "/images/brands/samsung.svg",
    heroImageUrl: "/images/brands/heroes/samsung.jpg",
    website: "https://www.samsung.com",
    accentColor: "#1428a0",
  },
  {
    slug: "garmin",
    name: "Garmin",
    tagline: "Products we love from Garmin",
    description:
      "Garmin builds for athletes, pilots, and outdoor obsessives — wearables and navigation tools that prioritise battery life, ruggedness, and metrics that matter over flashy software.",
    logoUrl: "/images/brands/garmin.svg",
    heroImageUrl: "/images/brands/heroes/garmin.jpg",
    website: "https://www.garmin.com",
    accentColor: "#0e0e10",
  },
  {
    slug: "anker",
    name: "Anker",
    tagline: "Products we love from Anker",
    description:
      "Anker turned charging into a category. The brand's portable batteries, GaN bricks, and Soundcore audio line consistently punch above their price — practical hardware engineered for everyday use.",
    logoUrl: "/images/brands/anker.svg",
    heroImageUrl: "/images/brands/heroes/anker.jpg",
    website: "https://www.anker.com",
    accentColor: "#00bcd4",
  },
  {
    slug: "razer",
    name: "Razer",
    tagline: "Products we love from Razer",
    description:
      "Razer designs for the gaming desk — keyboards, mice, headsets, laptops, and the streaming gear that surrounds them. Aggressive industrial design backed by genuine performance hardware.",
    logoUrl: "/images/brands/razer.svg",
    heroImageUrl: "/images/brands/heroes/razer.jpg",
    website: "https://www.razer.com",
    accentColor: "#44d62c",
  },
  {
    slug: "asus",
    name: "Asus",
    tagline: "Products we love from Asus",
    description:
      "Asus and its ROG sub-brand cover the full PC stack — motherboards, GPUs, gaming laptops, ultra-thin notebooks. Reliable engineering with a consistent appetite for high-end performance.",
    logoUrl: "/images/brands/asus.svg",
    heroImageUrl: "/images/brands/heroes/asus.jpg",
    website: "https://www.asus.com",
    accentColor: "#0e0e10",
  },
  {
    slug: "dji",
    name: "DJI",
    tagline: "Products we love from DJI",
    description:
      "DJI dominates consumer drones and gimbals because the engineering is genuinely ahead. Stabilisation, flight dynamics, and image pipelines that competitors are still trying to match.",
    logoUrl: "/images/brands/dji.svg",
    heroImageUrl: "/images/brands/heroes/dji.jpg",
    website: "https://www.dji.com",
    accentColor: "#0e0e10",
  },
];

/** Get a brand by its slug (case-insensitive). */
export function getBrandBySlug(slug: string | undefined): Brand | undefined {
  if (!slug) return undefined;
  const target = slug.toLowerCase();
  return brands.find((b) => b.slug === target);
}

/**
 * Resolve the products for a brand. Primary path: `Product.brand === slug`.
 * Secondary path (best-effort): match against the brand name in the product
 * title or tags, case-insensitive. Drafts are filtered out (live site only).
 */
export function getProductsByBrand(brandSlug: string): Product[] {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];

  const direct = getProductsByBrandSlug(brand.slug);
  if (direct.length > 0) return direct;

  // Fallback: title or tag includes the brand name (case-insensitive).
  // Useful before a backfill has been applied.
  const needle = brand.name.toLowerCase();
  return products.filter((p) => {
    if (p.isDraft) return false;
    if (p.title.toLowerCase().includes(needle)) return true;
    return p.tags.some((t) => t.toLowerCase() === needle);
  });
}

/** Count of live products for a brand. Convenience for the index page. */
export function getBrandLiveProductCount(brandSlug: string): number {
  return getBrandProductCount(brandSlug);
}

/** All brands sorted by display name. */
export function getAllBrands(): Brand[] {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name));
}
