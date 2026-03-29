/*
 * GADGET STYLE — Static Product Data Store
 * All product data is stored here for the static frontend.
 * In production, this would be replaced with API calls.
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  affiliateUrl: string;
  retailer: string;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  publishedAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorAvatar: string;
  category: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
}

export const categories: Category[] = [
  {
    slug: "smart-home",
    name: "Smart Home",
    description: "Transform your living space with intelligent devices that learn, adapt, and simplify your daily routines.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/hero_smart_home-RfmkdLXywD8KoFaev5zAso.webp",
    icon: "Home",
    productCount: 24,
  },
  {
    slug: "audio",
    name: "Audio",
    description: "Premium headphones, speakers, and sound systems for audiophiles and casual listeners alike.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/category_audio-dEGY2B8QZKFrWfJjSMPbuG.webp",
    icon: "Headphones",
    productCount: 18,
  },
  {
    slug: "gaming",
    name: "Gaming",
    description: "Level up your setup with cutting-edge peripherals, consoles, and accessories.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/hero_gaming-i9FdACatxgkLyKVuajHWYK.webp",
    icon: "Gamepad2",
    productCount: 21,
  },
  {
    slug: "outdoor-tech",
    name: "Outdoor Tech",
    description: "Rugged, portable, and adventure-ready gear for the tech-savvy explorer.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/hero_outdoor-3Vx67gXigRba6dgCcij6vQ.webp",
    icon: "Mountain",
    productCount: 15,
  },
  {
    slug: "wearables",
    name: "Wearables",
    description: "Smartwatches, fitness trackers, and wearable tech that keeps you connected on the move.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    icon: "Watch",
    productCount: 12,
  },
  {
    slug: "mobile-accessories",
    name: "Mobile Accessories",
    description: "Cases, chargers, mounts, and essential add-ons for your smartphone lifestyle.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    icon: "Smartphone",
    productCount: 30,
  },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "sony-wh-1000xm5",
    title: "Sony WH-1000XM5",
    subtitle: "Industry-Leading Noise Cancelling Headphones",
    description: "The Sony WH-1000XM5 headphones rewrite the rules for noise cancellation with two processors controlling eight microphones. Auto NC Optimizer automatically adjusts to your environment, while the redesigned 30mm driver delivers exceptional sound quality. With 30-hour battery life and multipoint connection, these are the ultimate everyday headphones.",
    price: 348,
    originalPrice: 400,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    ],
    category: "Audio",
    categorySlug: "audio",
    tags: ["headphones", "noise-cancelling", "wireless", "premium"],
    rating: 4.8,
    reviewCount: 2847,
    affiliateUrl: "https://www.amazon.com/dp/B0BX2L8PBT",
    retailer: "Amazon",
    isFeatured: true,
    isNew: false,
    isTrending: true,
    specs: {
      "Driver Size": "30mm",
      "Battery Life": "30 hours",
      "Noise Cancelling": "Adaptive ANC",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.2",
      "Codec Support": "LDAC, AAC, SBC",
    },
    pros: ["Best-in-class noise cancellation", "Exceptional comfort for long sessions", "30-hour battery life", "Multipoint connection"],
    cons: ["Premium price point", "No aptX support", "Touch controls can be finicky"],
    publishedAt: "2024-12-15",
  },
  {
    id: "2",
    slug: "apple-watch-ultra-2",
    title: "Apple Watch Ultra 2",
    subtitle: "The Most Capable Apple Watch Ever",
    description: "Built for endurance, exploration, and adventure, the Apple Watch Ultra 2 features a 49mm titanium case, the brightest Apple display ever at 3000 nits, and precision dual-frequency GPS. With up to 36 hours of battery life and water resistance to 100m, it's the ultimate tool watch for the modern explorer.",
    price: 799,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80",
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80",
    ],
    category: "Wearables",
    categorySlug: "wearables",
    tags: ["smartwatch", "fitness", "apple", "premium"],
    rating: 4.7,
    reviewCount: 1923,
    affiliateUrl: "https://www.amazon.com/dp/B0CHX4JGWL",
    retailer: "Amazon",
    isFeatured: true,
    isNew: true,
    isTrending: true,
    specs: {
      "Display": "49mm OLED, 3000 nits",
      "Battery Life": "36 hours",
      "Water Resistance": "100m / EN13319",
      "Case Material": "Titanium",
      "GPS": "Precision Dual-Frequency",
      "Chip": "S9 SiP",
    },
    pros: ["Incredible display brightness", "Titanium build quality", "Precision GPS", "Action button customization"],
    cons: ["Very expensive", "Large for smaller wrists", "iOS only"],
    publishedAt: "2024-11-20",
  },
  {
    id: "3",
    slug: "steam-deck-oled",
    title: "Steam Deck OLED",
    subtitle: "PC Gaming, Untethered",
    description: "The Steam Deck OLED brings your entire Steam library to a stunning 7.4-inch HDR OLED display with 1000 nits peak brightness. With improved battery life, faster Wi-Fi 6E, and the same powerful AMD APU, it's the definitive way to play PC games on the go.",
    price: 549,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1640955014216-75201056c829?w=800&q=80",
    ],
    category: "Gaming",
    categorySlug: "gaming",
    tags: ["gaming", "portable", "steam", "oled"],
    rating: 4.9,
    reviewCount: 3421,
    affiliateUrl: "https://store.steampowered.com/steamdeck",
    retailer: "Steam",
    isFeatured: true,
    isNew: true,
    isTrending: true,
    specs: {
      "Display": "7.4\" HDR OLED, 1000 nits",
      "Processor": "AMD APU (Zen 2 + RDNA 2)",
      "RAM": "16GB LPDDR5",
      "Storage": "512GB / 1TB NVMe",
      "Battery": "50Wh",
      "Weight": "640g",
    },
    pros: ["Stunning OLED display", "Massive game library", "Excellent ergonomics", "Active modding community"],
    cons: ["Heavy for handheld", "Fan noise under load", "Limited to 800p native"],
    publishedAt: "2024-12-01",
  },
  {
    id: "4",
    slug: "philips-hue-starter-kit",
    title: "Philips Hue Starter Kit",
    subtitle: "Smart Lighting That Sets the Mood",
    description: "Transform any room with the Philips Hue ecosystem. This starter kit includes the Hue Bridge and four A19 color-capable bulbs that produce 16 million colors. Control via app, voice assistants, or automation routines. The gold standard in smart lighting.",
    price: 179,
    originalPrice: 200,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1557318232-adbe335b4ef5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1557318232-adbe335b4ef5?w=800&q=80",
    ],
    category: "Smart Home",
    categorySlug: "smart-home",
    tags: ["smart-home", "lighting", "philips", "automation"],
    rating: 4.6,
    reviewCount: 5621,
    affiliateUrl: "https://www.amazon.com/dp/B096YFWVVS",
    retailer: "Amazon",
    isFeatured: false,
    isNew: false,
    isTrending: true,
    specs: {
      "Bulb Type": "A19 E26",
      "Colors": "16 million",
      "Lumens": "800 per bulb",
      "Hub Required": "Yes (included)",
      "Voice Control": "Alexa, Google, Siri",
      "Protocol": "Zigbee",
    },
    pros: ["Unmatched ecosystem", "Reliable and responsive", "Excellent app", "Works with everything"],
    cons: ["Expensive per bulb", "Requires Hue Bridge", "Zigbee range limitations"],
    publishedAt: "2024-10-15",
  },
  {
    id: "5",
    slug: "anker-powercore-24k",
    title: "Anker PowerCore 24K",
    subtitle: "Massive Capacity, Pocket-Sized Power",
    description: "The Anker PowerCore 24K packs 24,000mAh into a surprisingly compact form factor. With 140W USB-C output, it can fast-charge laptops, tablets, and phones simultaneously. The smart digital display shows remaining capacity and charging speed in real-time.",
    price: 89,
    originalPrice: 110,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
    ],
    category: "Mobile Accessories",
    categorySlug: "mobile-accessories",
    tags: ["power-bank", "charger", "portable", "usb-c"],
    rating: 4.7,
    reviewCount: 8234,
    affiliateUrl: "https://www.amazon.com/dp/B0BYP4Y1N6",
    retailer: "Amazon",
    isFeatured: false,
    isNew: false,
    isTrending: false,
    specs: {
      "Capacity": "24,000mAh",
      "Output": "140W USB-C",
      "Ports": "2x USB-C, 1x USB-A",
      "Weight": "500g",
      "Display": "LED digital",
      "Charging Time": "~1.5 hours",
    },
    pros: ["Massive capacity", "140W laptop charging", "Compact design", "Real-time display"],
    cons: ["Heavy for pocket carry", "No wireless charging", "Only one high-power port"],
    publishedAt: "2024-11-05",
  },
  {
    id: "6",
    slug: "goal-zero-yeti-500x",
    title: "Goal Zero Yeti 500X",
    subtitle: "Portable Power Station for Off-Grid Adventures",
    description: "The Goal Zero Yeti 500X is a lithium portable power station with 505Wh capacity. Power laptops, cameras, drones, and small appliances anywhere. Chain with Goal Zero solar panels for unlimited off-grid energy. MPPT charge controller maximizes solar input efficiency.",
    price: 449,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    ],
    category: "Outdoor Tech",
    categorySlug: "outdoor-tech",
    tags: ["power-station", "solar", "outdoor", "camping"],
    rating: 4.5,
    reviewCount: 1245,
    affiliateUrl: "https://www.amazon.com/dp/B083GFKL4R",
    retailer: "Amazon",
    isFeatured: false,
    isNew: false,
    isTrending: false,
    specs: {
      "Capacity": "505Wh",
      "AC Output": "300W (600W surge)",
      "Ports": "2x AC, 2x USB-C, 2x USB-A, 12V",
      "Weight": "5.4kg",
      "Solar Input": "120W max",
      "Charge Controller": "MPPT",
    },
    pros: ["Reliable build quality", "Solar chainable", "Multiple output types", "MPPT controller"],
    cons: ["Heavy for backpacking", "Limited AC output", "Slow wall charging"],
    publishedAt: "2024-09-20",
  },
  {
    id: "7",
    slug: "razer-blackwidow-v4",
    title: "Razer BlackWidow V4 Pro",
    subtitle: "The Flagship Mechanical Gaming Keyboard",
    description: "The Razer BlackWidow V4 Pro features Razer's Green mechanical switches, a command dial, and per-key RGB with underglow. The magnetic wrist rest and dedicated media controls make it as comfortable as it is functional. Doubleshot PBT keycaps ensure long-lasting legends.",
    price: 229,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    ],
    category: "Gaming",
    categorySlug: "gaming",
    tags: ["keyboard", "mechanical", "gaming", "rgb"],
    rating: 4.6,
    reviewCount: 2156,
    affiliateUrl: "https://www.amazon.com/dp/B0CJ5J7K1D",
    retailer: "Amazon",
    isFeatured: false,
    isNew: true,
    isTrending: false,
    specs: {
      "Switch": "Razer Green Mechanical",
      "Keycaps": "Doubleshot PBT",
      "Backlight": "Per-key RGB + Underglow",
      "Connection": "USB-C (detachable)",
      "Wrist Rest": "Magnetic leatherette",
      "Media": "Command dial + keys",
    },
    pros: ["Premium build quality", "Excellent typing feel", "Command dial is useful", "Magnetic wrist rest"],
    cons: ["Very expensive", "Large footprint", "Wired only"],
    publishedAt: "2024-12-10",
  },
  {
    id: "8",
    slug: "amazon-echo-show-15",
    title: "Amazon Echo Show 15",
    subtitle: "Your Smart Home Command Center",
    description: "The Echo Show 15 features a 15.6-inch Full HD display that can be mounted on the wall or placed on a stand. Use it as a digital photo frame, family calendar, smart home dashboard, or entertainment hub. With Fire TV built-in, stream your favorite shows hands-free.",
    price: 249,
    originalPrice: 280,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80",
    ],
    category: "Smart Home",
    categorySlug: "smart-home",
    tags: ["smart-display", "alexa", "smart-home", "entertainment"],
    rating: 4.4,
    reviewCount: 3892,
    affiliateUrl: "https://www.amazon.com/dp/B0BFZVFG6N",
    retailer: "Amazon",
    isFeatured: false,
    isNew: false,
    isTrending: false,
    specs: {
      "Display": "15.6\" Full HD",
      "Processor": "AZ2 Neural Edge",
      "Camera": "5MP with shutter",
      "Audio": "Dual speakers",
      "Mount": "Wall or stand",
      "Smart Home": "Zigbee + Matter",
    },
    pros: ["Large beautiful display", "Fire TV built-in", "Widget customization", "Wall mountable"],
    cons: ["Alexa ecosystem lock-in", "Camera quality average", "No battery option"],
    publishedAt: "2024-10-30",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "best-noise-cancelling-headphones-2025",
    title: "The 7 Best Noise-Cancelling Headphones in 2025",
    excerpt: "We tested every major ANC headphone on the market. Here are the ones actually worth your money.",
    content: "After months of testing in offices, planes, and coffee shops, we've narrowed down the best noise-cancelling headphones you can buy right now...",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    author: "Alex Chen",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    category: "Buying Guide",
    readTime: 12,
    publishedAt: "2025-03-15",
    tags: ["headphones", "buying-guide", "audio"],
  },
  {
    id: "2",
    slug: "smart-home-setup-guide-beginners",
    title: "Smart Home Setup Guide: From Zero to Automated",
    excerpt: "Everything you need to know about building a smart home ecosystem that actually works together.",
    content: "Building a smart home doesn't have to be overwhelming. In this comprehensive guide, we'll walk you through every step...",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    author: "Sarah Kim",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    category: "Guide",
    readTime: 18,
    publishedAt: "2025-03-10",
    tags: ["smart-home", "guide", "automation"],
  },
  {
    id: "3",
    slug: "steam-deck-oled-vs-rog-ally-x",
    title: "Steam Deck OLED vs ROG Ally X: The Definitive Comparison",
    excerpt: "Two portable gaming powerhouses go head-to-head. Which one deserves your money?",
    content: "The handheld gaming PC market has exploded, and two devices stand above the rest...",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80",
    author: "Marcus Rivera",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    category: "Comparison",
    readTime: 15,
    publishedAt: "2025-03-05",
    tags: ["gaming", "comparison", "portable"],
  },
  {
    id: "4",
    slug: "best-outdoor-tech-camping-2025",
    title: "Essential Outdoor Tech for Your Next Camping Trip",
    excerpt: "Solar panels, power stations, and gadgets that make roughing it a lot more comfortable.",
    content: "Whether you're a weekend warrior or a seasoned backcountry explorer, the right tech can transform your outdoor experience...",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    author: "Jordan Lee",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    category: "Buying Guide",
    readTime: 10,
    publishedAt: "2025-02-28",
    tags: ["outdoor", "camping", "solar", "buying-guide"],
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getTrendingProducts(): Product[] {
  return products.filter((p) => p.isTrending);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.toLowerCase().includes(q)
  );
}
