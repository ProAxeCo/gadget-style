/*
 * GADGET STYLE — Brands Index Page
 *
 * Routed as `/brands`. Lists every brand defined in `lib/brands.ts` with a
 * banner-style card (mirrors the category-page rhythm): a representative
 * product image as the card backdrop, a tinted overlay keyed off the brand's
 * accentColor, the brand logo over a white pill, plus name + product count.
 *
 * Design parity goals:
 *   • Full-bleed hero banner like CategoryPage (image + gradient + centered
 *     copy + product-count strip).
 *   • Brand cards use product imagery as the visual hook — same pattern as
 *     category cards on the home page.
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { brands } from "@/lib/brands";
import {
  getBrandProductCount,
  getProductsByBrandSlug,
} from "@/lib/data";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// Hero gets a 3-up product collage drawn from the top-3 brands at runtime.

export default function BrandsIndexPage() {
  useDocumentTitle(
    "Brands",
    "Shop curated tech and gadget products by brand — Belkin, Sony, Apple, Samsung, DJI, Garmin, Anker, Razer, Asus, Amazon and more."
  );

  // Sort brands by product count desc, then attach a representative product
  // image for the card backdrop. Brands with no live products fall back to
  // their accent gradient.
  const sorted = [...brands]
    .map((b) => {
      const count = getBrandProductCount(b.slug);
      const firstProduct = getProductsByBrandSlug(b.slug)[0];
      return {
        ...b,
        count,
        backdrop: firstProduct?.image ?? null,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Top-3 brands give us the hero collage backdrop — gives the banner real
  // visual weight without depending on an external image asset.
  const heroCollage = sorted
    .filter((b) => b.backdrop)
    .slice(0, 3)
    .map((b) => b.backdrop as string);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner — same rhythm as CategoryPage */}
      <section className="relative w-full h-[360px] lg:h-[440px] flex items-center justify-center overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-24 lg:mt-28 mb-12 lg:mb-16">
        {/* 3-up collage backdrop drawn from top brands' product imagery */}
        {heroCollage.length > 0 ? (
          <div className="absolute inset-0 grid grid-cols-3">
            {heroCollage.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/70 to-black/70" />

        <div className="relative z-10 text-center text-white px-6 sm:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm lg:text-base font-medium text-white/80 mb-3 uppercase tracking-wide">
              {brands.length} Brands
            </p>
            <h1 className="text-4xl lg:text-6xl font-bold font-display text-white mb-4 leading-tight">
              Brands
            </h1>
            <p className="text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
              Curated picks from the manufacturers we trust most — from Apple
              and Sony to Belkin, Anker, DJI and the names that define each
              category.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
          {sorted.map((brand, i) => (
            <motion.div
              key={brand.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <Link href={`/brand/${brand.slug}`}>
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square shadow-md hover:shadow-xl transition-all">
                  {/* Backdrop image (or accent gradient fallback) */}
                  {brand.backdrop ? (
                    <img
                      src={brand.backdrop}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: brand.accentColor
                          ? `linear-gradient(135deg, ${brand.accentColor}cc 0%, #0b1220 60%, #050810 100%)`
                          : "linear-gradient(135deg, #1f2937, #0b1220)",
                      }}
                    />
                  )}

                  {/* Tint overlay keyed off the brand color */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: brand.accentColor
                        ? `linear-gradient(180deg, ${brand.accentColor}40 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)`
                        : "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)",
                    }}
                  />

                  {/* Logo pill */}
                  <div className="absolute top-3 left-3 right-3 flex justify-center">
                    <div className="bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex items-center justify-center w-full max-w-[140px] h-12 lg:h-14">
                      <img
                        src={brand.logoUrl}
                        alt={`${brand.name} logo`}
                        className="max-h-8 lg:max-h-10 max-w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          // Fall back to brand name as text if logo fails
                          const t = e.currentTarget as HTMLImageElement;
                          t.outerHTML = `<span class="font-display text-sm lg:text-base text-zinc-800 px-2">${brand.name}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom info row */}
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 text-white">
                    <h3 className="font-display text-lg lg:text-xl drop-shadow-md leading-tight">
                      {brand.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-white/85 font-mono inline-flex items-center gap-1.5">
                        <Package className="w-3 h-3" />
                        {brand.count} {brand.count === 1 ? "product" : "products"}
                      </p>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
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
