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

  // Hero background — uses accentColor when set, otherwise a neutral dark gradient.
  const heroStyle: React.CSSProperties = brand.accentColor
    ? {
        background: `linear-gradient(135deg, ${brand.accentColor}33 0%, #0b1220 60%, #050810 100%)`,
      }
    : {};

  // Pick a representative product image for the hero backdrop when the brand
  // doesn't supply its own heroImageUrl. Mirrors the GF brand-page rhythm —
  // the products themselves carry the brand's visual identity.
  const heroBackdrop =
    brand.heroImageUrl ??
    (products.length > 0 ? products[0].image : undefined);

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

      {/* Hero */}
      <section
        className="relative w-full mt-24 lg:mt-28 mb-12 lg:mb-16 mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden"
        style={heroStyle}
      >
        {heroBackdrop && (
          <>
            <img
              src={heroBackdrop}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/75" />
          </>
        )}
        {!heroBackdrop && !brand.accentColor && (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />
        )}

        <div className="relative z-10 container py-16 lg:py-24 flex flex-col items-center text-center">
          {/* Back link */}
          <Link
            href="/brands"
            className="absolute top-6 left-6 lg:top-8 lg:left-8 inline-flex items-center gap-1.5 text-xs lg:text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All brands
          </Link>

          {/* Compact logo pill — top of hero (smaller than before, GF-style) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/95 flex items-center justify-center shadow-xl mb-6 p-3"
          >
            {logoBroken ? (
              <span className="text-xl lg:text-2xl font-display text-zinc-800">{brand.name}</span>
            ) : (
              <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain"
                onError={() => setLogoBroken(true)}
              />
            )}
          </motion.div>

          {/* "Products we love from <Brand>" — GF-style accent underline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-display text-white mb-2 leading-tight"
          >
            Products we love from{" "}
            <span
              className="relative inline-block pb-1"
              style={{
                color: brand.accentColor || "#FFCC00",
              }}
            >
              {brand.name}
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-0.5 h-1.5 rounded"
                style={{
                  backgroundColor: brand.accentColor || "#FFCC00",
                  opacity: 0.85,
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
          <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
            <ImageOff className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No live products from {brand.name} yet — check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
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
