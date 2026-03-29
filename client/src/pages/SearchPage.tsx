/*
 * GADGET STYLE — Search Results Page
 * Lumina Design: Clean search results with product grid
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { Search, ArrowLeft } from "lucide-react";
import { searchProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";

  const results = useMemo(() => (query ? searchProducts(query) : []), [query]);

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

        {results.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
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
