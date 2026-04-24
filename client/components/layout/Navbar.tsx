"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCart } from "@/lib/hooks/useCart";
import { AdminNavbar } from "./AdminNavbar";
import {
  ChevronDown,
  Grid3X3,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
  Heart,
  HelpCircle,
  Truck,
  ChevronRight,
  Mail,
  Clock,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-react";

// Animation variants (keep as is)
const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems: cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  let mouseLeaveTimeout: NodeJS.Timeout;

  // Popular search suggestions
  const popularSearches = [
    "iPhone 15", "Laptop", "Shoes", "Dress", "Watch", "Headphones", "TV", "Camera"
  ];

  useEffect(() => {
    if (searchText.length > 1) {
      // Simulate API call for suggestions
      const filtered = popularSearches.filter(s => 
        s.toLowerCase().includes(searchText.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  }, [searchText]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Simplified nav links - remove redundancy
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/promotions", label: "Deals", icon: Tag },
  ];

  // Real-world categories
  const categoryLinks = [
    "Electronics", "Fashion", "Home & Living", "Sports", 
    "Beauty", "Toys", "Books", "Grocery"
  ];

  // Simplified account menu - most important items only
  const accountMenuItems = [
    { href: "/account/orders", label: "My Orders", icon: Package, badge: null },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart, badge: null },
    { href: "/account/messages", label: "Messages", icon: Mail, badge: null },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchText.trim())}`);
      setIsSearchFocused(false);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return <AdminNavbar />;
  }

  return (
    <>
      <motion.header
        initial="initial"
        animate="animate"
        variants={fadeInDown}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg bg-white/95 backdrop-blur-sm" : "bg-white shadow-sm"
        }`}
      >
        {/* Top Bar - Keep minimal */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="mx-auto flex h-8 max-w-none items-center justify-between px-6 md:px-12 lg:px-20 text-[11px]">
            <div className="flex items-center gap-4">
              <Truck className="h-3 w-3" />
              <p className="hidden sm:block">Free shipping on orders over 1000 ETB</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="hover:text-orange-400 transition-colors">
                Track Order
              </Link>
              <Link href="/help" className="hover:text-orange-400 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="border-b border-slate-100">
          <div className="mx-auto flex h-16 max-w-none items-center gap-4 px-6 md:px-12 lg:px-20">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Meba
              </span>
            </Link>

            {/* Search Bar with Autocomplete - IMPROVED */}
            <div className="hidden flex-1 max-w-2xl md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className={`flex h-11 w-full items-center rounded-full border-2 transition-all ${
                  isSearchFocused 
                    ? "border-orange-400 shadow-lg shadow-orange-100" 
                    : "border-slate-200 hover:border-slate-300"
                } bg-white`}>
                  <Search className="ml-4 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border-none bg-transparent px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Search products, brands, and categories..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="mr-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="mr-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-1.5 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </div>

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && (searchSuggestions.length > 0 || searchText.length === 0) && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
                    >
                      {searchText.length === 0 ? (
                        <div className="py-2">
                          <p className="px-4 py-2 text-xs font-semibold text-slate-400">Popular Searches</p>
                          {popularSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => {
                                setSearchText(term);
                                router.push(`/products?search=${encodeURIComponent(term)}`);
                                setIsSearchFocused(false);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50"
                            >
                              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                              {term}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setSearchText(suggestion);
                                router.push(`/products?search=${encodeURIComponent(suggestion)}`);
                                setIsSearchFocused(false);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50"
                            >
                              <Search className="h-3.5 w-3.5 text-slate-400" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Desktop Right Section - SIMPLIFIED */}
            <div className="hidden items-center gap-3 md:flex">
              {/* Account Button - Simplified */}
              <div
                className="relative"
                onMouseEnter={() => setIsAccountMenuOpen(true)}
                onMouseLeave={() => setTimeout(() => setIsAccountMenuOpen(false), 150)}
              >
                <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                  <User className="h-4 w-4" />
                  <span>{isAuthenticated ? user?.name?.split(" ")[0] : "Account"}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-50"
                    >
                      {isAuthenticated ? (
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-900">Hi, {user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>
                          {accountMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-900">Welcome!</p>
                            <p className="text-xs text-slate-500 mt-1">Sign in for better experience</p>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Link
                              href="/login"
                              className="block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2 text-center text-sm font-semibold text-white"
                            >
                              Sign In
                            </Link>
                            <Link
                              href="/register"
                              className="block rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Create Account
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Button - Keep as is */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-sm font-semibold text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Navigation - Keep minimal */}
        <div className="hidden border-t border-slate-100 bg-white md:block">
          <div className="mx-auto flex h-10 max-w-none items-center gap-6 px-6 md:px-12 lg:px-20">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-orange-600"
              >
                <Grid3X3 className="h-4 w-4" />
                All Categories
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg z-50"
                  >
                    <div className="py-2">
                      {categoryLinks.map((category) => (
                        <Link
                          key={category}
                          href={`/products?category=${category.toLowerCase()}`}
                          className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {category}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple Nav Links */}
            <div className="flex gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">
                Home
              </Link>
              <Link href="/products" className="px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">
                Products
              </Link>
              <Link href="/promotions" className="px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">
                Flash Deals
              </Link>
            </div>

            {/* Flash Sale Timer */}
            <div className="ml-auto flex items-center gap-2 text-xs">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="text-slate-500">Flash Sale ends in:</span>
              <span className="font-mono font-bold text-orange-600">02:15:32</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu - SIMPLIFIED for better UX */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-200 bg-white md:hidden overflow-hidden"
            >
              <div className="space-y-4 p-4 max-h-[80vh] overflow-y-auto">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 rounded-full border border-slate-200 px-4 py-2">
                    <input
                      className="w-full outline-none text-sm"
                      placeholder="Search products..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-orange-500 px-4 text-sm font-semibold text-white"
                  >
                    Go
                  </button>
                </form>

                {/* Mobile Navigation */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/" className="rounded-lg border border-slate-200 p-3 text-center text-sm font-medium">
                    Home
                  </Link>
                  <Link href="/products" className="rounded-lg border border-slate-200 p-3 text-center text-sm font-medium">
                    Products
                  </Link>
                  <Link href="/promotions" className="rounded-lg border border-slate-200 p-3 text-center text-sm font-medium">
                    Deals
                  </Link>
                  <Link href="/cart" className="rounded-lg border border-slate-200 p-3 text-center text-sm font-medium">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                </div>

                {/* Mobile Auth */}
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link href="/account/orders" className="block rounded-lg border border-slate-200 p-3 text-center text-sm">
                      My Orders
                    </Link>
                    <Link href="/account/wishlist" className="block rounded-lg border border-slate-200 p-3 text-center text-sm">
                      Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg bg-red-500 p-3 text-center text-sm font-semibold text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-3 text-center font-semibold text-white"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="h-[116px]" />
    </>
  );
}