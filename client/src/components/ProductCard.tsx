/*
 * GADGET STYLE — Product Card Component
 * Matches Gadget Flow dimensions: ~222px wide in 5-col grid, natural aspect ratio images
 * Enhanced wishlist: larger button, tooltip, toast notification, animated heart
 */
import { Link } from "wouter";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

export default function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  const isAmazon = product.affiliateUrl?.includes("amazon");

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!saved) {
      toast.success("Added to Wishlist", {
        description: product.title,
        icon: <Heart className="w-4 h-4 fill-red-500 text-red-500" />,
        action: {
          label: "View Wishlist",
          onClick: () => { window.location.href = "/wishlist"; },
        },
      });
    } else {
      toast("Removed from Wishlist", {
        description: product.title,
        icon: <Heart className="w-4 h-4 text-muted-foreground" />,
      });
    }
  };

  const WishlistButton = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "p-1.5",
      md: "p-2.5",
      lg: "p-3",
    };
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleWishlistToggle}
            className={`${sizeClasses[size]} rounded-full backdrop-blur-md transition-all duration-300 ${
              saved
                ? "bg-red-500/20 text-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30"
                : "bg-black/50 text-white/80 hover:text-red-400 hover:bg-black/60 hover:shadow-lg"
            }`}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={saved ? "saved" : "unsaved"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Heart className={`${iconSizes[size]} ${saved ? "fill-current" : ""}`} />
              </motion.div>
            </AnimatePresence>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          {saved ? "Remove from Wishlist" : "Save to Wishlist"}
        </TooltipContent>
      </Tooltip>
    );
  };

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
          <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-white block">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            />
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
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-lg font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
              {product.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold rounded-full border border-yellow-500/50 text-yellow-400">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-medium">View on Amazon</TooltipContent>
              </Tooltip>
              <WishlistButton size="lg" />
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
        <div className="flex items-center gap-4 glass-card p-3">
          <Link href={`/product/${product.slug}`} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white block">
            <img src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${product.slug}`}>
              <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{product.title}</h4>
            </Link>
            <span className="text-sm font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
          </div>
          <WishlistButton size="sm" />
        </div>
      </motion.div>
    );
  }

  // Default card — Gadget Flow size: large image, generous padding
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group"
    >
      {/* Clickable image area — GF uses ~1.2 aspect ratio (slightly taller than wide) */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[1.15/1] rounded-2xl overflow-hidden bg-[#1e1e2a] mb-3">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Amazon badge — top left */}
        {isAmazon && (
          <span className="absolute top-3 left-3 w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
            a
          </span>
        )}

        {/* Bottom overlay: cart + wishlist */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 transition-all"
                aria-label="View on Amazon"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-medium">View on Amazon</TooltipContent>
          </Tooltip>
          <WishlistButton size="md" />
        </div>
      </Link>

      {/* Below image: Price + Tags row */}
      <div className="flex items-center flex-wrap gap-2 mb-1.5">
        <span className="text-base font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
        {product.tags.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold rounded-full border border-yellow-500/40 text-yellow-400">
            {tag}
          </span>
        ))}
      </div>

      {/* Product title — larger text */}
      <Link href={`/product/${product.slug}`}>
        <h3 className="font-semibold text-[15px] line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {product.title}
        </h3>
      </Link>
    </motion.div>
  );
}
