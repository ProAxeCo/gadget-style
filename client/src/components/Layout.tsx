import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { WishlistProvider } from "@/contexts/WishlistContext";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </WishlistProvider>
  );
}
