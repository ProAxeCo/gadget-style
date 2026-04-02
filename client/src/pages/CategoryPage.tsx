/*
 * GADGET STYLE — Category Page
 * GadgetFlow-inspired full-width hero banner with category image, title, description, and product count
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import { ArrowLeft, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList } from "lucide-react";

const PRODUCTS_PER_PAGE = 15;

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "popular";

/* Category banner images — mapped to each category slug */
const BANNER_IMAGES: Record<string, string> = {
  "smart-home": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_smart_home-Lwe9YFSYX3gE8xqhxj9kTj.webp",
  "audio-sound": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_audio_sound-m3tVjiQeQUeRXkB4fbHybh.webp",
  "gaming-accessories": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_gaming-MmqK9Gn2W2jAptfuN4VvKE.webp",
  "wearables-fitness": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_wearables-MYdZmCFMz5FTBhXFVFWVxa.webp",
  "outdoor-adventure-tech": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_outdoor-EkMk8AcUMoSLDSaCgZYsrr.webp",
  "everyday-carry-accessories": "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/banner_edc-YKLckERraRsUZBDx53WA2Z.webp",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const allProducts = slug ? getProductsByCategory(slug) : [];

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortedProducts = useMemo(() => {
    const sorted = [...allProducts];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }
    return sorted;
  }, [allProducts, sortBy]);

  const displayProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  if (!category) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-bold font-display mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const bannerImage = BANNER_IMAGES[slug || ""] || category.image;

  return (
    <div>
      {/* ═══ FULL-WIDTH GF-STYLE CATEGORY HERO BANNER ═══ */}
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bannerImage}')` }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            {/* Product count badge */}
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <p className="text-sm font-semibold text-white">
                {sortedProducts.length} <span className="text-white/70">Products</span>
              </p>
            </div>

            {/* Category title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-display text-white mb-4 leading-tight">
              {category.name}
            </h1>

            {/* Category description */}
            <p className="text-lg text-white/80 max-w-xl leading-relaxed">
              {category.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRODUCTS GRID ═══ */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-semibold">{displayProducts.length}</span> of{" "}
              <span className="text-foreground font-semibold">{sortedProducts.length}</span> products
            </p>

            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none px-4 py-2.5 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-border text-sm font-medium cursor-pointer pr-8"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                : "space-y-4"
            }
          >
            {displayProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
