/*
 * GADGET STYLE — Brands Index Page
 *
 * Routed as `/brands`. Lists every brand defined in `lib/brands.ts` with its
 * logo, name, product count, and a click-through to the per-brand landing
 * page at `/brand/:slug`.
 *
 * Design: simple card grid, light cards on neutral background, brand logo
 * centered, name and product count underneath. Mirrors GF's "Brands" index
 * without copying it. Mobile-first responsive grid (2 cols → 4 cols → 6 cols).
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { brands } from "@/lib/brands";
import { getBrandProductCount } from "@/lib/data";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function BrandsIndexPage() {
  useDocumentTitle(
    "Brands",
    "Shop curated tech and gadget products by brand — Belkin, Sony, Apple, Samsung, DJI, Garmin, Anker, Razer, Asus, Amazon and more."
  );

  // Sort brands by product count descending so the well-stocked ones lead
  const sorted = [...brands]
    .map((b) => ({ ...b, count: getBrandProductCount(b.slug) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 bg-gradient-to-b from-secondary/40 to-background">
        <div className="container py-16 lg:py-20">
          <div className="max-w-3xl">
            <span className="text-primary font-mono text-xs tracking-widest uppercase block mb-3">
              Browse
            </span>
            <h1 className="text-4xl lg:text-5xl font-display text-foreground mb-4">
              Brands
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Curated picks from the manufacturers we trust most. From Apple
              and Sony to Belkin, Anker, DJI and the names that define each
              category — we've shortlisted the products that actually earn a
              place on your desk, in your bag, or in your living room.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
          {sorted.map((brand, i) => (
            <motion.div
              key={brand.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <Link href={`/brand/${brand.slug}`}>
                <div className="group bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col items-center justify-between">
                  <div className="aspect-[2/1] w-full flex items-center justify-center mb-4 grayscale group-hover:grayscale-0 transition-all">
                    <img
                      src={brand.logoUrl}
                      alt={`${brand.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        // graceful fallback if logo fails — render brand name as text
                        const t = e.currentTarget as HTMLImageElement;
                        t.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-display text-base lg:text-lg text-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {brand.count} {brand.count === 1 ? "product" : "products"}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No brands available yet.
          </div>
        )}
      </section>
    </div>
  );
}
