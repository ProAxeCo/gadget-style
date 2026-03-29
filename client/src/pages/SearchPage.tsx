/*
 * GADGET STYLE — Search Results Page
 * Lumina Design: Clean search results with product grid and load more
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { Search, ArrowLeft } from "lucide-react";
import { searchProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const RESULTS_PER_PAGE = 16;

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);

  const results = useMemo(() => {
    setVisibleCount(RESULTS_PER_PAGE);
    return query ? searchProducts(query) : [];
  }, [query]);

  const displayResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  return (
    <div className="pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <Search className="w-7 h-7 text-primary" />
            Search Results
          </h1>
          {query && (
            <p className="text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
          )}
        </motion.div>

        {displayResults.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayResults.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
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
                    ({results.length - visibleCount} remaining)
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display mb-2">
              {query ? "No results found" : "Start searching"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {query
                ? `We couldn't find anything matching "${query}". Try different keywords.`
                : "Use the search bar to find gadgets, categories, and articles."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Browse All Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
