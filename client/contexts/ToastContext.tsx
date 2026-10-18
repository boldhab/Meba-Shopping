"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ToastContainer, type ToastItem, type ToastType } from "@/components/ui/Toast";

type ToastOptions = {
  title?: string;
  duration?: number;
};

type ToastContextValue = {
  toast: {
    (message: string, options?: ToastOptions & { type?: ToastType }): void;
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
  };
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions & { type?: ToastType }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const type: ToastType = options?.type ?? "info";
      const duration = options?.duration ?? 4000;

      const newToast: ToastItem = {
        id,
        message,
        type,
        title: options?.title,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toastMethods = useMemo(() => {
    const fn = (message: string, options?: ToastOptions & { type?: ToastType }) => addToast(message, options);
    fn.success = (message: string, options?: ToastOptions) => addToast(message, { ...options, type: "success" });
    fn.error = (message: string, options?: ToastOptions) => addToast(message, { ...options, type: "error" });
    fn.info = (message: string, options?: ToastOptions) => addToast(message, { ...options, type: "info" });
    fn.warning = (message: string, options?: ToastOptions) => addToast(message, { ...options, type: "warning" });
    return fn;
  }, [addToast]);

  const value = useMemo(
    () => ({
      toast: toastMethods,
      dismissToast,
    }),
    [toastMethods, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
