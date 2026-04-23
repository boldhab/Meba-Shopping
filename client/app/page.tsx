import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { getActiveDeals, type DealType, type Product } from "@/lib/api/products";

const quickLinks = [
  { href: "/products", label: "Browse products", icon: "🛍️" },
  { href: "/cart", label: "Review your cart", icon: "🛒" },
  { href: "/checkout", label: "Start checkout", icon: "✓" },
  { href: "/admin", label: "Open admin dashboard", icon: "⚙️" }
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

export default async function HomePage() {
  const dealsResult = await getActiveDeals({ limit: "24" });
  const groupedDeals = groupDeals(dealsResult.items);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">✨</span>
              <span className="text-white font-semibold">Meba Shopping</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Premier Shopping<br />
              <span className="text-orange-400">
                Experience
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Discover amazing deals, manage your account, and explore our curated collections
              all in one beautifully designed platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
                >
                  <span>{link.icon}</span>
                  {link.label}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Deals Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>🎯</span>
              Live Deal Sections
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Shop Each Deal Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Preview today's active offers by section, then jump straight into the full promotions view for that category.
            </p>
          </div>
          <Link
            href="/promotions"
            className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 shadow-md"
          >
            View All Deals
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Deal Sections */}
        <div className="space-y-12">
          {DEAL_TYPE_ORDER.map((dealType) => {
            const items = groupedDeals[dealType].slice(0, 4);
            const icon = DEAL_TYPE_ICONS[dealType];

            return (
              <div 
                key={dealType} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                {/* Section Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1.5 rounded-full mb-3">
                        <span>{icon}</span>
                        {DEAL_TYPE_LABELS[dealType]}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {DEAL_TYPE_LABELS[dealType]}
                      </h3>
                      <p className="text-gray-600">
                        {DEAL_TYPE_SUMMARIES[dealType]}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                        <span>⇀</span>
                        Swipe to explore
                      </div>
                      <Link
                        href={`/promotions?type=${dealType}`}
                        className="group inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-medium transition-colors"
                      >
                        Open section
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="text-6xl mb-4">🛍️</div>
                      <p className="font-medium text-gray-500">
                        No active {DEAL_TYPE_LABELS[dealType].toLowerCase()} right now.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check back soon for great offers!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Meba Shopping</h3>
              <p className="text-sm text-gray-600">Your premier shopping destination for amazing deals.</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link></li>
                <li><Link href="/promotions" className="hover:text-blue-600 transition-colors">Promotions</Link></li>
                <li><Link href="/cart" className="hover:text-blue-600 transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                <li><Link href="/returns" className="hover:text-blue-600 transition-colors">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-2xl text-gray-600 hover:text-blue-600 transition-colors">📘</a>
                <a href="#" className="text-2xl text-gray-600 hover:text-blue-600 transition-colors">📷</a>
                <a href="#" className="text-2xl text-gray-600 hover:text-blue-600 transition-colors">🐦</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm text-gray-500 border-t border-gray-100">
            © 2024 Meba Shopping. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}