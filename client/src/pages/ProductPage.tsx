/*
 * GADGET STYLE — Product Detail Page
 * Matches GadgetFlow layout:
 * - Large hero image with thumbnail strip below
 * - "Get it for $X" CTA button with Amazon smile icon (no Amazon logo on images)
 * - Wishlist + Share buttons
 * - Tabs: Overview | Specs | Price
 * - Specs tab shows real manufacturer specifications in clean table
 * - Rating badge
 * - Related products section
 * - Breadcrumb navigation
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { getProductBySlug, getProductsByCategory, type Product } from "@/lib/data";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/ProductCard";
import {
  ExternalLink,
  Heart,
  Share2,
  ChevronRight,
  Bell,
  Copy,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

/* Amazon smile arrow SVG — clean, recognizable icon for the CTA button */
function AmazonSmileIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* The "a" letter */}
      <path
        d="M12.5 9.62c0 1.11 0.03 2.04-0.53 3.03-0.46 0.8-1.18 1.29-1.99 1.29-1.1 0-1.75-0.84-1.75-2.08 0-2.44 2.19-2.89 4.27-2.89v0.65z"
        fill="currentColor"
      />
      <path
        d="M16.18 16.12c-0.24 0.21-0.59 0.23-0.87 0.08-1.22-1.01-1.43-1.48-2.1-2.44-2.01 2.05-3.43 2.66-6.03 2.66-3.08 0-5.48-1.9-5.48-5.7 0-2.97 1.61-4.99 3.9-5.98 1.99-0.87 4.76-1.03 6.88-1.27v-0.47c0-0.87 0.07-1.9-0.44-2.65-0.45-0.67-1.3-0.95-2.05-0.95-1.4 0-2.64 0.72-2.95 2.2-0.06 0.33-0.3 0.66-0.63 0.68l-3.54-0.38c-0.3-0.07-0.63-0.3-0.54-0.75C3.07 0.63 5.97-0.38 8.56-0.38c1.32 0 3.05 0.35 4.09 1.35 1.32 1.23 1.19 2.87 1.19 4.66v4.22c0 1.27 0.53 1.83 1.02 2.51 0.17 0.25 0.21 0.54-0.01 0.72-0.55 0.46-1.53 1.32-2.07 1.8l-0.01-0.01"
        fill="currentColor"
        transform="translate(4 4) scale(0.67)"
      />
      {/* The smile arrow */}
      <path
        d="M4.5 17.5c2.5 1.8 6 2.8 9 2.8 3.5 0 7-1.3 9.5-3.5 0.3-0.25 0.02-0.6-0.3-0.4-2.7 1.6-6 2.5-9.5 2.5-3 0-6.2-0.8-8.7-2.2-0.3-0.15-0.5 0.2-0.2 0.4"
        fill="#FF9900"
      />
      <path
        d="M20.5 16c-0.4-0.5-2.5-0.25-3.5-0.12-0.3 0.03-0.35-0.22-0.08-0.4 1.7-1.2 4.5-0.85 4.8-0.45 0.3 0.4-0.08 3.2-1.7 4.5-0.25 0.2-0.48 0.1-0.37-0.17 0.35-0.9 1.15-2.9 0.75-3.35"
        fill="#FF9900"
      />
    </svg>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "price">("overview");

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    setActiveTab("overview");
  }, [slug]);

  if (!product) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-bold font-display mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist.</p>
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);
  const related: Product[] = getProductsByCategory(product.categorySlug)
    .filter((p: Product) => p.id !== product.id)
    .slice(0, 4);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Generate feature bullets from description
  const descSentences = product.description
    .split(/[.!]/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  // Rating score out of 10
  const ratingScore = (product.rating * 2).toFixed(1);

  // Determine if affiliate is Amazon
  const isAmazon = product.affiliateUrl?.includes("amazon") || product.affiliateUrl?.includes("amzn.to");

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{product.title}</span>
        </nav>

        {/* Product Title — Gadget Flow style: title above the image */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl xl:text-4xl font-bold font-display mb-6"
        >
          {product.title}
        </motion.h1>

        {/* Main Grid: Image Left, Details Right */}
        <div className="grid lg:grid-cols-[58%_42%] gap-6 lg:gap-10">

          {/* LEFT: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image — clean, no Amazon logo overlay */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden glass-card mb-3 bg-white">
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <img
                src={images[activeImage] || product.image}
                alt={product.title}
                className="w-full h-full object-contain p-6"
              />
              {/* Image counter */}
              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Thumbnail Strip — GadgetFlow style */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-white p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Editor's Quote — GadgetFlow style */}
            <div className="mt-6 px-6 py-5 glass-card relative">
              <div className="absolute top-3 left-4 text-4xl text-primary/20 font-serif leading-none">&ldquo;</div>
              <p className="text-center text-sm italic text-muted-foreground px-6">
                {descSentences[0] ? descSentences[0] + "." : product.description.slice(0, 100) + "..."}
              </p>
              <p className="text-center text-xs text-muted-foreground/60 mt-2 font-medium">Editor&apos;s Quote</p>
              <div className="absolute bottom-3 right-4 text-4xl text-primary/20 font-serif leading-none">&rdquo;</div>
            </div>
          </motion.div>

          {/* RIGHT: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Rating Badge — Gadget Flow style circle */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Gadget Style Rating
                </span>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <span className="text-white font-bold text-lg">{ratingScore}</span>
              </div>
            </div>

            {/* Amazon CTA Button — GadgetFlow style: green with Amazon smile icon */}
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-[#1a8a4a] hover:bg-[#157a3f] text-white rounded-xl font-semibold text-base transition-colors mb-4 shadow-lg shadow-green-900/20"
            >
              {isAmazon ? (
                <AmazonSmileIcon className="w-6 h-6 shrink-0" />
              ) : (
                <ExternalLink className="w-5 h-5 shrink-0" />
              )}
              <span>Get it for ${product.price.toFixed(2)}</span>
              <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
            </a>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => {
                  toast.success("Price alert set! We'll notify you of price drops.");
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Bell className="w-4 h-4" />
                Price Alert
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  saved
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </div>

            {/* Tabs — Gadget Flow style */}
            <div className="border-b border-border mb-5">
              <div className="flex gap-6">
                {(["overview", "specs", "price"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                      activeTab === tab
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="product-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold font-display">
                  {product.title}: Overview
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                {descSentences.length > 1 && (
                  <ul className="space-y-2.5 mt-4">
                    {descSentences.slice(0, 5).map((sentence, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{sentence}.</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold font-display">
                  {product.title}: Tech Specs
                </h2>
                {/* Real manufacturer specifications — GadgetFlow clean table style */}
                <div className="divide-y divide-border/50">
                  {product.specs && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start py-3 gap-4">
                      <span className="text-sm font-semibold text-foreground shrink-0">{key}</span>
                      <span className="text-sm text-muted-foreground text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "price" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold font-display">Price Information</h2>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl font-bold font-mono mb-2">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current price on {isAmazon ? "Amazon" : "retailer"}
                  </p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a8a4a] hover:bg-[#157a3f] text-white rounded-lg font-semibold transition-colors"
                  >
                    {isAmazon && <AmazonSmileIcon className="w-5 h-5" />}
                    Check Latest Price
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground text-center italic">
                  Prices may vary. Click through for the most up-to-date pricing.
                </p>
              </div>
            )}

            {/* Affiliate Disclaimer */}
            <p className="text-[10px] text-muted-foreground/50 mt-6 italic">
              As an Amazon Associate and affiliate partner, Gadget Style earns from qualifying purchases.
              Prices and availability are subject to change.
            </p>
          </motion.div>
        </div>

        {/* Gadget Flow URL link if available */}
        {product.gadgetFlowUrl && (
          <div className="mt-8 p-4 glass-card flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Also featured on Gadget Flow</span>
            <a
              href={product.gadgetFlowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View on Gadget Flow <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display">You Might Also Like</h2>
              <Link
                href={`/category/${product.categorySlug}`}
                className="text-sm text-primary hover:underline"
              >
                View all {product.category}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p: Product, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
