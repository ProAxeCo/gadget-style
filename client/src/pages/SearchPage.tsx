/*
 * GADGET STYLE — Search Results Page
 * Editorial Feed Design: Full search experience with inline search bar,
 * category filter pills, sort options, and 5-column product grid
 */
import { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearch, useLocation } from "wouter";
import { Search, ArrowLeft, SlidersHorizontal, X, Grid3X3, LayoutList } from "lucide-react";
import { searchProducts, categories } from "@/lib/data";
import type { Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const RESULTS_PER_PAGE = 20;

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest";

export default function SearchPage() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const [inlineQuery, setInlineQuery] = useState(query);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset visible count when query changes */
  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
    setInlineQuery(query);
    setActiveCategory(null);
    setSortBy("relevance");
  }, [query]);

  /* Get raw results */
  const rawResults = useMemo(() => {
    return query ? searchProducts(query) : [];
  }, [query]);

  /* Apply category filter */
  const filteredResults = useMemo(() => {
    if (!activeCategory) return rawResults;
    return rawResults.filter(p => p.categorySlug === activeCategory);
  }, [rawResults, activeCategory]);

  /* Apply sort */
  const sortedResults = useMemo(() => {
    const arr = [...filteredResults];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "newest":
        return arr.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      default:
        return arr;
    }
  }, [filteredResults, sortBy]);

  const displayResults = sortedResults.slice(0, visibleCount);
  const hasMore = visibleCount < sortedResults.length;

  /* Get unique categories from results for filter pills */
  const resultCategories = useMemo(() => {
    const slugs = Array.from(new Set(rawResults.map(p => p.categorySlug)));
    return slugs.map(slug => {
      const cat = categories.find(c => c.slug === slug);
      const count = rawResults.filter(p => p.categorySlug === slug).length;
      return { slug, name: cat?.name || slug, count };
    }).sort((a, b) => b.count - a.count);
  }, [rawResults]);

  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inlineQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(inlineQuery.trim())}`);
    }
  };

  return (
    <div className="pt-28 lg:pt-32 pb-16">
      <div className="container">
        {/* Header area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Inline search bar */}
          <form onSubmit={handleInlineSearch} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              placeholder="Search gadgets, categories, articles..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/[0.04] dark:bg-white/5 border border-border/50 text-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
            />
            {inlineQuery && (
              <button
                type="button"
                onClick={() => { setInlineQuery(""); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Results count + sort */}
          {query && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold font-display flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  {sortedResults.length} result{sortedResults.length !== 1 ? "s" : ""} for "{query}"
                </h1>
                {activeCategory && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Filtered by: {resultCategories.find(c => c.slug === activeCategory)?.name}
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="ml-2 text-primary hover:underline"
                    >
                      Clear
                    </button>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-black/[0.04] dark:bg-white/5 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          )}

          {/* Category filter pills */}
          {resultCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  !activeCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/[0.04] dark:bg-white/5 text-muted-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 hover:text-foreground"
                }`}
              >
                All ({rawResults.length})
              </button>
              {resultCategories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/[0.04] dark:bg-white/5 text-muted-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results grid */}
        {displayResults.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayResults.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + RESULTS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Load More Results
                  <span className="text-xs opacity-70">
                    ({sortedResults.length - visibleCount} remaining)
                  </span>
                </button>
              </div>
            )}
          </>
        ) : query ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find anything matching "{query}". Try different keywords or browse our categories.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Browse All Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display mb-2">Start searching</h2>
            <p className="text-muted-foreground mb-6">
              Use the search bar above to find gadgets, categories, and articles.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["smart speaker", "wireless earbuds", "gaming keyboard", "smartwatch", "power bank"].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setInlineQuery(term);
                    setLocation(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
