import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import { WishlistProvider } from "@/contexts/WishlistContext";

/**
 * Scrolls to the top of the page on every route change. wouter (unlike
 * react-router-dom) does not do this automatically, which means clicking
 * a link from the bottom of a long page lands you at the bottom of the
 * next page. This component fixes that for every route in one place.
 */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    // `instant` so hash-link anchors that wouter handles still feel snappy.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </WishlistProvider>
  );
}
