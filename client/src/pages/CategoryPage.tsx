/*
 * GADGET STYLE — Category Page
 * Lumina Design: Full-bleed category hero, filterable product grid with pagination
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import { ArrowLeft, SlidersHorizontal, ChevronDown, Grid3X3, LayoutList } from "lucide-react";

const PRODUCTS_PER_PAGE = 15;

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "popular";

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

  return (
    <div>
      {/* Category Hero — light editorial style */}
      <section className="pt-24 lg:pt-28 pb-10 lg:pb-14 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-5xl font-bold font-display text-foreground mb-2"
              >
                {category.name}
              </motion.h1>
              <p className="text-muted-foreground max-w-lg">{category.description}</p>
            </div>
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border border-border/50 shadow-lg shrink-0">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 lg:py-16">
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
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setVisibleCount(PRODUCTS_PER_PAGE);
                  }}
                  className="appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* View mode toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-6"
                : "space-y-4"
            }
          >
            {displayProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                variant={viewMode === "list" ? "featured" : undefined}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Load More Products
                <span className="text-xs opacity-70">
                  ({sortedProducts.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
