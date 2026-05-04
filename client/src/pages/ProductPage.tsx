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
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/* Amazon logo — uses the actual Amazon "a" + smile PNG for crisp, recognizable branding */
const AMAZON_LOGO_URL = "/images/mirrored/amazon_logo_gf_3247f94d.png";

/**
 * Normalize YouTube/Vimeo URLs to their embeddable form. Handles:
 *   - youtube.com/watch?v=ID  → youtube.com/embed/ID
 *   - youtu.be/ID             → youtube.com/embed/ID
 *   - youtube.com/embed/ID    → passthrough
 *   - vimeo.com/ID            → player.vimeo.com/video/ID
 *   - player.vimeo.com/*      → passthrough
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube watch URL
    if (/youtube\.com$/.test(u.hostname) && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // youtu.be short link
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Already an embed
    if (/youtube\.com$|youtube-nocookie\.com$/.test(u.hostname) && u.pathname.startsWith("/embed/")) {
      return u.toString();
    }
    // Vimeo canonical
    if (u.hostname === "vimeo.com" && /^\/\d+/.test(u.pathname)) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname === "player.vimeo.com") return u.toString();
    return null;
  } catch {
    return null;
  }
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  useDocumentTitle(
    product ? product.title : "Product Not Found",
    product ? `${product.title}. ${product.description.slice(0, 155)}` : undefined,
  );
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "price">("overview");
  const [descExpanded, setDescExpanded] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const collapseDescription = () => {
    setDescExpanded(false);
    // Scroll all the way to the top of the product page. Using rAF defers
    // until after React's re-render so the page height matches the collapsed
    // state and the scroll animation lands correctly.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Scroll to top on product change. Default the main viewer to the first
  // IMAGE (not the first video) so the page is quiet on load — videos still
  // sit at the top of the thumbnail strip for visibility, but autoplay is off.
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(product?.videos?.length ?? 0);
    setActiveTab("overview");
    setDescExpanded(false);
  }, [slug, product?.videos?.length]);

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

  // Determine if affiliate is Amazon — drives UI chrome (Amazon badge, "Buy on Amazon" label).
  // For destination:"external" products, we show a generic buy button instead.
  const effectiveDestination = product.destination ?? "amazon";
  const isAmazon =
    effectiveDestination === "amazon" &&
    (product.affiliateUrl?.includes("amazon") || product.affiliateUrl?.includes("amzn.to"));
  const buyUrl =
    effectiveDestination === "external" && product.externalUrl
      ? product.externalUrl
      : product.affiliateUrl;
  const buyLabel = isAmazon ? "Get it on Amazon" : "Visit Store";

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

          {/* LEFT: Image + Video Gallery (GF-style: thumbnails on the left,
              main viewer on the right). Videos sit at the top of the
              thumbnail strip so they're visually prioritized, and clicking
              one swaps the main viewer to an embedded player. */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              type MediaItem =
                | { kind: "video"; url: string; poster: string }
                | { kind: "image"; url: string };
              const videoItems: MediaItem[] = (product.videos ?? [])
                .map((v) => ({ url: toEmbedUrl(v), original: v }))
                .filter((x): x is { url: string; original: string } => !!x.url)
                .map((x) => ({ kind: "video", url: x.url, poster: images[0] ?? product.image }));
              const imageItems: MediaItem[] = images.map((url) => ({ kind: "image", url }));
              const mediaItems: MediaItem[] = [...videoItems, ...imageItems];
              const active = Math.max(0, Math.min(activeImage, mediaItems.length - 1));
              const current = mediaItems[active];

              const stepBy = (delta: number) => {
                const next = (active + delta + mediaItems.length) % mediaItems.length;
                setActiveImage(next);
              };

              return (
                <div className="grid grid-cols-[76px_1fr] md:grid-cols-[92px_1fr] gap-3">
                  {/* Thumbnail column — videos at the top with play overlay,
                      then images. Scrolls if there are many. */}
                  <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-hide">
                    {mediaItems.map((item, i) => (
                      <button
                        key={`${item.kind}-${i}`}
                        onClick={() => setActiveImage(i)}
                        className={`relative shrink-0 w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          active === i
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border/50 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={item.kind === "video" ? `Video ${i + 1}` : `Image ${i + 1}`}
                      >
                        <img
                          src={item.kind === "video" ? item.poster : item.url}
                          alt=""
                          className="w-full h-full object-cover bg-secondary/30"
                        />
                        {item.kind === "video" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow">
                              <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                            </span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Main viewer — image or iframe */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary/30 border border-border/50">
                    {mediaItems.length > 1 && current?.kind === "image" && (
                      <>
                        <button
                          onClick={() => stepBy(-1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => stepBy(1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                          aria-label="Next"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {current?.kind === "video" ? (
                      <iframe
                        src={current.url}
                        title={`${product.title} — video`}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <img
                        src={current?.url || product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {mediaItems.length > 1 && current?.kind === "image" && (
                      <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {active + 1} / {mediaItems.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

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

            {/* CTA Button — Amazon yellow for Amazon products, green for external brand links */}
            <a
              href={buyUrl}
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
              <div ref={overviewRef} className="space-y-5 scroll-mt-28">
                <h2 className="text-lg font-bold font-display">{product.title}</h2>

                {/* Description — first paragraph is always shown (the hook);
                    remaining paragraphs are gated behind a "…More info" toggle
                    so the initial Overview stays scannable. Pro descriptions
                    are 3-4 paragraphs separated by blank lines. */}
                <div className="prose prose-sm max-w-none">
                  {(() => {
                    const paragraphs = (product.description || "")
                      .split(/\n{2,}/)
                      .map((p) => p.trim())
                      .filter(Boolean);
                    const [firstPara, ...restParas] = paragraphs;
                    const hasMore = restParas.length > 0;
                    return (
                      <>
                        <p className="text-[16px] font-medium leading-relaxed text-foreground">
                          {firstPara}
                          {hasMore && !descExpanded && (
                            <>
                              {" "}
                              <button
                                onClick={() => setDescExpanded(true)}
                                className="text-primary hover:underline font-medium text-[15px]"
                              >
                                …More info
                              </button>
                            </>
                          )}
                        </p>
                        {descExpanded && (
                          <>
                            {restParas.map((para, i) => (
                              <p
                                key={i}
                                className="text-[15px] leading-relaxed text-foreground/85"
                              >
                                {para}
                              </p>
                            ))}
                            <button
                              onClick={collapseDescription}
                              className="text-primary hover:underline font-medium text-[14px]"
                            >
                              ← Show less
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

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
                    href={buyUrl}
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
