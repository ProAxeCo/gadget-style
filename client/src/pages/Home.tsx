/*
 * GADGET STYLE — Home Page
 * Lumina Design: Cinematic hero, editorial grid, magazine-style sections
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories, getFeaturedProducts, getTrendingProducts, blogPosts } from "@/lib/data";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/hero_main-FV825JvAj48TkMdFxzzR6Y.webp";

export default function Home() {
  const featured = getFeaturedProducts();
  const trending = getTrendingProducts();

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Premium tech gadgets"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Tech Discoveries
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1] mb-5 text-white">
              Discover Gadgets
              <br />
              <span className="text-primary">Worth Owning</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              We curate the most innovative tech products, gear, and gadgets — so you can spend less time searching and more time enjoying.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/category/smart-home"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/15 transition-colors backdrop-blur-sm border border-white/10"
              >
                Read Reviews
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES STRIP ===== */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-display">Browse Categories</h2>
              <p className="text-sm text-muted-foreground mt-1">Find exactly what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="group block relative aspect-[3/4] rounded-xl overflow-hidden"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-bold text-white mb-0.5">{cat.name}</h3>
                    <p className="text-[10px] text-white/60">{cat.productCount} products</p>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCT ===== */}
      <section className="py-16 lg:py-20 bg-card/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
                <Sparkles className="w-3 h-3" />
                Editor's Pick
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-display">Featured Products</h2>
            </div>
            <Link
              href="/category/smart-home"
              className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING PRODUCTS ===== */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold tracking-wider uppercase mb-3">
                <TrendingUp className="w-3 h-3" />
                Hot Right Now
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-display">Trending Gadgets</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== BLOG / EDITORIAL ===== */}
      <section className="py-16 lg:py-20 bg-card/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-display">Latest from the Blog</h2>
              <p className="text-sm text-muted-foreground mt-1">Reviews, guides, and tech insights</p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block glass-card overflow-hidden h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-bold rounded uppercase">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
