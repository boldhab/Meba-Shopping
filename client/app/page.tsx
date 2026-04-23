"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";
import { getActiveDeals, type DealType, type Product } from "@/lib/api/products";
import { useEffect, useState } from "react";

const quickLinks = [
  { href: "/products", label: "Browse products", icon: "🛍️", color: "bg-blue-500" },
  { href: "/cart", label: "Review your cart", icon: "🛒", color: "bg-green-500" },
  { href: "/checkout", label: "Start checkout", icon: "✓", color: "bg-purple-500" },
  { href: "/admin", label: "Open admin dashboard", icon: "⚙️", color: "bg-gray-700" }
];

const DEAL_TYPE_ORDER: DealType[] = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"];

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  DAILY: "Daily Deals",
  WEEKLY: "Weekly Deals",
  CLEARANCE: "Clearance Deals",
  CEREMONY: "Ceremony Deals",
};

const DEAL_TYPE_SUMMARIES: Record<DealType, string> = {
  DAILY: "Fresh daily picks updated for fast-moving shoppers.",
  WEEKLY: "Longer-running offers worth tracking through the week.",
  CLEARANCE: "Last-chance markdowns before inventory runs out.",
  CEREMONY: "Celebration-ready products gathered into one section.",
};

const DEAL_TYPE_ICONS: Record<DealType, string> = {
  DAILY: "🔥",
  WEEKLY: "📅",
  CLEARANCE: "🏷️",
  CEREMONY: "🎉",
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardHover = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const heroTextVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

export default function HomePage() {
  const [dealsResult, setDealsResult] = useState<{ items: Product[] }>({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      const result = await getActiveDeals({ limit: "24" });
      setDealsResult(result);
      setLoading(false);
    }
    fetchDeals();
  }, []);

  const groupedDeals = groupDeals(dealsResult.items);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
      >
        <motion.div 
          className="absolute inset-0 bg-black opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Animated background blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 2 }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div 
            className="text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={heroTextVariants}
              custom={0}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
              <span className="text-white font-semibold">Meba Shopping</span>
            </motion.div>
            
            <motion.h1 
              variants={heroTextVariants}
              custom={1}
              className="text-4xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Your Premier Shopping<br />
              <motion.span 
                className="text-orange-400 inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Experience
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={heroTextVariants}
              custom={2}
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Discover amazing deals, manage your account, and explore our curated collections
              all in one beautifully designed platform.
            </motion.p>
            
            <motion.div 
              variants={heroTextVariants}
              custom={3}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                    <motion.span 
                      className="inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated curved bottom edge */}
        <motion.div 
          className="absolute bottom-0 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Deals Header */}
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎯
              </motion.span>
              Live Deal Sections
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Shop Each Deal Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Preview today's active offers by section, then jump straight into the full promotions view for that category.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/promotions"
              className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              View All Deals
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Deal Sections */}
        <div className="space-y-12">
          {DEAL_TYPE_ORDER.map((dealType, sectionIndex) => {
            const items = groupedDeals[dealType].slice(0, 4);
            const icon = DEAL_TYPE_ICONS[dealType];

            return (
              <motion.div
                key={dealType}
                variants={fadeInUp}
                custom={sectionIndex}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover="hover"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { delay: sectionIndex * 0.1, duration: 0.5 } },
                  hover: { scale: 1.01, transition: { duration: 0.3 } }
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                {/* Section Header */}
                <motion.div 
                  className="p-6 border-b border-gray-100"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <motion.div 
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1.5 rounded-full mb-3"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.span
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {icon}
                        </motion.span>
                        {DEAL_TYPE_LABELS[dealType]}
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {DEAL_TYPE_LABELS[dealType]}
                      </h3>
                      <p className="text-gray-600">
                        {DEAL_TYPE_SUMMARIES[dealType]}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="hidden md:flex items-center gap-2 text-sm text-gray-400"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span>⇀</span>
                        Swipe to explore
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={`/promotions?type=${dealType}`}
                          className="group inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-medium transition-colors"
                        >
                          Open section
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Products Grid */}
                <div className="p-6">
                  {items.length > 0 ? (
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {items.map((product, productIndex) => (
                        <motion.div
                          key={product.id}
                          variants={cardHover}
                          whileHover="hover"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: productIndex * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="text-center py-12 bg-gray-50 rounded-xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className="text-6xl mb-4"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🛍️
                      </motion.div>
                      <p className="font-medium text-gray-500">
                        No active {DEAL_TYPE_LABELS[dealType].toLowerCase()} right now.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check back soon for great offers!
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 mt-20 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Happy Customers", icon: "😊" },
              { number: "500+", label: "Products", icon: "🎁" },
              { number: "50+", label: "Brands", icon: "🏷️" },
              { number: "24/7", label: "Support", icon: "💬" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
                className="text-white"
              >
                <motion.div 
                  className="text-4xl mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div 
                  className="text-3xl font-bold mb-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 bg-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-gray-900 font-bold mb-4">Meba Shopping</h3>
              <p className="text-sm text-gray-600">Your premier shopping destination for amazing deals.</p>
            </motion.div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Products", "Promotions", "Cart"].map((link, index) => (
                  <motion.li 
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/${link.toLowerCase()}`} className="hover:text-blue-600 transition-colors">
                      {link}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Help Center", "Contact Us", "Returns"].map((link, index) => (
                  <motion.li 
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/${link.toLowerCase().replace(" ", "-")}`} className="hover:text-blue-600 transition-colors">
                      {link}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-gray-900 font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {["📘", "📷", "🐦", "💼"].map((icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="text-2xl text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
          <motion.div 
            className="mt-8 pt-8 text-center text-sm text-gray-500 border-t border-gray-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © 2024 Meba Shopping. All rights reserved.
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}