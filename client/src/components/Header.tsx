/*
 * GADGET STYLE — Header Component
 * Blue corporate identity, light-mode default.
 * GadgetFlow-inspired two-row navigation:
 *   Row 1: Logo + pill-shaped nav items + Search
 *   Row 2: Scrollable category links with colored dots
 *   Mobile: Full-screen slide-out drawer
 *   Search: Live suggestions dropdown
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { categories, searchProducts } from "@/lib/data";
import type { Product } from "@/lib/data";
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
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* New blue GS logo — concentric ring G with flowing S */
const GS_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/logo_blue_v2-ZhrJEA2VoZxipLuGZMBdr4.png";

/* Dot colors for each category */
const CATEGORY_COLORS = [
  "bg-red-500",
  "bg-blue-500",
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
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const categoryRowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
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
    setSearchQuery("");
    setSearchSuggestions([]);
    setSelectedSuggestion(-1);
  }, [location]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

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

  /* Focus search input when search opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  /* Keyboard shortcut: Cmd/Ctrl + K to open search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Live search suggestions */
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchProducts(searchQuery.trim());
      setSearchSuggestions(results.slice(0, 6));
      setSelectedSuggestion(-1);
    } else {
      setSearchSuggestions([]);
      setSelectedSuggestion(-1);
    }
  }, [searchQuery]);

  const scrollCategories = (dir: "left" | "right") => {
    categoryRowRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setSearchSuggestions([]);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, searchSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedSuggestion >= 0) {
      e.preventDefault();
      const product = searchSuggestions[selectedSuggestion];
      setLocation(`/product/${product.slug}`);
      setSearchOpen(false);
      setSearchQuery("");
      setSearchSuggestions([]);
    }
  };

  const navigateToProduct = (slug: string) => {
    setLocation(`/product/${slug}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  /* Matching categories for search */
  const matchingCategories = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <>
      <ScrollProgress />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5"
            : "bg-background/80 backdrop-blur-md"
        }`}
      >
        {/* ═══ ROW 1: Logo + Pill Nav + Search ═══ */}
        <div className="border-b border-border/50">
          <div className="container">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo — Blue GS concentric ring + wordmark */}
              <Link href="/" className="shrink-0 flex items-center gap-2.5 group">
                <img
                  src={GS_ICON}
                  alt="GS"
                  className="h-9 sm:h-11 lg:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-lg lg:text-xl font-bold tracking-tight text-foreground">
                    GADGET <span className="text-primary">STYLE</span>
                  </span>
                </div>
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
                          : "bg-black/[0.04] dark:bg-white/5 text-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 hover:shadow-sm"
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
                {/* Search pill (desktop) */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/5 text-muted-foreground hover:bg-black/[0.07] dark:hover:bg-white/10 hover:text-foreground transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Search</span>
                  <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/5 text-[10px] text-muted-foreground/60 font-mono">
                    ⌘K
                  </kbd>
                </button>

                {/* Mobile search icon */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="lg:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                <Link
                  href="/wishlist"
                  className="relative p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
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
                  className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Mobile hamburger button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: Category links with colored dots (desktop only) ═══ */}
        <div className="hidden lg:block relative">
          <div className="container">
            <div className="relative flex items-center">
              {canScrollLeft && (
                <button
                  onClick={() => scrollCategories("left")}
                  className="absolute left-0 z-10 p-1 rounded-full bg-background/90 shadow-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

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
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                      {cat.name}
                    </Link>
                  );
                })}
              </div>

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

        {/* ═══ SEARCH OVERLAY with live suggestions ═══ */}
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
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search gadgets, categories, articles..."
                    className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSearchSuggestions([]); }}
                      className="p-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-black/[0.04] dark:bg-white/5"
                  >
                    ESC
                  </button>
                </form>

                {/* Live search suggestions */}
                {(searchSuggestions.length > 0 || matchingCategories.length > 0) && (
                  <div className="mt-3 border-t border-border/50 pt-3">
                    {/* Category matches */}
                    {matchingCategories.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {matchingCategories.map((cat, i) => (
                            <Link
                              key={cat.slug}
                              href={`/category/${cat.slug}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.07] dark:hover:bg-white/10 text-sm font-medium transition-colors"
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            >
                              <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[categories.indexOf(cat) % CATEGORY_COLORS.length]}`} />
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">Products</p>
                        <div className="space-y-1">
                          {searchSuggestions.map((product, i) => (
                            <button
                              key={product.id}
                              onClick={() => navigateToProduct(product.slug)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                selectedSuggestion === i
                                  ? "bg-primary/10 text-foreground"
                                  : "hover:bg-black/[0.04] dark:hover:bg-white/5 text-foreground"
                              }`}
                            >
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-10 h-10 rounded-md object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{product.title}</p>
                                <p className="text-xs text-muted-foreground">{product.category} · ${product.price}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                            </button>
                          ))}
                        </div>
                        {searchQuery.trim().length >= 2 && (
                          <button
                            onClick={handleSearch as any}
                            className="w-full mt-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors text-center"
                          >
                            View all results for "{searchQuery}" →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══ MOBILE SLIDE-OUT DRAWER ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel — slides in from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-[85vw] max-w-sm bg-background border-l border-border shadow-2xl lg:hidden overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <img src={GS_ICON} alt="GS" className="h-8 w-auto" />
                  <span className="text-base font-bold tracking-tight text-foreground">
                    GADGET <span className="text-primary">STYLE</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile search bar */}
              <div className="px-5 py-3 border-b border-border/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = (mobileSearchInputRef.current?.value || "").trim();
                    if (q) {
                      setLocation(`/search?q=${encodeURIComponent(q)}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-border/30"
                >
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Search gadgets..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </form>
              </div>

              {/* Primary navigation */}
              <div className="px-3 py-4">
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">Navigation</p>
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/"
                    ? location === "/"
                    : location.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 text-base font-bold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-black/[0.04] dark:bg-white/5"}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      {item.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-border/30" />

              {/* Categories */}
              <div className="px-3 py-4">
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">Categories</p>
                {categories.map((cat, i) => {
                  const isActive = location === `/category/${cat.slug}`;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                      {cat.name}
                      <span className="ml-auto text-xs text-muted-foreground/40">{cat.productCount}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-border/30" />

              {/* Wishlist + Theme toggle */}
              <div className="px-3 py-4 space-y-1">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-3 py-3 text-base font-bold rounded-xl text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/5">
                    <Heart className={`w-4.5 h-4.5 ${wishlistCount > 0 ? "fill-primary text-primary" : ""}`} />
                  </div>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => { handleToggleTheme(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-bold rounded-xl text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/5">
                    {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                  </div>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Bottom branding */}
              <div className="px-5 py-6 mt-auto">
                <p className="text-xs text-muted-foreground/40 text-center">
                  &copy; {new Date().getFullYear()} Gadget Style
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
