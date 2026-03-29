/*
 * GADGET STYLE — Product Detail Page
 * Lumina Design: Split layout, sticky image gallery, editorial content
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/ProductCard";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Star,
  Check,
  X as XIcon,
  Share2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-bold font-display mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const related = getRelatedProducts(product, 4);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const specs = product.specs || {};
  const pros = product.pros || [];
  const cons = product.cons || [];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </div>

        {/* Product layout */}
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden glass-card mb-3">
              <img
                src={images[activeImage] || product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md uppercase tracking-wider">
                  New
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
              {product.category}
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold font-display mb-4">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <span className="text-3xl font-bold font-mono">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-sm font-semibold rounded">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 mb-8">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4" />
                View on {product.retailer}
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  saved
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Specs table — only show if specs exist */}
            {Object.keys(specs).length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Specifications</h3>
                <div className="glass-card divide-y divide-border">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons — only show if they exist */}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {pros.length > 0 && (
                  <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Pros
                    </h4>
                    <ul className="space-y-2">
                      {pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <XIcon className="w-4 h-4" /> Cons
                    </h4>
                    <ul className="space-y-2">
                      {cons.map((con, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <XIcon className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Affiliate disclosure */}
            <p className="text-xs text-muted-foreground/60 italic">
              As an Amazon Associate and affiliate partner, Gadget Style earns from qualifying purchases. Prices and availability are subject to change.
            </p>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-xl font-bold font-display mb-6">You Might Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
