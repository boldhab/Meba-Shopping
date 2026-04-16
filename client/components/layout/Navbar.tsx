"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ChevronDown,
  Grid3X3,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
  Heart,
  Shield,
  HelpCircle,
  Truck,
  ChevronRight,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(3); // Example - replace with actual cart state

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Package },
    { href: "/products", label: "Products", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
  ];

  const categoryLinks = [
    "Electronics", "Clothing", "Home & Garden", "Sports", "Toys", "Books", "Automotive", "Health"
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
    } else {
      router.push("/products");
    }
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Truck className="h-3 w-3" />
              <p className="hidden sm:block">Free shipping on orders over 1000 ETB</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                <Package className="h-3 w-3" />
                Orders
              </Link>
              <Link href="/help" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Help
              </Link>
              <Link href="/buyer-protection" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Protection
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={`bg-white transition-all duration-300 ${isScrolled ? "border-b border-slate-200" : ""}`}>
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md group-hover:shadow-lg transition-all">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Meba
                </span>
                <span className="hidden text-[10px] font-medium text-orange-500 lg:block">Marketplace</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-2 md:flex">
              <div className="relative flex h-10 w-full items-center rounded-full border-2 border-slate-200 bg-white px-4 transition-all focus-within:border-orange-400">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-none bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search for products, brands, and more..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:shadow-lg transition-all hover:scale-105"
              >
                Search
              </button>
            </form>

            {/* Desktop Right Section */}
            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="group relative inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                      <span className="text-xs font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    {user?.name?.split(" ")[0] || "Account"}
                  </Link>
                  <Link
                    href="/wishlist"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 px-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/wishlist"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                </>
              )}

              <Link
                href="/cart"
                className="relative inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-all hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                All Categories
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Categories Dropdown Menu */}
              {categoriesOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                  <div className="py-2">
                    {categoryLinks.map((category) => (
                      <Link
                        key={category}
                        href={`/products?category=${category.toLowerCase()}`}
                        className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {category}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-orange-50 text-orange-600 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-orange-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="flex items-center gap-1 rounded-md px-4 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-orange-600">
                  Deals
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1 hidden w-48 rounded-lg border border-slate-200 bg-white shadow-lg group-hover:block">
                  <div className="py-2">
                    <Link href="/deals/today" className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                      Today's Deals
                    </Link>
                    <Link href="/deals/weekly" className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                      Weekly Specials
                    </Link>
                    <Link href="/clearance" className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600">
                      Clearance
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            <p className="hidden text-xs text-slate-500 md:block animate-pulse">
              🔥 Flash deals end in 2:15:32
            </p>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 md:hidden ${
            isMobileMenuOpen ? "max-h-[600px] shadow-lg" : "max-h-0"
          }`}
        >
          <div className="space-y-4 p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex h-10 w-full items-center rounded-full border-2 border-slate-200 px-3 focus-within:border-orange-400">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-none bg-transparent px-2 text-sm text-slate-700 outline-none"
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 text-xs font-semibold text-white"
              >
                Go
              </button>
            </form>

            {/* Mobile Navigation Grid */}
            <div className="grid grid-cols-3 gap-2">
              <Link href="/" className="rounded-lg border-2 border-slate-200 p-2 text-center text-xs font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50">
                Home
              </Link>
              <Link href="/products" className="rounded-lg border-2 border-slate-200 p-2 text-center text-xs font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50">
                Products
              </Link>
              <Link href="/cart" className="rounded-lg border-2 border-slate-200 p-2 text-center text-xs font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50">
                Cart
              </Link>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">CATEGORIES</p>
              <div className="grid grid-cols-2 gap-2">
                {categoryLinks.slice(0, 6).map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${category.toLowerCase()}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <Link href="/account" className="block rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-600">
                  My Account
                </Link>
                <Link href="/wishlist" className="block rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700">
                  Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-center text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-md"
              >
                Sign in to your account
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[130px] md:h-[124px]" />
    </>
  );
}