"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
};

const toastConfig: Record<
  ToastType,
  { icon: typeof Info; iconColor: string; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bg: "bg-white",
    border: "border-emerald-200",
    text: "text-slate-800",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-rose-500",
    bg: "bg-white",
    border: "border-rose-200",
    text: "text-slate-800",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bg: "bg-white",
    border: "border-amber-200",
    text: "text-slate-800",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-slate-800",
  },
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${config.bg} ${config.border}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{toast.title}</h4>
                )}
                <p className={`text-sm ${config.text} leading-snug break-words`}>{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-100"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Fallback standalone component for legacy imports
export function Toast({
  message = "Notification",
  type = "info",
}: {
  message?: string;
  type?: ToastType;
}) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className="text-sm text-slate-700">{message}</span>
    </div>
  );
}
