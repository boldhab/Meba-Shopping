"use client";

import { useEffect, useState } from "react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  fetchAccountSettings,
  saveAccountSettings,
  type AccountAddress,
  type AccountPreferences,
  type AccountProfile,
} from "@/lib/api/account";

export default function SettingsPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saveNotice, setSaveNotice] = useState("");
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [profile, setProfile] = useState<AccountProfile>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
  });
  const [prefs, setPrefs] = useState<AccountPreferences>({
    emailOrderUpdates: false,
    emailWishlistAlerts: false,
    emailPromotions: false,
    smsAlerts: false,
    pushNotifications: false,
    newsletter: false,
    currency: "ETB",
    language: "English",
  });

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
          setAddresses(currentSettings.addresses);
          setProfile(currentSettings.profile);
          setPrefs(currentSettings.preferences);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const save = async (message: string) => {
    if (!token) return;

    const next = await saveAccountSettings(token, { profile, addresses, preferences: prefs });
    setAddresses(next.addresses);
    setProfile(next.profile);
    setPrefs(next.preferences);
    setSaveNotice(message);
    window.setTimeout(() => setSaveNotice(""), 1800);
  };

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        label: "New",
        line1: "",
        city: "",
        isDefault: false,
      },
    ]);
  };

  const deleteAddress = (id: string) => {
    const ok = window.confirm("Delete this address?");
    if (!ok) return;
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr.id === id })));
  };

  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-amber-100 bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage profile, addresses, security, notifications, and account preferences.</p>
        {saveNotice ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{saveNotice}</p> : null}
      </header>

      {isLoading ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading settings...</article>
      ) : null}

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Profile information</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Date of birth
            <input title="Date of birth" aria-label="Date of birth" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={profile.dob} onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Gender
            <select title="Gender" aria-label="Gender" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">Profile picture: upload or change</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => void save("Profile updated successfully")} className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">Save profile</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Verify email</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Change email</button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Address book</h2>
        <p className="mt-1 text-sm text-slate-600">Billing and shipping addresses. Set default shipping address.</p>
        <div className="mt-3 space-y-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-lg border border-slate-100 p-3">
              <p className="font-semibold text-slate-800">{addr.label} {addr.isDefault ? "(Default)" : ""}</p>
              <p className="text-sm text-slate-600">{addr.line1 || "Address line"}, {addr.city || "City"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                <button onClick={() => deleteAddress(addr.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Delete</button>
                <button onClick={() => setDefault(addr.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Set default</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addAddress} className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">Add address</button>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Login and security</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Old password" type="password" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="New password" type="password" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Confirm new password" type="password" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">Change password</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Enable 2FA</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage active sessions</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Log out from other devices</button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Notification preferences</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <label><input type="checkbox" checked={prefs.emailOrderUpdates} onChange={(e) => setPrefs((p) => ({ ...p, emailOrderUpdates: e.target.checked }))} /> Email order updates</label>
          <label><input type="checkbox" checked={prefs.emailWishlistAlerts} onChange={(e) => setPrefs((p) => ({ ...p, emailWishlistAlerts: e.target.checked }))} /> Email wishlist alerts</label>
          <label><input type="checkbox" checked={prefs.emailPromotions} onChange={(e) => setPrefs((p) => ({ ...p, emailPromotions: e.target.checked }))} /> Email promotions</label>
          <label><input type="checkbox" checked={prefs.smsAlerts} onChange={(e) => setPrefs((p) => ({ ...p, smsAlerts: e.target.checked }))} /> SMS alerts</label>
          <label><input type="checkbox" checked={prefs.pushNotifications} onChange={(e) => setPrefs((p) => ({ ...p, pushNotifications: e.target.checked }))} /> Push notifications</label>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Privacy and data</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download my data</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage cookies consent</button>
          <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Delete my account</button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Preferences</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Currency
            <select title="Currency" aria-label="Currency" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={prefs.currency} onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}>
              <option>ETB</option>
              <option>USD</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Language
            <select title="Language" aria-label="Language" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}>
              <option>English</option>
              <option>Amharic</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" checked={prefs.newsletter} onChange={(e) => setPrefs((p) => ({ ...p, newsletter: e.target.checked }))} />
            Subscribe to newsletter
          </label>
        </div>

        <button onClick={() => void save("Settings saved successfully")} className="mt-3 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
          Save changes
        </button>
      </article>
    </section>
  );
}
