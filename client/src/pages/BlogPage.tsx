/*
 * GADGET STYLE — Blog Page
 * Lumina Design: Magazine-style article grid
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { blogPosts } from "@/lib/data";
import { Clock, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [hero, ...rest] = blogPosts;

  return (
    <div className="pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">The Gadget Style Blog</h1>
          <p className="text-muted-foreground">Reviews, buying guides, and tech insights from our editorial team.</p>
        </motion.div>

        {/* Hero article */}
        {hero && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link href={`/blog/${hero.slug}`} className="group block glass-card overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                  <img
                    src={hero.image}
                    alt={hero.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                    {hero.tags[0] || "Tech"}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-bold font-display mb-3 group-hover:text-primary transition-colors">
                    {hero.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{hero.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[8px]">{hero.author.charAt(0)}</div>
                      <span>{hero.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{hero.readTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Article grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block glass-card overflow-hidden h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-bold rounded uppercase">
                      {post.tags[0] || "Tech"}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime} min
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
