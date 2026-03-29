/*
 * GADGET STYLE — Blog Post Page
 * Lumina Design: Editorial long-form reading experience
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { getBlogPostBySlug, blogPosts } from "@/lib/data";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug || "");

  if (!post) {
    return (
      <div className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-bold font-display mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
        <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container -mt-24 relative z-10 pb-16">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-3">
            {post.tags[0] || "Tech"}
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold font-display mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{post.author.charAt(0)}</div>
              <div>
                <p className="text-sm font-medium">{post.author}</p>
                <p className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </div>
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Article content */}
          <div className="prose prose-invert prose-sm max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This is a preview of the full article. In the complete version, you'll find detailed analysis, comparison tables, and our expert recommendations based on months of hands-on testing. We evaluate each product across multiple criteria including build quality, performance, value for money, and long-term reliability.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our editorial team tests every product we recommend. We don't accept paid placements or let advertisers influence our reviews. When you buy through our affiliate links, we may earn a commission at no extra cost to you — this helps us keep producing independent, trustworthy content.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </motion.article>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="max-w-3xl mx-auto pt-8 border-t border-border">
            <h3 className="text-lg font-bold font-display mb-6">More Articles</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group glass-card overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{p.readTime} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
