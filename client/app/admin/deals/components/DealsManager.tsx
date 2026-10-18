"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminDeals, updateAdminDeal } from "@/lib/api/admin";
import type { DealType, Product } from "@/lib/api/products";
import { useAuth } from "@/lib/hooks/useAuth";

type EditableDeal = {
  productId: string;
  dealType: DealType | "NONE";
  isDealActive: boolean;
  dealStartAt: string;
  dealEndAt: string;
  price: string;
  compareAtPrice: string;
  discountPercent: string;
};

const DEAL_TYPE_OPTIONS: Array<{ label: string; value: DealType | "NONE" }> = [
  { label: "No deal", value: "NONE" },
  { label: "Daily Deal", value: "DAILY" },
  { label: "Weekly Deal", value: "WEEKLY" },
  { label: "Clearance Deal", value: "CLEARANCE" },
  { label: "Ceremony Deal", value: "CEREMONY" },
];

function toInputDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (unit: number) => String(unit).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toEditableDeal(product: Product): EditableDeal {
  return {
    productId: product.id,
    dealType: product.dealType ?? "NONE",
    isDealActive: product.isDealActive,
    dealStartAt: toInputDateTime(product.dealStartAt),
    dealEndAt: toInputDateTime(product.dealEndAt),
    price: product.price ? String(product.price) : "",
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    discountPercent: product.discountPercent ? String(product.discountPercent) : "",
  };
}

export function DealsManager() {
  const { token, isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableDeal>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE_ONLY">("ALL");
  const [dealTypeFilter, setDealTypeFilter] = useState<"ALL" | DealType>("ALL");

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    async function loadDeals() {
      if (!token || !isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminDeals(token);
        setItems(response.items);

        const nextDrafts: Record<string, EditableDeal> = {};
        for (const item of response.items) {
          nextDrafts[item.id] = toEditableDeal(item);
        }
        setDrafts(nextDrafts);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load deals.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDeals();
  }, [token, isAdmin]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const filteredItems = useMemo(
    () =>
      sortedItems.filter((item) => {
        const draft = drafts[item.id] ?? toEditableDeal(item);

        if (activeFilter === "ACTIVE_ONLY" && !draft.isDealActive) {
          return false;
        }

        if (dealTypeFilter !== "ALL" && draft.dealType !== dealTypeFilter) {
          return false;
        }

        return true;
      }),
    [sortedItems, drafts, activeFilter, dealTypeFilter]
  );

  const updateDraft = (productId: string, updates: Partial<EditableDeal>) => {
    setDrafts((previous) => ({
      ...previous,
      [productId]: {
        ...previous[productId],
        ...updates,
      },
    }));
  };

  const saveDeal = async (productId: string) => {
    if (!token) return;

    const draft = drafts[productId];
    if (!draft) return;

    setSavingId(productId);
    setError(null);

    try {
      const payload = {
        dealType: draft.dealType === "NONE" ? null : draft.dealType,
        isDealActive: draft.isDealActive,
        dealStartAt: draft.dealStartAt ? new Date(draft.dealStartAt).toISOString() : null,
        dealEndAt: draft.dealEndAt ? new Date(draft.dealEndAt).toISOString() : null,
        compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
        discountPercent: draft.discountPercent ? Number(draft.discountPercent) : null,
        price: draft.price ? Number(draft.price) : undefined,
      };

      const updated = await updateAdminDeal(token, productId, payload);

      setItems((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      setDrafts((previous) => ({
        ...previous,
        [productId]: toEditableDeal(updated),
      }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save deal changes.");
    } finally {
      setSavingId(null);
    }
  };

  if (!isAdmin) {
    return <div className="panel">Admin access is required to manage deals.</div>;
  }

  if (isLoading) {
    return <div className="panel">Loading deal configuration...</div>;
  }

  return (
    <div className="panel">
      {error ? (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <span>Visibility</span>
          <select
            aria-label="Filter by active status"
            className="rounded border border-slate-300 px-2 py-1"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value as "ALL" | "ACTIVE_ONLY")}
          >
            <option value="ALL">All products</option>
            <option value="ACTIVE_ONLY">Active deals only</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <span>Deal type</span>
          <select
            aria-label="Filter by deal type"
            className="rounded border border-slate-300 px-2 py-1"
            value={dealTypeFilter}
            onChange={(event) => setDealTypeFilter(event.target.value as "ALL" | DealType)}
          >
            <option value="ALL">All deal types</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CLEARANCE">Clearance</option>
            <option value="CEREMONY">Ceremony</option>
          </select>
        </label>

        <p className="text-xs text-slate-500">
          Showing {filteredItems.length} of {items.length} product{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Deal Type</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Price & Discount</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">End</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const draft = drafts[item.id] ?? toEditableDeal(item);
              return (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.category?.name ?? "Uncategorized"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Deal type for ${item.name}`}
                      className="rounded border border-slate-300 px-2 py-1"
                      value={draft.dealType}
                      onChange={(event) => updateDraft(item.id, { dealType: event.target.value as EditableDeal["dealType"] })}
                    >
                      {DEAL_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.isDealActive}
                        onChange={(event) => updateDraft(item.id, { isDealActive: event.target.checked })}
                      />
                      <span>{draft.isDealActive ? "Yes" : "No"}</span>
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1 min-w-[130px]">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 w-10">Sale:</span>
                        <input
                          type="number"
                          step="0.01"
                          aria-label={`Sale price for ${item.name}`}
                          className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                          value={draft.price}
                          onChange={(e) => updateDraft(item.id, { price: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 w-10">Orig:</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="MSRP"
                          aria-label={`Original price for ${item.name}`}
                          className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-500"
                          value={draft.compareAtPrice}
                          onChange={(e) => {
                            const comp = e.target.value;
                            const p = Number(draft.price);
                            const c = Number(comp);
                            const disc = c > p ? Math.round(((c - p) / c) * 100) : "";
                            updateDraft(item.id, { compareAtPrice: comp, discountPercent: String(disc) });
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 w-10">Off %:</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          placeholder="%"
                          aria-label={`Discount percentage for ${item.name}`}
                          className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-xs font-bold text-rose-600"
                          value={draft.discountPercent}
                          onChange={(e) => {
                            const disc = e.target.value;
                            const numDisc = Number(disc);
                            let orig = Number(draft.compareAtPrice);
                            let curr = Number(draft.price);
                            if (numDisc > 0 && numDisc < 100) {
                              if (!orig || orig <= curr) {
                                orig = curr;
                              }
                              curr = Number((orig * (1 - numDisc / 100)).toFixed(2));
                              updateDraft(item.id, {
                                discountPercent: disc,
                                compareAtPrice: String(orig),
                                price: String(curr),
                              });
                            } else {
                              updateDraft(item.id, { discountPercent: disc });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="datetime-local"
                      aria-label={`Deal start date for ${item.name}`}
                      className="rounded border border-slate-300 px-2 py-1"
                      value={draft.dealStartAt}
                      onChange={(event) => updateDraft(item.id, { dealStartAt: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="datetime-local"
                      aria-label={`Deal end date for ${item.name}`}
                      className="rounded border border-slate-300 px-2 py-1"
                      value={draft.dealEndAt}
                      onChange={(event) => updateDraft(item.id, { dealEndAt: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                      disabled={savingId === item.id}
                      onClick={() => {
                        void saveDeal(item.id);
                      }}
                    >
                      {savingId === item.id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 ? (
              <tr>
                <td className="px-3 py-5 text-center text-sm text-slate-500" colSpan={7}>
                  No products match the selected deal filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
