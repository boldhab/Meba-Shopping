"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { changePassword } from "@/lib/api/auth";
import {
  fetchAccountSettings,
  saveAccountSettings,
  type AccountAddress,
  type AccountPreferences,
  type AccountProfile,
} from "@/lib/api/account";
import {
  Settings,
  User,
  MapPin,
  Lock,
  Bell,
  Globe,
  Check,
  Plus,
  Trash2,
  Shield,
  Save,
  ArrowRight,
} from "lucide-react";

export default function SettingsPage() {
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [profile, setProfile] = useState<AccountProfile>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Prefer not to say",
  });
  const [prefs, setPrefs] = useState<AccountPreferences>({
    emailOrderUpdates: true,
    emailWishlistAlerts: true,
    emailPromotions: false,
    smsAlerts: false,
    pushNotifications: true,
    newsletter: true,
    currency: "ETB",
    language: "English",
  });

  // Password change state
  const [passwordState, setPasswordState] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Address add state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine1, setNewLine1] = useState("");
  const [newCity, setNewCity] = useState("Addis Ababa");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentSettings = await fetchAccountSettings(token);
        if (isMounted) {
          setAddresses(currentSettings.addresses || []);
          setProfile({
            fullName: currentSettings.profile?.fullName || user?.name || "",
            email: currentSettings.profile?.email || user?.email || "",
            phone: currentSettings.profile?.phone || "",
            dob: currentSettings.profile?.dob || "",
            gender: currentSettings.profile?.gender || "Prefer not to say",
          });
          setPrefs(currentSettings.preferences || prefs);
        }
      } catch {
        // Fallback to user auth data if settings endpoint is fresh
        if (user && isMounted) {
          setProfile((p) => ({
            ...p,
            fullName: user.name || "",
            email: user.email || "",
          }));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const save = async (message: string) => {
    if (!token) return;
    setIsSaving(true);
    setSaveNotice(null);

    try {
      const next = await saveAccountSettings(token, { profile, addresses, preferences: prefs });
      setAddresses(next.addresses || []);
      setProfile(next.profile);
      setPrefs(next.preferences);
      setSaveNotice(message);
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      setSaveNotice("Failed to save changes. Please try again.");
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

    await saveAccountSettings(token, {
      profile,
      addresses: nextAddresses,
      preferences: prefs,
    });
    setSaveNotice("New address saved.");
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const deleteAddress = async (id: string) => {
    if (!token) return;
    const ok = window.confirm("Are you sure you want to remove this address?");
    if (!ok) return;

    const nextAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(nextAddresses);

    await saveAccountSettings(token, {
      profile,
      addresses: nextAddresses,
      preferences: prefs,
    });
  };

  const setDefault = async (id: string) => {
    if (!token) return;
    const nextAddresses = addresses.map((addr) => ({ ...addr, isDefault: addr.id === id }));
    setAddresses(nextAddresses);

    await saveAccountSettings(token, {
      profile,
      addresses: nextAddresses,
      preferences: prefs,
    });
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setPasswordNotice("You must be logged in to change your password.");
      return;
    }
    if (!passwordState.oldPassword) {
      setPasswordNotice("Please enter your current password.");
      return;
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordNotice("Password must be at least 8 characters long.");
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordNotice("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(token, {
        currentPassword: passwordState.oldPassword,
        newPassword: passwordState.newPassword,
      });
      setPasswordNotice(res.message || "Password updated successfully.");
      setPasswordState({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordNotice(null), 4000);
    } catch (err: any) {
      setPasswordNotice(err.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Account Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize your notifications, security credentials, addresses, and localization.
          </p>
        </div>

        <Link
          href="/account/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </Link>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            Basic Profile Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email Address"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+251 91 123 4567"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => void save("Profile updated successfully")}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </article>

        {/* Security Card */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-600" />
            Login & Security
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all text-slate-900"
                placeholder="••••••••"
                type="password"
                required
                value={passwordState.oldPassword}
                onChange={(e) => setPasswordState({ ...passwordState, oldPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all text-slate-900"
                placeholder="Min. 8 characters"
                type="password"
                required
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all text-slate-900"
                placeholder="Confirm password"
                type="password"
                required
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
              />
            </div>

            {passwordNotice && (
              <p className="text-xs font-semibold text-slate-700 mt-2">{passwordNotice}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {isChangingPassword ? "Updating Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </article>

        {/* Notification Preferences */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-600" />
            Notification Preferences
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-900">Email Order Updates</p>
                <p className="text-slate-500 text-[11px]">Real-time tracking and delivery notices</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600 cursor-pointer"
                checked={prefs.emailOrderUpdates}
                onChange={(e) => setPrefs((p) => ({ ...p, emailOrderUpdates: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-900">Wishlist & Price Drops</p>
                <p className="text-slate-500 text-[11px]">Alerts when saved items go on sale</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600 cursor-pointer"
                checked={prefs.emailWishlistAlerts}
                onChange={(e) => setPrefs((p) => ({ ...p, emailWishlistAlerts: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-900">Weekly Promotions & Deals</p>
                <p className="text-slate-500 text-[11px]">Discount vouchers and clearance notices</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600 cursor-pointer"
                checked={prefs.emailPromotions}
                onChange={(e) => setPrefs((p) => ({ ...p, emailPromotions: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-900">SMS Alerts</p>
                <p className="text-slate-500 text-[11px]">SMS on out-for-delivery events</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600 cursor-pointer"
                checked={prefs.smsAlerts}
                onChange={(e) => setPrefs((p) => ({ ...p, smsAlerts: e.target.checked }))}
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={() => void save("Notification preferences saved")}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Notifications</span>
            </button>
          </div>
        </article>

        {/* Currency & Regional Preferences */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-600" />
            Regional & Localization
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Display Currency
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                value={prefs.currency}
                onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
              >
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interface Language
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-900"
                value={prefs.language}
                onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Amharic">Amharic (አማርኛ)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 cursor-pointer mt-4">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600 cursor-pointer"
                checked={prefs.newsletter}
                onChange={(e) => setPrefs((p) => ({ ...p, newsletter: e.target.checked }))}
              />
              <span className="text-xs font-bold text-slate-800">
                Subscribe to Meba weekly fresh grocery digest
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={() => void save("Regional settings saved")}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Localization</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
