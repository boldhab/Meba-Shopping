"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  getAdminAbandonedCarts,
  getAdminCartOverview,
  updateAdminCartRules,
  type AdminAbandonedCart,
  type AdminCartOverview,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

type RuleFormState = {
  minCartValue: string;
  maxQuantityPerProduct: string;
  freeShippingThreshold: string;
  taxRatePercent: string;
  abandonedHours: string;
};

const emptyRuleForm: RuleFormState = {
  minCartValue: "0",
  maxQuantityPerProduct: "25",
  freeShippingThreshold: "50",
  taxRatePercent: "0",
  abandonedHours: "24",
};

const metricCards: Array<{
  key: keyof AdminCartOverview["metrics"];
  label: string;
  suffix?: string;
  money?: boolean;
}> = [
  { key: "activeCarts", label: "Active carts" },
  { key: "abandonedCarts", label: "Abandoned carts" },
  { key: "abandonedRate", label: "Abandonment rate", suffix: "%" },
  { key: "averageCartValue", label: "Avg. cart value", money: true },
  { key: "cartToCheckoutConversionRate", label: "Cart to checkout", suffix: "%" },
  { key: "stockIssueItems", label: "Stock issue items" },
];

function mapRulesToForm(overview: AdminCartOverview | null): RuleFormState {
  if (!overview) {
    return emptyRuleForm;
  }

  return {
    minCartValue: String(overview.rules.minCartValue),
    maxQuantityPerProduct: String(overview.rules.maxQuantityPerProduct),
    freeShippingThreshold: String(overview.rules.freeShippingThreshold),
    taxRatePercent: String(overview.rules.taxRatePercent),
    abandonedHours: String(overview.rules.abandonedHours),
  };
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminCartPage() {
  const { token, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<AdminCartOverview | null>(null);
  const [abandoned, setAbandoned] = useState<AdminAbandonedCart[]>([]);
  const [totalAbandoned, setTotalAbandoned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rulesForm, setRulesForm] = useState<RuleFormState>(emptyRuleForm);

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  const loadData = async () => {
    if (!token || !isAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextOverview, abandonedResponse] = await Promise.all([
        getAdminCartOverview(token),
        getAdminAbandonedCarts(token, { page: 1, limit: 20 }),
      ]);

      setOverview(nextOverview);
      setRulesForm(mapRulesToForm(nextOverview));
      setAbandoned(abandonedResponse.items);
      setTotalAbandoned(abandonedResponse.total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load cart oversight data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token, isAdmin]);

  const onSubmitRules = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateAdminCartRules(token, {
        minCartValue: toNumber(rulesForm.minCartValue),
        maxQuantityPerProduct: Math.round(toNumber(rulesForm.maxQuantityPerProduct)),
        freeShippingThreshold: toNumber(rulesForm.freeShippingThreshold),
        taxRatePercent: toNumber(rulesForm.taxRatePercent),
        abandonedHours: Math.round(toNumber(rulesForm.abandonedHours)),
      });

      await loadData();
      setSuccess("Cart rules updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to update cart rules.");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedMetrics = useMemo(() => {
    if (!overview) {
      return [] as Array<{ label: string; value: string }>;
    }

    return metricCards.map((card) => {
      const rawValue = overview.metrics[card.key];
      let value = String(rawValue);

      if (card.money) {
        value = formatPrice(rawValue);
      } else if (card.suffix) {
        value = `${rawValue}${card.suffix}`;
      }

      return {
        label: card.label,
        value,
      };
    });
  }, [overview]);

  if (authLoading || isLoading) {
    return <section className="page-stack"><div className="panel">Loading cart oversight...</div></section>;
  }

  if (!isAdmin) {
    return <section className="page-stack"><div className="panel">Admin access is required.</div></section>;
  }

  return (
    <section className="page-stack">
      <div>
        <h1>Cart oversight</h1>
        <p className="products-page__description">
          Monitor abandoned carts, track cart conversion health, and configure cart checkout rules.
        </p>
      </div>

      {error ? <div className="panel text-[#b42318]">{error}</div> : null}
      {success ? <div className="panel text-[#027a48]">{success}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {formattedMetrics.map((metric) => (
          <article key={metric.label} className="panel">
            <p className="text-sm text-(--color-muted)">{metric.label}</p>
            <p className="m-0 text-2xl font-semibold">{metric.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="m-0">Abandoned carts</h2>
              <p className="m-0 text-sm text-(--color-muted)">
                Showing {abandoned.length} of {totalAbandoned} carts currently marked as abandoned.
              </p>
            </div>
            <button type="button" className="rounded bg-[#0f5eb8] px-3 py-1.5 text-sm text-white" onClick={() => void loadData()}>
              Refresh
            </button>
          </div>

          {abandoned.length ? (
            <div className="space-y-3">
              {abandoned.map((cart) => (
                <article key={cart.id} className="rounded border border-slate-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong>{cart.user.name ?? "Unnamed user"}</strong>
                      <p className="m-0 text-sm text-slate-600">{cart.user.email}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p className="m-0">{cart.itemCount} items</p>
                      <p className="m-0">{formatPrice(cart.subtotal)}</p>
                    </div>
                  </div>

                  <p className="m-0 mb-2 text-xs text-slate-500">
                    Last activity: {new Date(cart.lastActivityAt).toLocaleString()}
                  </p>

                  <div className="space-y-1">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.productName} x {item.quantity}</span>
                        <span className={item.quantity > item.stock ? "text-[#b42318]" : "text-slate-600"}>
                          stock {item.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-(--color-muted)">No abandoned carts found for the current threshold.</p>
          )}
        </section>

        <section className="panel">
          <h2 className="m-0 mb-1">Cart rules</h2>
          <p className="mb-4 text-sm text-(--color-muted)">
            Configure checkout thresholds and cart constraints used by admin oversight.
          </p>

          <form className="space-y-3" onSubmit={(event) => void onSubmitRules(event)}>
            <label className="block text-sm">
              <span className="mb-1 block">Minimum cart value</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={rulesForm.minCartValue}
                onChange={(event) => setRulesForm((prev) => ({ ...prev, minCartValue: event.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Maximum quantity per product</span>
              <input
                type="number"
                min={1}
                step="1"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={rulesForm.maxQuantityPerProduct}
                onChange={(event) => setRulesForm((prev) => ({ ...prev, maxQuantityPerProduct: event.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Free shipping threshold</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={rulesForm.freeShippingThreshold}
                onChange={(event) => setRulesForm((prev) => ({ ...prev, freeShippingThreshold: event.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Tax rate percent</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={rulesForm.taxRatePercent}
                onChange={(event) => setRulesForm((prev) => ({ ...prev, taxRatePercent: event.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Abandoned cart threshold (hours)</span>
              <input
                type="number"
                min={1}
                step="1"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={rulesForm.abandonedHours}
                onChange={(event) => setRulesForm((prev) => ({ ...prev, abandonedHours: event.target.value }))}
              />
            </label>

            <button
              type="submit"
              className="rounded bg-[#0f5eb8] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save rules"}
            </button>
          </form>

          <div className="mt-5">
            <h3 className="m-0 mb-2 text-base">Most added products</h3>
            {overview?.topProducts.length ? (
              <div className="space-y-2">
                {overview.topProducts.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                    <span>{product.productName}</span>
                    <span>{product.totalQuantity} added</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-(--color-muted)">No cart activity yet.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
