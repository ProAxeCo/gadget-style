/*
 * GADGET STYLE — Wishlist Page
 * Lumina Design: Saved products grid
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function WishlistPage() {
  useDocumentTitle("My Wishlist");
  const { wishlist } = useWishlist();
  // Exclude drafts — a product demoted to draft after being wishlisted
  // would otherwise render with placeholder data.
  const savedProducts = products.filter(
    (p) => !p.isDraft && wishlist.includes(p.id)
  );

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Your Wishlist
          </h1>
          <p className="text-muted-foreground">
            {savedProducts.length > 0
              ? `${savedProducts.length} saved product${savedProducts.length > 1 ? "s" : ""}`
              : "No products saved yet"}
          </p>
        </motion.div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 lg:gap-6">
            {savedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start browsing and save products you love by clicking the heart icon.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Discover Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
