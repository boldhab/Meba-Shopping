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

const DEAL_TYPE_COLORS: Record<DealType, string> = {
  DAILY: "from-orange-500 to-red-500",
  WEEKLY: "from-blue-500 to-indigo-500",
  CLEARANCE: "from-green-500 to-emerald-500",
  CEREMONY: "from-purple-500 to-pink-500",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">✨</span>
              <span className="text-white font-semibold">Meba Shopping</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Premier Shopping<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Experience
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto lg:mx-0">
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
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Deals Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
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
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
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
            const gradient = DEAL_TYPE_COLORS[dealType];

            return (
              <div key={dealType} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Section Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradient} bg-opacity-10 text-transparent bg-clip-text font-semibold px-3 py-1 rounded-full text-sm mb-3`}>
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
                        className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
                      <p className="text-gray-500 font-medium">
                        No active {DEAL_TYPE_LABELS[dealType].toLowerCase()} right now.
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
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
    </div>
  );
}