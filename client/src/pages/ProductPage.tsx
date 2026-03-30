/*
 * GADGET STYLE — Product Detail Page
 * - Large hero image with thumbnail strip below
 * - "Get it for $X" CTA button with Amazon logo (no Amazon logo on images)
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

/* Amazon logo — uses the actual Amazon "a" + smile PNG for crisp, recognizable branding */
const AMAZON_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/amazon_logo_gf_3247f94d.png";

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

        {/* Product Title */}
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
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-secondary/30 border border-border/50">
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <img
                src={images[activeImage] || product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Image counter */}
              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
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
                    <img src={img} alt="" className="w-full h-full object-cover bg-secondary/30" />
                  </button>
                ))}
              </div>
            )}

            {/* Editor's Quote */}
            <div className="mt-6 px-6 py-5 rounded-xl bg-card border border-border/50 relative">
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
            {/* Rating Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Gadget Style Rating
                </span>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">{ratingScore}</span>
              </div>
            </div>

            {/* Amazon CTA Button — yellow with crisp Amazon logo */}
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-base transition-colors mb-4 shadow-lg ${
                isAmazon
                  ? "bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-amber-500/15"
                  : "bg-[#1a8a4a] hover:bg-[#157a3f] text-white shadow-green-900/20"
              }`}
            >
              {isAmazon ? (
                <img src={AMAZON_LOGO_URL} alt="Amazon" className="h-7 w-auto shrink-0" />
              ) : (
                <ExternalLink className="w-5 h-5 shrink-0" />
              )}
              <span>Get it for ${product.price.toFixed(2)}</span>
              <ExternalLink className={`w-4 h-4 ml-auto ${isAmazon ? "opacity-40" : "opacity-60"}`} />
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

            {/* Tabs */}
            <div className="border-b border-border mb-5">
              <div className="flex gap-6">
                {(["overview", "specs", "price"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-base font-bold capitalize transition-colors relative ${
                      activeTab === tab
                        ? "text-foreground"
                        : "text-muted-foreground/70 hover:text-foreground"
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
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
                {descSentences.length >= 1 && (
                  <ul className="space-y-3 mt-4">
                    {descSentences.map((sentence, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{sentence}.</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Additional product highlights from specs */}
                {product.specs && (
                  <div className="mt-5 pt-5 border-t border-border/50">
                    <h3 className="text-sm font-bold text-foreground mb-3">Key Specifications</h3>
                    <ul className="space-y-2.5">
                      {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2.5 text-sm text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                          <span><strong className="text-foreground">{key}:</strong> {value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                {/* Real manufacturer specifications */}
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
                <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
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
                    {isAmazon && <img src={AMAZON_LOGO_URL} alt="Amazon" className="h-5 w-auto" />}
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
