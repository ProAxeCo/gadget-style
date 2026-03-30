/*
 * GADGET STYLE — Product Card Component
 * Pixel-perfect match to Gadget Flow card design:
 * - Image fills card, rounded corners, NO text overlay
 * - Amazon "a" badge: black rounded square, top-left
 * - Bell (reminder) + Heart (collection) icons: bottom-right overlay, always visible
 * - Below image: green price + colored tag pills
 * - Product title below tags
 * - Broken images show a clean placeholder icon (no alt text leaking)
 */
import { useState } from "react";
import { Link } from "wouter";
import { Heart, Bell, ImageOff } from "lucide-react";
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

/* Amazon "a" logo as inline SVG — matches GF's black rounded square badge */
function AmazonBadge() {
  return (
    <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-black rounded-lg flex items-center justify-center shadow-md z-10">
      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none">
        <path
          d="M15.93 17.09c-.18.16-.44.17-.64.06C13.56 15.85 13 14.47 13 12.94c0-2.02 1.09-3.41 2.65-3.41.51 0 .98.18 1.35.52V7.5c0-.28.22-.5.5-.5h.01c.27 0 .49.22.49.5v8.46c0 .23-.1.45-.28.6-.93.78-2.17 1.18-3.43 1.18-2.12 0-4.01-.79-5.59-2.36-.12-.12-.13-.32-.01-.45.12-.13.32-.14.45-.02 1.44 1.44 3.14 2.13 5.05 2.13.89 0 1.73-.2 2.5-.58"
          fill="#FF9900"
        />
        <path
          d="M13.5 9.65C13.5 11.16 13.5 12.44 12.72 13.81c-.63 1.11-1.63 1.79-2.74 1.79-1.52 0-2.41-1.16-2.41-2.87 0-3.38 3.03-3.99 5.93-3.99v.91z"
          fill="#FF9900"
        />
        <path
          d="M13.5 9.65V8.74c0-1.31.09-2.51-.63-3.41-.58-.73-1.5-1.03-2.37-1.03-1.41 0-2.67.86-2.97 2.41-.06.33-.03.64.27.7l1.77.19c.18-.02.32-.19.35-.37.17-.83.86-1.23 1.63-1.23.42 0 .89.15 1.14.53.28.43.28 1.01.28 1.52v.27c-1.43.02-3.29.06-4.63.64-1.54.67-2.62 2.03-2.62 4.04 0 2.57 1.62 3.85 3.71 3.85 1.76 0 2.72-.42 4.08-1.81.45.65.6.96 1.42 1.64.19.09.42.08.58-.06v.01c.49-.44 1.38-1.22 1.88-1.64.2-.16.16-.42.01-.64-.45-.59-.92-1.07-.92-2.17V9.65h-2.97z"
          fill="white"
        />
      </svg>
    </div>
  );
}

/* Fallback placeholder when image fails to load */
function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e]">
      <ImageOff className="w-10 h-10 text-muted-foreground/30 mb-2" />
      <span className="text-[10px] text-muted-foreground/30 font-medium">Image unavailable</span>
    </div>
  );
}

export default function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const [imgError, setImgError] = useState(false);

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

  const handleReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast("Reminder Set", {
      description: `We'll notify you about ${product.title}`,
      icon: <Bell className="w-4 h-4 text-blue-400" />,
    });
  };

  // Tag color mapping — GF uses colored pills
  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t === "discount" || t === "sale") return "bg-red-500/80 text-white";
    if (t === "ces") return "bg-yellow-500/80 text-black";
    if (t === "luxury") return "bg-purple-500/80 text-white";
    if (t === "new") return "bg-emerald-500/80 text-white";
    return "border border-yellow-500/50 text-yellow-400 bg-transparent";
  };

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
          <Link href={`/product/${product.slug}`} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#1e1e2a] block">
            {imgError ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-muted-foreground/30" />
              </div>
            ) : (
              <img
                src={product.image}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${product.slug}`}>
              <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{product.title}</h4>
            </Link>
            <span className="text-sm font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card — Gadget Flow pixel-perfect match
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
    >
      {/* Clickable image area — GF style: image fills card, rounded corners, NO TEXT */}
      <Link href={`/product/${product.slug}`} className="block relative rounded-2xl overflow-hidden bg-[#1a1a2e] mb-2.5">
        <div className="aspect-[1.15/1] relative">
          {imgError ? (
            <ImagePlaceholder />
          ) : (
            <img
              src={product.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </div>


        {/* Bottom-right overlay icons — GF style: bell + heart, always visible */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 z-10">
          {/* Bell / Reminder icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleReminder}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-blue-400/80 hover:text-blue-300 hover:bg-black/60 transition-all"
                aria-label="Add reminder"
              >
                <Bell className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-medium">Add Reminder</TooltipContent>
          </Tooltip>

          {/* Heart / Wishlist icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleWishlistToggle}
                className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                  saved
                    ? "bg-red-500/30 text-red-400 ring-1 ring-red-500/40"
                    : "bg-black/40 text-pink-400/80 hover:text-pink-300 hover:bg-black/60"
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
                    <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  </motion.div>
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-medium">
              {saved ? "Remove from Wishlist" : "Add to Collection"}
            </TooltipContent>
          </Tooltip>
        </div>
      </Link>

      {/* Below image: Price + Tags row — GF exact style */}
      <div className="flex items-center flex-wrap gap-1.5 mb-1">
        <span className="text-[15px] font-bold font-mono text-green-400">${product.price.toFixed(2)}</span>
        {product.tags.slice(0, 3).map((tag: string) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Product title — GF style: regular weight, no description */}
      <Link href={`/product/${product.slug}`}>
        <h3 className="font-medium text-[14px] line-clamp-2 group-hover:text-primary transition-colors leading-snug text-foreground/90">
          {product.title}
        </h3>
      </Link>
    </motion.div>
  );
}
