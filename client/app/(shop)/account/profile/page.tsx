"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  fetchAccountSettings,
  saveAccountSettings,
  fetchAccountOrders,
  fetchWishlistItems,
  type AccountAddress,
  type AccountProfile,
  type AccountSettings,
} from "@/lib/api/account";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  Heart,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Check,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function ProfilePage() {
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [profile, setProfile] = useState<AccountProfile>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Prefer not to say",
  });

  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [settings, setSettings] = useState<AccountSettings | null>(null);

  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // New address state for modal/inline add
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine1, setNewLine1] = useState("");
  const [newCity, setNewCity] = useState("Addis Ababa");

  useEffect(() => {
    if (authLoading) return;
    if (!token || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        const [settingsData, ordersData, wishlistData] = await Promise.all([
          fetchAccountSettings(token as string).catch(() => null),
          fetchAccountOrders(token as string).catch(() => ({ items: [] })),
          fetchWishlistItems(token as string).catch(() => ({ items: [] })),
        ]);

        if (!isMounted) return;

        if (settingsData) {
          setSettings(settingsData);
          setAddresses(settingsData.addresses || []);
          setProfile({
            fullName: settingsData.profile?.fullName || user?.name || "",
            email: settingsData.profile?.email || user?.email || "",
            phone: settingsData.profile?.phone || "",
            dob: settingsData.profile?.dob || "",
            gender: settingsData.profile?.gender || "Prefer not to say",
          });
        } else if (user) {
          setProfile((p) => ({
            ...p,
            fullName: user.name || "",
            email: user.email || "",
          }));
        }

        setOrderCount(ordersData?.items?.length || 0);
        setWishlistCount(wishlistData?.items?.length || 0);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token, isAuthenticated, authLoading, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setSaveNotice(null);

    try {
      const currentPrefs = settings?.preferences || {
        emailOrderUpdates: true,
        emailWishlistAlerts: true,
        emailPromotions: false,
        smsAlerts: false,
        pushNotifications: false,
        newsletter: true,
        currency: "ETB",
        language: "English",
      };

      const updated = await saveAccountSettings(token, {
        profile,
        addresses,
        preferences: currentPrefs,
      });

      setSettings(updated);
      setSaveNotice("Profile information saved successfully!");
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      setSaveNotice("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newLine1.trim()) return;

    const newAddr: AccountAddress = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      line1: newLine1.trim(),
      city: newCity.trim(),
      isDefault: addresses.length === 0,
    };

    const nextAddresses = [...addresses, newAddr];
    setAddresses(nextAddresses);
    setNewLine1("");
    setShowAddAddress(false);

    try {
      const currentPrefs = settings?.preferences || {
        emailOrderUpdates: true,
        emailWishlistAlerts: true,
        emailPromotions: false,
        smsAlerts: false,
        pushNotifications: false,
        newsletter: true,
        currency: "ETB",
        language: "English",
      };

      await saveAccountSettings(token, {
        profile,
        addresses: nextAddresses,
        preferences: currentPrefs,
      });
      setSaveNotice("Delivery address added.");
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      // Revert if failed
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!token) return;
    const nextAddresses = addresses.filter((a) => a.id !== id);
    setAddresses(nextAddresses);

    try {
      const currentPrefs = settings?.preferences || {
        emailOrderUpdates: true,
        emailWishlistAlerts: true,
        emailPromotions: false,
        smsAlerts: false,
        pushNotifications: false,
        newsletter: true,
        currency: "ETB",
        language: "English",
      };

      await saveAccountSettings(token, {
        profile,
        addresses: nextAddresses,
        preferences: currentPrefs,
      });
    } catch {
      // Revert
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!token) return;
    const nextAddresses = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(nextAddresses);

    try {
      const currentPrefs = settings?.preferences || {
        emailOrderUpdates: true,
        emailWishlistAlerts: true,
        emailPromotions: false,
        smsAlerts: false,
        pushNotifications: false,
        newsletter: true,
        currency: "ETB",
        language: "English",
      };

      await saveAccountSettings(token, {
        profile,
        addresses: nextAddresses,
        preferences: currentPrefs,
      });
    } catch {
      // Revert
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Account Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">
            Please sign in to access and manage your profile details and saved addresses.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const userInitial = (profile.fullName || user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profile.fullName || user.name || "Customer"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white backdrop-blur-xs tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span>{profile.email || user.email}</span>
            </p>
            {profile.phone && (
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Phone className="w-3 h-3 text-orange-400" />
                <span>{profile.phone}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href="/account/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
          <Link href="/account/orders" className="hover:opacity-80 transition-opacity">
            <p className="text-xl sm:text-2xl font-extrabold text-white">{orderCount}</p>
            <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Orders</p>
          </Link>
          <Link href="/account/wishlist" className="hover:opacity-80 transition-opacity">
            <p className="text-xl sm:text-2xl font-extrabold text-white">{wishlistCount}</p>
            <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Wishlist</p>
          </Link>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">{addresses.length}</p>
            <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Saved Addresses</p>
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              Personal Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                    placeholder="e.g. Abebe Bikila"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                    placeholder="abebe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                    placeholder="+251 91 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Address Book & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Address Book */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Delivery Addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Inline Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">New Address</span>
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Street / House (e.g. Bole Road, House 21)"
                  value={newLine1}
                  onChange={(e) => setNewLine1(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="City (e.g. Addis Ababa)"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  required
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? "border-orange-200 bg-orange-50/30"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{addr.line1 || "Street Address"}</p>
                    <p className="text-xs text-slate-500">{addr.city || "Addis Ababa"}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 ml-auto transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Account Links
            </h3>
            <Link
              href="/account/orders"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span>My Orders</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/account/wishlist"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Wishlist</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Preferences & Security</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
