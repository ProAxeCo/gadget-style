/*
 * GADGET STYLE — Brands Index Page
 *
 * Routed as `/brands`. Each brand is presented as a CLEAN BRAND-COLOR TILE —
 * the design pattern used by Apple/Razer/Belkin marketing surfaces and by
 * directory pages like B&H's "Shop by Brand". No product photography in the
 * card chrome (product photography is busy and inconsistent across brands —
 * lifestyle/marketing surfaces are not).
 *
 * Card anatomy:
 *   • Solid brand-accent gradient backdrop (or neutral if no accent set)
 *   • Subtle radial highlight + diagonal stripe pattern for depth
 *   • Large white logo centered (or dark if accent is light)
 *   • Brand name + product count on a darker bottom strip
 *
 * Hero:
 *   • Tall, dark, minimal — typography-led like a category banner
 *   • No product collage. Title + subtitle + brand-count strip.
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { brands } from "@/lib/brands";
import { getBrandProductCount } from "@/lib/data";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/**
 * Decide whether to render the logo in white or dark, based on the brand's
 * accent colour. Light accents (e.g. Anker cyan, Razer green, Amazon orange)
 * keep their dark logo so it stays legible. Dark accents (Apple, Sony,
 * Samsung) flip to white.
 */
function pickLogoTone(accent?: string): "light" | "dark" {
  if (!accent) return "light";
  // Parse #RRGGBB. Treat short forms or named colors as dark by default.
  const m = accent.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return "light";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // Perceived luminance (Rec. 709)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? "dark" : "light";
}

export default function BrandsIndexPage() {
  useDocumentTitle(
    "Brands",
    "Shop curated tech and gadget products by brand — Belkin, Sony, Apple, Samsung, DJI, Garmin, Anker, Razer, Asus, Amazon and more."
  );

  const sorted = [...brands]
    .map((b) => ({ ...b, count: getBrandProductCount(b.slug) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — full-bleed tech imagery with dark overlay (GF parity) */}
      <section className="relative w-full overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-24 lg:mt-28 mb-12 lg:mb-16 bg-zinc-950">
        {/* Lifestyle backdrop — Pexels-sourced tech imagery */}
        <img
          src="/images/brands/heroes/_index.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Light dark scrim — only enough to keep the white headline
            readable, the vibrant photo shows through everywhere else */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/45" />
        {/* Subtle blue/purple bloom for editorial polish (no longer
            blanket-dark — image carries the vibrancy) */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(59,130,246,0.25), transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.18), transparent 55%)",
          }}
        />

        <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs lg:text-sm font-mono tracking-[0.3em] uppercase text-blue-300/80 mb-4">
              Shop by Brand · {brands.length} brands
            </p>
            <h1 className="text-5xl lg:text-7xl font-display text-white leading-[1.05] mb-5">
              Brands we trust.
            </h1>
            <p className="text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Curated picks from the manufacturers who set the bar in their
              category — from Apple and Sony to Belkin, Anker, DJI, and the
              names that earn a place on your desk, in your bag, in your home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand grid — same column rhythm as product grids so the cards
          line up visually with the products elsewhere on the site */}
      <section className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pb-16 lg:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 lg:gap-6">
          {sorted.map((brand, i) => {
            const tone = pickLogoTone(brand.accentColor);
            const accent = brand.accentColor || "#1f2937";
            return (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group"
              >
                <Link href={`/brand/${brand.slug}`}>
                  {/* Square image area — matches ProductCard's aspect-square.
                      Image is shown CLEAR (no full-card tint). Only a soft
                      radial darkening behind the logo for legibility. */}
                  <div className="relative rounded-2xl overflow-hidden aspect-square shadow-md group-hover:shadow-2xl transition-all duration-300 mb-3 bg-secondary">
                    {brand.heroImageUrl ? (
                      <img
                        src={brand.heroImageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 60%, ${accent}aa 100%)`,
                        }}
                      />
                    )}
                    {/* Soft radial light-bloom behind the centered logo so
                        the brand-colored mark reads on busy backgrounds —
                        image otherwise clear */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 18%, rgba(255,255,255,0.18) 40%, transparent 65%)",
                      }}
                    />
                    {/* Logo placed directly on the photo — NO white pill.
                        Renders in the BRAND'S NATIVE COLOR (Samsung blue
                        stays blue, Razer green stays green, etc.). Subtle
                        drop shadow for definition. */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-8">
                      <img
                        src={brand.logoUrl}
                        alt={`${brand.name} logo`}
                        className="max-h-[55%] max-w-[80%] object-contain [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.25))]"
                        loading="lazy"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.outerHTML = `<span class="font-display text-2xl lg:text-3xl drop-shadow-lg" style="color:${accent}">${brand.name}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Info area BELOW the image — mirrors ProductCard's
                      price/tags/title rhythm so brand cards are the same
                      total height as product cards in the same grid */}
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <span className="text-[15px] lg:text-base font-bold font-mono inline-flex items-center gap-1.5" style={{ color: accent }}>
                      <Package className="w-3.5 h-3.5" />
                      {brand.count} {brand.count === 1 ? "product" : "products"}
                    </span>
                  </div>
                  <h3 className="font-medium text-base lg:text-[17px] line-clamp-2 group-hover:text-primary transition-colors leading-snug text-foreground/90">
                    {brand.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
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
