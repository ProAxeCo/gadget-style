/*
 * GADGET STYLE — Product Card Component
 * Lumina Design: Glassmorphism card, image-first, Electric Blue CTA
 */
import { Link } from "wouter";
import { Heart, ExternalLink, Star, TrendingUp } from "lucide-react";
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
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-white">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            {product.isTrending && (
              <span className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-md">
                <TrendingUp className="w-3 h-3" /> Trending
              </span>
            )}
          </div>
          <div className="p-6 lg:p-8 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              {product.category}
            </span>
            <Link href={`/product/${product.slug}`}>
              <h3 className="text-xl lg:text-2xl font-bold font-display mb-2 hover:text-primary transition-colors">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-semibold">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold font-mono text-foreground">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="font-bold">a</span> Get it for ${product.price.toFixed(2)}
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  saved
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
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
        className="group flex items-center gap-4 glass-card p-3"
      >
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white">
          <img src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/product/${product.slug}`}>
            <h4 className="text-sm font-semibold truncate hover:text-primary transition-colors">{product.title}</h4>
          </Link>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <span className="text-sm font-bold font-mono">${product.price.toFixed(2)}</span>
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group glass-card overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
            saved
              ? "bg-primary/20 text-primary"
              : "bg-black/30 text-white/80 hover:text-white hover:bg-black/50"
          }`}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </button>

        {/* Trending badge */}
        {product.isTrending && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-orange-500/90 text-white text-[10px] font-bold rounded">
            <TrendingUp className="w-3 h-3" /> Trending
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold font-mono">${product.price.toFixed(2)}</span>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            View Deal
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
