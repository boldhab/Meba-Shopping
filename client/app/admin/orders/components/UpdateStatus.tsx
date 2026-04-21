"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminOrderStatuses,
  type AdminOrder,
  type AdminOrderStatus,
  updateAdminOrderStatus,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";

const allowedTransitions: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function UpdateStatus({
  order,
  onUpdated,
}: {
  order: AdminOrder;
  onUpdated: (order: AdminOrder) => void;
}) {
  const { token } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>(order.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order.status]);

  const nextStatuses = useMemo(() => allowedTransitions[order.status] ?? [], [order.status]);

  const saveStatus = async () => {
    if (!token || selectedStatus === order.status) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedOrder = await updateAdminOrderStatus(token, order.id, selectedStatus);
      onUpdated(updatedOrder);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update order status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel admin-dashboard__section">
      <div className="admin-dashboard__section-header">
        <div>
          <h2 className="m-0">Order status</h2>
          <p className="m-0 text-sm text-(--color-muted)">Move this order through the fulfillment flow.</p>
        </div>
      </div>

      <div className="admin-dashboard__list-item">
        <div>
          <strong>Current status</strong>
          <p>{order.status}</p>
        </div>
        <div className="text-right">
          <strong>{nextStatuses.length}</strong>
          <p>available next step{nextStatuses.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {nextStatuses.length > 0 ? (
        <div className="form-stack">
          <label className="label-stack">
            <span className="text-sm font-medium">Next status</span>
            <select
              className="input"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as AdminOrderStatus)}
            >
              <option value={order.status}>{order.status}</option>
              {adminOrderStatuses
                .filter((status) => nextStatuses.includes(status))
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
          </label>

          <button
            type="button"
            className="button"
            disabled={isSaving || selectedStatus === order.status}
            onClick={() => void saveStatus()}
          >
            {isSaving ? "Updating..." : "Update Status"}
          </button>
        </div>
      ) : (
        <p className="m-0 text-sm text-(--color-muted)">This order is in a final state and cannot be moved further.</p>
      )}

      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
