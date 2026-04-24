"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Deals", href: "/promotions" },
    { name: "New Arrivals", href: "/products/new" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Returns", href: "/returns" },
    { name: "Shipping Info", href: "/shipping" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: "📘", href: "https://facebook.com", color: "hover:bg-blue-600" },
  { name: "Instagram", icon: "📷", href: "https://instagram.com", color: "hover:bg-pink-600" },
  { name: "Twitter", icon: "🐦", href: "https://twitter.com", color: "hover:bg-blue-400" },
  { name: "LinkedIn", icon: "💼", href: "https://linkedin.com", color: "hover:bg-blue-700" },
  { name: "YouTube", icon: "📺", href: "https://youtube.com", color: "hover:bg-red-600" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Footer() {
  const pathname = usePathname();

  // Admin footer
  if (pathname?.startsWith("/admin")) {
    return (
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 border-t border-gray-800 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <span className="text-gray-400 text-sm">Meba Admin Workspace</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/products" className="hover:text-gray-300 transition-colors">
                Products
              </Link>
              <Link href="/admin/orders" className="hover:text-gray-300 transition-colors">
                Orders
              </Link>
              <Link href="/admin/users" className="hover:text-gray-300 transition-colors">
                Users
              </Link>
            </div>
            <div className="text-xs text-gray-600">
              © 2024 Meba Shopping. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    );
  }

  // Main site footer
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-white border-t border-gray-200 mt-20"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                ✨
              </motion.span>
              <h3 className="text-xl font-bold text-gray-900">Meba Shopping</h3>
            </motion.div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Your premier shopping destination for amazing deals, quality products, and exceptional service.
            </p>
            <div className="flex gap-2 mb-4">
              {["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"].map((star, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-yellow-400"
                >
                  {star}
                </motion.span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>✓</span>
              <span>Trusted by 10,000+ customers</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={fadeInUp}>
              <h4 className="text-gray-900 font-semibold mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          variants={fadeInUp}
          className="border-t border-gray-200 mt-8 pt-8 pb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-gray-900 font-semibold mb-1">
                Subscribe to our newsletter
              </h4>
              <p className="text-gray-600 text-sm">
                Get the latest deals and exclusive offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          className="border-t border-gray-200 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`text-2xl text-gray-500 hover:text-white transition-all duration-300 ${social.color} rounded-full p-2`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-blue-600 transition-colors">
                Cookies
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500"
            >
              © 2024 Meba Shopping. All rights reserved.
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </motion.button>
    </motion.footer>
  );
}