/*
 * GADGET STYLE — Product Card Component
 * Gadget Flow-inspired: Clickable image, price + tags below, wishlist overlay
 * No description text, no "View Deal" button — clean and minimal
 */
import { Link } from "wouter";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

export default function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  // Determine if it's an Amazon product (show 'a' icon)
  const isAmazon = product.affiliateUrl?.includes("amazon");

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group glass-card overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Clickable image */}
          <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-white block">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            />
            {/* Amazon badge */}
            {isAmazon && (
              <span className="absolute top-3 left-3 w-7 h-7 bg-black rounded-md flex items-center justify-center text-white font-bold text-sm shadow-lg">
                a
              </span>
            )}
          </Link>
          <div className="p-6 lg:p-8 flex flex-col justify-center">
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-xl lg:text-2xl font-bold font-display mb-3 hover:text-primary transition-colors">
                {product.title}
              </h3>
            </Link>
            {/* Price + Tags row */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-lg font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
              {product.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold rounded-full border border-yellow-500/50 text-yellow-400">
                  {tag}
                </span>
              ))}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  saved
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30"
                }`}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group"
      >
        <Link href={`/product/${product.slug}`} className="flex items-center gap-4 glass-card p-3">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white">
            <img src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{product.title}</h4>
            <span className="text-sm font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default card — Gadget Flow style
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group"
    >
      {/* Clickable image area */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 mb-2">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Amazon badge — top left like Gadget Flow */}
        {isAmazon && (
          <span className="absolute top-2.5 left-2.5 w-6 h-6 bg-black rounded-md flex items-center justify-center text-white font-bold text-xs shadow-lg">
            a
          </span>
        )}

        {/* Bottom overlay icons — cart + wishlist like Gadget Flow */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              saved
                ? "bg-red-500/30 text-red-400"
                : "bg-black/40 text-white/70 hover:text-red-400"
            }`}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>

      {/* Below image: Price + Tags row */}
      <div className="flex items-center flex-wrap gap-1.5 mb-1">
        <span className="text-sm font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
        {product.tags.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full border border-yellow-500/40 text-yellow-400">
            {tag}
          </span>
        ))}
      </div>

      {/* Product title */}
      <Link href={`/product/${product.slug}`}>
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {product.title}
        </h3>
      </Link>
    </motion.div>
  );
}
