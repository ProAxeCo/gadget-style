/*
 * GADGET STYLE — Header Component
 * GadgetFlow-inspired two-row navigation:
 *   Row 1: Logo + pill-shaped nav items (Discover, Trending, Blog, About) + Search
 *   Row 2: Scrollable category links with colored dots
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { categories } from "@/lib/data";
import {
  Search,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
  TrendingUp,
  BookOpen,
  Info,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_DARK = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/gadgetstyle_electric_blue_dark_d95dfc14.png";
const LOGO_LIGHT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/gadgetstyle_electric_blue_white_fb90c8c3.png";

/* Dot colors for each category — warm palette */
const CATEGORY_COLORS = [
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-rose-500",
];

/* Primary nav items with icons — pill-shaped like GF */
const primaryNav = [
  { label: "Discover", href: "/", icon: Compass },
  { label: "Trending", href: "/category/smart-home", icon: TrendingUp },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

export default function Header() {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const handleToggleTheme = () => toggleTheme?.();
  const { wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  /* Check scroll state of category row */
  useEffect(() => {
    const el = categoryRowRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollCategories = (dir: "left" | "right") => {
    categoryRowRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <ScrollProgress />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/10"
            : "bg-background/80 backdrop-blur-md"
        }`}
      >
        {/* ═══ ROW 1: Logo + Pill Nav + Search ═══ */}
        <div className="border-b border-border/50">
          <div className="container">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo — large like GF */}
              <Link href="/" className="shrink-0">
                <img
                  src={theme === "dark" ? LOGO_DARK : LOGO_LIGHT}
                  alt="Gadget Style"
                  className="h-10 sm:h-14 lg:h-16 w-auto object-contain"
                />
              </Link>

              {/* Desktop: Pill-shaped nav items */}
              <nav className="hidden lg:flex items-center gap-2">
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/"
                    ? location === "/"
                    : location.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-white/5 text-foreground hover:bg-white/10 hover:shadow-sm"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Right actions: Search, Wishlist, Theme, Mobile menu */}
              <div className="flex items-center gap-1">
                {/* Search pill */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Search</span>
                </button>

                {/* Mobile search icon */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="lg:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-primary text-primary" : ""}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleToggleTheme}
                  className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: Category links with colored dots ═══ */}
        <div className="hidden lg:block relative">
          <div className="container">
            <div className="relative flex items-center">
              {/* Left scroll arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollCategories("left")}
                  className="absolute left-0 z-10 p-1 rounded-full bg-background/90 shadow-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Scrollable category row */}
              <div
                ref={categoryRowRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5 px-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((cat, i) => {
                  const isActive = location === `/category/${cat.slug}`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 shrink-0 ${
                        isActive
                          ? "bg-white/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                      {cat.name}
                    </Link>
                  );
                })}
              </div>

              {/* Right scroll arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollCategories("right")}
                  className="absolute right-0 z-10 p-1 rounded-full bg-background/90 shadow-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="container py-4">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gadgets, categories, articles..."
                    className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ESC
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="container py-4 space-y-1">
                {/* Primary nav */}
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/"
                    ? location === "/"
                    : location.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 text-base font-bold rounded-lg hover:bg-white/5 ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="border-t border-border/50 my-2" />

                {/* Category links */}
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Categories</p>
                {categories.map((cat, i) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-white/5 ${
                      location === `/category/${cat.slug}` ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5">
      <div
        className="h-full scroll-progress transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
