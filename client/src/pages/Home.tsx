/**
 * GADGET STYLE — Editorial Feed Homepage
 * Design: Corporate blue (#1060A8), LIGHT background, Instrument Serif headings, editorial rhythm.
 * Hero: Split layout — text on light bg (left), product image (right). No dark overlays.
 * Sections: Pick of the Day → Explore Categories → Trending Strip → Editorial Feed → New Arrivals → Blog → Newsletter
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, TrendingUp, Star, ChevronLeft, ChevronRight, Clock, Tag, Mail, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import {
  categories,
  products,
  getFeaturedProducts,
  getTrendingProducts,
  getNewProducts,
  blogPosts,
} from "@/lib/data";

/* ── Asset URLs ── */
const NEWSLETTER_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/editorial_newsletter_bg-WorJPKjPiyTrP3RJRZfJDZ.webp";

/* ── Fade-in wrapper ── */
function FadeSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section heading ── */
function SectionHeading({ label, title, action, href }: { label: string; title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-8 lg:mb-10">
      <div>
        <span className="text-primary font-mono text-xs tracking-widest uppercase block mb-2">{label}</span>
        <h2 className="text-3xl lg:text-4xl font-display text-foreground">{title}</h2>
      </div>
      {action && href && (
        <Link href={href} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {action} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const featured = getFeaturedProducts();
  const trending = getTrendingProducts();
  const newArrivals = getNewProducts(12);

  /* Pick of the Day — rotate through featured products */
  const [pickIndex, setPickIndex] = useState(0);
  const pick = featured[pickIndex] || featured[0];

  /* Category carousel */
  const catScrollRef = useRef<HTMLDivElement>(null);
  const scrollCat = (dir: number) => {
    catScrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ════════════════════════════════════════════
          SECTION 1 — PICK OF THE DAY (Light Split Hero)
          ════════════════════════════════════════════ */}
      <section className="relative bg-background overflow-hidden mt-32 lg:mt-40">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] py-12 lg:py-0">
            {/* Left — Text content on light background */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-widest uppercase mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Pick of the Day
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display leading-[1.1] mb-4 text-foreground">
                {pick.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-3 max-w-lg leading-relaxed line-clamp-3">
                {pick.description}
              </p>

              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-2xl text-primary font-semibold">${pick.price}</span>
                <span className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  {pick.rating}
                </span>
                <span className="text-muted-foreground text-sm font-mono">{pick.category}</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/product/${pick.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Explore Product <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setPickIndex((i) => (i + 1) % Math.min(featured.length, 5))}
                  className="px-4 py-3 border border-border text-muted-foreground rounded-lg hover:bg-secondary hover:text-foreground transition-colors text-sm"
                >
                  Next Pick
                </button>
              </div>

              {/* Pick dots */}
              <div className="flex gap-2 mt-8">
                {featured.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPickIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === pickIndex ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground/40"}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Right — Product image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-secondary/50">
                <img
                  src={pick.images[0] || pick.image}
                  alt={pick.title}
                  className="w-full h-full object-cover"
                />
                {/* Subtle brand tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — EXPLORE CATEGORIES (Light Cards)
          ════════════════════════════════════════════ */}
      <section className="py-12 lg:py-16 border-t border-border/50 bg-secondary/30">
        <div className="container">
          <div className="flex items-end justify-between mb-8 lg:mb-10">
            <div>
              <span className="text-primary font-mono text-xs tracking-widest uppercase block mb-2">Browse</span>
              <h2 className="text-3xl lg:text-4xl font-display text-foreground">Explore Categories</h2>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollCat(-1)}
                className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCat(1)}
                className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={catScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                <div className="group snap-start flex-shrink-0 w-[280px] lg:w-[300px] rounded-2xl overflow-hidden relative bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-display text-foreground mb-0.5 group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-muted-foreground text-sm">{cat.productCount} products</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/category/smart-home">
              <div className="snap-start flex-shrink-0 w-[280px] lg:w-[300px] rounded-2xl overflow-hidden bg-primary/5 border border-primary/20 flex items-center justify-center aspect-[4/3] hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="text-center p-6">
                  <ArrowRight className="w-8 h-8 text-primary mx-auto mb-3" />
                  <span className="text-primary font-medium">View All</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — NOW TRENDING (Numbered Strip)
          ════════════════════════════════════════════ */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container">
          <SectionHeading label="Trending" title="Now Trending" action="View All" href="/category/smart-home" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {trending.slice(0, 5).map((product, i) => (
              <FadeSection key={product.id} delay={i * 0.08}>
                <Link href={`/product/${product.slug}`}>
                  <div className="group relative flex lg:flex-col items-center lg:items-start gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                    {/* Rank number */}
                    <span className="absolute top-2 left-3 font-mono text-4xl font-bold text-primary/15 group-hover:text-primary/30 transition-colors leading-none">
                      {i + 1}
                    </span>

                    {/* Product image */}
                    <div className="w-20 h-20 lg:w-full lg:h-36 rounded-lg overflow-hidden flex-shrink-0 mt-4 lg:mt-6 bg-secondary/30">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono text-sm text-primary">${product.price}</span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — EDITOR'S PICKS (Alternating Editorial Feed)
          ════════════════════════════════════════════ */}
      <section className="py-12 lg:py-16 bg-secondary/20">
        <div className="container">
          <SectionHeading label="Curated" title="Editor's Picks" />

          <div className="space-y-12 lg:space-y-16">
            {featured.slice(0, 6).map((product, i) => (
              <FadeSection key={product.id}>
                <Link href={`/product/${product.slug}`}>
                  <article
                    className={`group grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center ${
                      i % 2 === 1 ? "lg:direction-rtl" : ""
                    }`}
                  >
                    {/* Image side */}
                    <div className={`relative overflow-hidden rounded-2xl aspect-[4/3] bg-secondary/30 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                      <img
                        src={product.images[0] || product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    </div>

                    {/* Text side */}
                    <div className={`py-2 ${i % 2 === 1 ? "lg:order-1 lg:text-right" : ""}`} style={{ direction: "ltr" }}>
                      <div className={`flex items-center gap-2 mb-3 ${i % 2 === 1 ? "lg:justify-end" : ""}`}>
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-mono text-primary tracking-wider uppercase">{product.category}</span>
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-display text-foreground mb-3 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {product.description}
                      </p>

                      <div className={`flex items-center gap-4 mb-5 ${i % 2 === 1 ? "lg:justify-end" : ""}`}>
                        <span className="font-mono text-xl text-primary font-semibold">${product.price}</span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          {product.rating}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all`}>
                        View Product <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Editorial divider */}
                {i < 5 && <div className="editorial-divider mt-12 lg:mt-16" />}
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — NEW ARRIVALS (Grid)
          ════════════════════════════════════════════ */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container">
          <SectionHeading label="Fresh" title="New Arrivals" action="See All" href="/category/smart-home" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {newArrivals.slice(0, 8).map((product, i) => (
              <FadeSection key={product.id} delay={i * 0.05}>
                <ProductCard product={product} />
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6 — FROM THE BLOG
          ════════════════════════════════════════════ */}
      <section className="py-12 lg:py-16 bg-secondary/20">
        <div className="container">
          <SectionHeading label="Read" title="From the Blog" action="All Articles" href="/blog" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post, i) => (
              <FadeSection key={post.id} delay={i * 0.1}>
                <Link href={`/blog/${post.slug}`}>
                  <article className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                        <span>{post.date}</span>
                      </div>
                      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  </article>
                </Link>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7 — NEWSLETTER CTA
          ════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 relative overflow-hidden bg-primary/5">
        <div className="absolute inset-0">
          <img src={NEWSLETTER_BG} alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <FadeSection>
            <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-3">
              Stay in the Loop
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Get our weekly roundup of the best new gadgets, exclusive deals, and editor's picks delivered straight to your inbox.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </FadeSection>
        </div>
      </section>
    </div>
  );
}
