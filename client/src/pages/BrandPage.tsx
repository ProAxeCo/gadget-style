/*
 * GADGET STYLE — Brand Landing Page
 *
 * Routed as `/brand/:slug` (see App.tsx). Hero with brand logo + name +
 * tagline + description. Below: grid of products tagged into that brand.
 *
 * Design: dark hero panel keyed off `brand.accentColor` when set, falls back
 * to a neutral gradient. Mirrors the GF brand-page rhythm without copying it
 * — Inter + Instrument Serif typography, the same Corporate Blue accent on
 * primary CTAs and tag pills as the rest of the site. Mobile-first.
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Globe, ImageOff, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getBrandBySlug, getProductsByBrand } from "@/lib/brands";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PRODUCTS_PER_PAGE = 24;

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brand = getBrandBySlug(slug || "");
  const products = useMemo(() => (brand ? getProductsByBrand(brand.slug) : []), [brand]);

  useDocumentTitle(
    brand ? `${brand.name}` : "Brand",
    brand ? `${brand.tagline}. ${brand.description}` : undefined,
  );

  const [logoBroken, setLogoBroken] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Reset visible window when navigating between brands
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
    setLogoBroken(false);
  }, [slug]);

  if (!brand) {
    return (
      <div className="pt-32 pb-16 container text-center">
        <h1 className="text-2xl font-display mb-4">Brand Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We don't have a page for that brand yet. Browse our full directory or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/brands" className="text-primary hover:underline">All brands</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/" className="text-primary hover:underline">Home</Link>
        </div>
      </div>
    );
  }

  const displayProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  // Brand-color hero — clean marketing-surface treatment, NOT a busy product
  // photo backdrop. Uses the brand's accent color as a deep gradient with a
  // subtle radial highlight, just like Apple/Razer/Belkin's own brand pages.
  const accent = brand.accentColor || "#1f2937";

  // Auto-pick logo pill tone based on accent luminance (light accent → dark
  // pill, dark accent → white pill) so logos stay legible.
  const accentLum = (() => {
    const m = accent.match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    return (
      (0.2126 * ((n >> 16) & 0xff) +
        0.7152 * ((n >> 8) & 0xff) +
        0.0722 * (n & 0xff)) /
      255
    );
  })();
  const pillTone: "light" | "dark" = accentLum > 0.6 ? "dark" : "light";

  const heroStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 45%, #0b1220 100%)`,
  };

  // Optional override — if a brand has dedicated press-kit hero imagery, it
  // overlays the gradient at low opacity rather than replacing it.
  const heroOverlay = brand.heroImageUrl;

  // Schema.org JSON-LD for SEO. Brand + ItemList of products.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Brand",
        name: brand.name,
        description: brand.description,
        logo: typeof window !== "undefined" ? new URL(brand.logoUrl, window.location.origin).toString() : brand.logoUrl,
        url: brand.website,
      },
      {
        "@type": "ItemList",
        name: `${brand.name} products on Gadget Style`,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 50).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: typeof window !== "undefined"
            ? new URL(`/product/${p.slug}`, window.location.origin).toString()
            : `/product/${p.slug}`,
          name: p.title,
        })),
      },
    ],
  };

  return (
    <div>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — full-bleed brand-themed lifestyle photo with accent tint */}
      <section
        className="relative w-full mt-24 lg:mt-28 mb-12 lg:mb-16 mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden"
        style={heroOverlay ? undefined : heroStyle}
      >
        {/* Lifestyle backdrop (Pexels-sourced when heroImageUrl is set) */}
        {heroOverlay && (
          <img
            src={heroOverlay}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Brand-color tint overlay — multiply blend ties the photo to the
            brand's identity while keeping the image readable */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background: heroOverlay
              ? `linear-gradient(135deg, ${accent}b3 0%, ${accent}80 55%, ${accent}66 100%)`
              : "transparent",
          }}
        />
        {/* Soft top-left highlight for depth */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.25), transparent 60%)",
          }}
        />
        {/* Bottom vignette for content legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/45" />

        <div className="relative z-10 container py-20 lg:py-28 flex flex-col items-center text-center">
          {/* Back link */}
          <Link
            href="/brands"
            className="absolute top-6 left-6 lg:top-8 lg:left-8 inline-flex items-center gap-1.5 text-xs lg:text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All brands
          </Link>

          {/* Logo pill — auto-toned to the accent so it always reads */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-24 h-24 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center shadow-2xl mb-7 p-4 ${
              pillTone === "dark" ? "bg-zinc-900/85 backdrop-blur" : "bg-white/95 backdrop-blur"
            }`}
          >
            {logoBroken ? (
              <span
                className={`text-xl lg:text-2xl font-display ${
                  pillTone === "dark" ? "text-white" : "text-zinc-800"
                }`}
              >
                {brand.name}
              </span>
            ) : (
              <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain"
                onError={() => setLogoBroken(true)}
              />
            )}
          </motion.div>

          {/* "Products we love from <Brand>" — GF-style accent underline.
              Underline tone auto-flips so it stays readable on any accent. */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-display text-white mb-2 leading-tight"
          >
            Products we love from{" "}
            <span className="relative inline-block pb-1 text-white">
              {brand.name}
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-0.5 h-1.5 rounded"
                style={{
                  backgroundColor:
                    pillTone === "dark" ? "#ffffff" : "#FFCC00",
                  opacity: 0.95,
                }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="text-base lg:text-lg text-white/85 max-w-2xl mt-5 leading-relaxed"
          >
            {brand.description}
          </motion.p>

          {brand.website && (
            <motion.a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 font-semibold hover:bg-white/90 transition-colors text-sm"
            >
              Visit official site <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}

          {/* Stat strip */}
          <div className="mt-8 flex items-center gap-6 text-white/80 text-xs font-mono tracking-widest uppercase">
            <span className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> {products.length} products
            </span>
            {brand.website && (
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Official partner
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="container pb-16 lg:pb-24">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <span className="text-primary font-mono text-xs tracking-widest uppercase block mb-2">
              Curated
            </span>
            <h2 className="text-2xl lg:text-3xl font-display text-foreground">
              The {brand.name} shortlist
            </h2>
          </div>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        </div>

        {products.length === 0 ? (
          <div
            className="relative rounded-3xl overflow-hidden p-10 lg:p-16 text-center"
            style={{
              background: `linear-gradient(135deg, ${accent}1a 0%, ${accent}0d 50%, transparent 100%)`,
              border: `1px solid ${accent}33`,
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
              style={{
                color: accent,
                backgroundColor: `${accent}15`,
                border: `1px solid ${accent}33`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
              In the pipeline
            </div>
            <h3 className="text-2xl lg:text-3xl font-display text-foreground mb-3">
              {brand.name} is being curated.
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We're hand-picking the {brand.name} products that earn a place on this site —
              the ones that actually shift the category, not just the ones that ship the most units.
              Check back soon, or explore other brands while we finish the shortlist.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Browse all brands <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold hover:border-foreground/40 transition-colors"
                >
                  Visit {brand.name} <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 lg:gap-6">
              {displayProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + PRODUCTS_PER_PAGE)}
                  className="px-6 py-3 rounded-lg border border-border/50 text-sm font-medium hover:border-primary/30 hover:text-primary transition-colors"
                >
                  Load more ({products.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
