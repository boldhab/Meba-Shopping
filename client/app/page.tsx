"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";
import { getActiveDeals, type DealType, type Product } from "@/lib/api/products";
import {
  Truck,
  ShieldCheck,
  Smartphone,
  Headphones,
  ArrowRight,
  Flame,
  Calendar,
  Tag,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
} from "lucide-react";

const CATEGORY_SHORTCUTS = [
  { label: "Fresh Fruits & Veggies", slug: "produce", icon: "🍏", badge: "Farm Fresh" },
  { label: "Dairy, Eggs & Cheese", slug: "dairy", icon: "🥛", badge: "Daily" },
  { label: "Bakery & Bread", slug: "bakery", icon: "🥖", badge: "Warm" },
  { label: "Ethiopian Coffee & Tea", slug: "coffee-tea", icon: "☕", badge: "Organic" },
  { label: "Pantry & Spices", slug: "pantry", icon: "🧂", badge: "Essential" },
  { label: "Beverages & Juices", slug: "beverages", icon: "🧃", badge: "Chilled" },
  { label: "Personal Care", slug: "personal-care", icon: "🧴", badge: "Hygiene" },
  { label: "Household & Cleaning", slug: "household", icon: "🧼", badge: "Clean" },
];

const DEAL_TYPE_ORDER: DealType[] = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"];

const DEAL_TYPE_CONFIG: Record<
  DealType,
  { label: string; summary: string; icon: typeof Flame; badgeColor: string; accentColor: string }
> = {
  DAILY: {
    label: "Daily Flash Deals",
    summary: "Time-sensitive flash markdowns refreshed daily for quick shoppers.",
    icon: Flame,
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    accentColor: "from-orange-500 to-amber-500",
  },
  WEEKLY: {
    label: "Weekly Super Savers",
    summary: "Handpicked weekly discounts across staple groceries and pantry favorites.",
    icon: Calendar,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "from-blue-600 to-indigo-600",
  },
  CLEARANCE: {
    label: "Clearance & Overstock",
    summary: "Last-chance inventory clearances with maximum discounts up to 50% off.",
    icon: Tag,
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    accentColor: "from-rose-600 to-pink-600",
  },
  CEREMONY: {
    label: "Holiday & Ceremony Specials",
    summary: "Celebration-ready bundles curated for Ethiopian holidays and family gatherings.",
    icon: Sparkles,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentColor: "from-purple-600 to-violet-600",
  },
};

function groupDeals(products: Product[]) {
  return products.reduce<Record<DealType, Product[]>>(
    (groups, product) => {
      if (product.dealType) {
        groups[product.dealType].push(product);
      }
      return groups;
    },
    {
      DAILY: [],
      WEEKLY: [],
      CLEARANCE: [],
      CEREMONY: [],
    }
  );
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const [dealsResult, setDealsResult] = useState<{ items: Product[] }>({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const result = await getActiveDeals({ limit: "24" });
        setDealsResult(result);
      } finally {
        setLoading(false);
      }
    }
    void fetchDeals();
  }, []);

  const groupedDeals = groupDeals(dealsResult.items);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-linear-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Trust Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Premier Online Supermarket • Addis Ababa</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                Fresh Groceries &amp; Daily Essentials,{" "}
                <span className="bg-linear-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  Delivered Fast.
                </span>
              </motion.h1>

              {/* Sub-text */}
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Experience seamless grocery shopping with authentic farm-fresh produce, imported pantry favorites, and ceremony supplies delivered directly to your doorstep.
              </motion.p>

              {/* Primary Call-to-Actions */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Flame className="w-4 h-4" />
                  <span>Shop Today&apos;s Deals</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Full Catalog</span>
                </Link>
              </motion.div>

              {/* Key Trust Highlights */}
              <motion.div
                variants={fadeInUp}
                className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left text-xs"
              >
                <div>
                  <strong className="block text-xl font-extrabold text-white">100%</strong>
                  <span className="text-slate-400">Authentic Sourcing</span>
                </div>
                <div>
                  <strong className="block text-xl font-extrabold text-white">FREE</strong>
                  <span className="text-slate-400">Over 1,000 ETB</span>
                </div>
                <div>
                  <strong className="block text-xl font-extrabold text-white">Fast</strong>
                  <span className="text-slate-400">Addis Ababa Delivery</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Card / Promo Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl bg-linear-to-br from-white/10 to-white/5 border border-white/15 p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                      ⚡
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">Top Flash Specials</h2>
                      <p className="text-[11px] text-slate-400">Limited-time discounted prices</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    SAVE UP TO 30%
                  </span>
                </div>

                {/* Micro Promo Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center text-xl shrink-0">
                        ☕
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Yirgacheffe Roasted Coffee</h3>
                        <p className="text-xs text-slate-400">Organic Arabica • 500g</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-rose-400 line-through block">650 ETB</span>
                      <strong className="text-sm font-extrabold text-white">499 ETB</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-300 flex items-center justify-center text-xl shrink-0">
                        🍯
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Highland Wildflower Honey</h3>
                        <p className="text-xs text-slate-400">Pure Natural • 1 kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-rose-400 line-through block">780 ETB</span>
                      <strong className="text-sm font-extrabold text-white">599 ETB</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-xl shrink-0">
                        🥑
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Fresh Butter Avocado Pack</h3>
                        <p className="text-xs text-slate-400">Hawassa Farm Fresh • 2 kg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-rose-400 line-through block">320 ETB</span>
                      <strong className="text-sm font-extrabold text-white">249 ETB</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <Link
                    href="/promotions"
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1"
                  >
                    <span>View all discounted flash products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="bg-white border-y border-slate-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Free Doorstep Delivery</h3>
                <p className="text-[11px] text-slate-500">On all orders above 1,000 ETB</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">100% Quality Guarantee</h3>
                <p className="text-[11px] text-slate-500">Fresh items &amp; verified brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Mobile Money Ready</h3>
                <p className="text-[11px] text-slate-500">Telebirr, CBE Birr &amp; Cash</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Dedicated Support</h3>
                <p className="text-[11px] text-slate-500">Live chat &amp; fast customer care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Quick Navigation Bar */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular Supermarket Aisles</h2>
            <p className="text-xs text-slate-500">Jump directly into our fresh categories</p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORY_SHORTCUTS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-orange-400 hover:shadow-md transition-all text-center group cursor-pointer"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                {cat.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{cat.badge}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Active Deals Showcase */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {DEAL_TYPE_ORDER.map((dealType) => {
            const items = groupedDeals[dealType]?.slice(0, 4) ?? [];
            const config = DEAL_TYPE_CONFIG[dealType];
            const Icon = config.icon;

            return (
              <div
                key={dealType}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{config.label}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeColor}`}>
                          Active Deals
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{config.summary}</p>
                    </div>
                  </div>

                  <Link
                    href={`/promotions?type=${dealType}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    <span>View Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Items Grid */}
                <div className="pt-6">
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-semibold text-slate-500">
                        No active items in {config.label.toLowerCase()} right now.
                      </p>
                      <Link
                        href="/products"
                        className="text-xs font-bold text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Explore all available products →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. App & Newsletter Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-300">
              Save More Every Week
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-3">
              Subscribe to Weekly Supermarket Deals
            </h2>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Receive fresh price drops, seasonal organic produce updates, and holiday discounts directly in your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 text-sm outline-none focus:ring-2 focus:ring-orange-400 flex-1 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}