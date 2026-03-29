/*
 * GADGET STYLE — Footer Component
 * Lumina Design: Clean editorial footer with newsletter signup
 */
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { categories } from "@/lib/data";
import { Mail, ArrowRight } from "lucide-react";

const LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/gadgetstyle_electric_blue_dark_d95dfc14.png";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Thanks for subscribing! Check your inbox for confirmation.");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card/50">
      {/* Newsletter section */}
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            <Mail className="w-3.5 h-3.5" />
            Newsletter
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold font-display mb-3">
            Stay Ahead of the Curve
          </h3>
          <p className="text-muted-foreground mb-6">
            Get weekly curated picks, exclusive deals, and early access to our latest reviews delivered straight to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors"
              required
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <img src={LOGO} alt="Gadget Style" className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curated tech discoveries for the modern lifestyle. We find the best gadgets so you don't have to.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); toast.info("Feature coming soon"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" onClick={(e) => { e.preventDefault(); toast.info("Feature coming soon"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); toast.info("Feature coming soon"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); toast.info("Feature coming soon"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Affiliate Disclosure</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); toast.info("Feature coming soon"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Gadget Style. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            As an affiliate, we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
