/*
 * GADGET STYLE — Category Page
 * Lumina Design: Full-bleed category hero, product grid
 */
import { useParams } from "wouter";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getProductsByCategory, products } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const categoryProducts = slug ? getProductsByCategory(slug) : [];

  if (!category) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-bold font-display mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const displayProducts = categoryProducts.length > 0 ? categoryProducts : products.slice(0, 6);

  return (
    <div>
      {/* Category Hero */}
      <section className="relative h-[45vh] min-h-[320px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="container relative z-10 pb-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-5xl font-bold font-display text-white mb-2"
          >
            {category.name}
          </motion.h1>
          <p className="text-white/70 max-w-lg">{category.description}</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{displayProducts.length} products</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
