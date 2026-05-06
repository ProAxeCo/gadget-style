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
      {/* Hero — clean dark typographic banner (no busy collage) */}
      <section className="relative w-full overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-24 lg:mt-28 mb-12 lg:mb-16 bg-zinc-950">
        {/* Subtle radial highlight + grid pattern for depth */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(59,130,246,0.18), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.12), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
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

      {/* Brand grid — clean colour tiles, large logos, NO product photos */}
      <section className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
          {sorted.map((brand, i) => {
            const tone = pickLogoTone(brand.accentColor);
            const accent = brand.accentColor || "#1f2937";
            return (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              >
                <Link href={`/brand/${brand.slug}`}>
                  <div className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square shadow-md hover:shadow-2xl transition-all duration-300">
                    {/* Solid brand-color backdrop */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 60%, ${accent}aa 100%)`,
                      }}
                    />
                    {/* Subtle radial highlight from top-left for depth */}
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        background:
                          tone === "dark"
                            ? "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 55%)"
                            : "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 55%)",
                      }}
                    />
                    {/* Diagonal stripe texture, very subtle */}
                    <div
                      className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 14px)",
                      }}
                    />

                    {/* Logo — centered, large, bg-card pill so even thin/dark logos read on any accent */}
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <div
                        className={`rounded-2xl px-5 py-4 lg:px-6 lg:py-5 backdrop-blur-sm shadow-lg flex items-center justify-center w-full max-w-[180px] h-20 lg:h-24 ${
                          tone === "dark"
                            ? "bg-zinc-900/85"
                            : "bg-white/95"
                        }`}
                      >
                        <img
                          src={brand.logoUrl}
                          alt={`${brand.name} logo`}
                          className="max-h-12 lg:max-h-14 max-w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            t.outerHTML = `<span class="font-display text-lg lg:text-xl ${
                              tone === "dark" ? "text-white" : "text-zinc-800"
                            }">${brand.name}</span>`;
                          }}
                        />
                      </div>
                    </div>

                    {/* Bottom info strip */}
                    <div className="absolute inset-x-0 bottom-0">
                      <div className="bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 lg:p-5">
                        <div className="flex items-center justify-between text-white">
                          <div>
                            <h3 className="font-display text-base lg:text-lg leading-tight drop-shadow-md">
                              {brand.name}
                            </h3>
                            <p className="text-xs text-white/85 font-mono inline-flex items-center gap-1.5 mt-0.5">
                              <Package className="w-3 h-3" />
                              {brand.count}{" "}
                              {brand.count === 1 ? "product" : "products"}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
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
