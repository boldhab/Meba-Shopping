"use client";

import React from "react";
import { Search, X } from "lucide-react";

export type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search products, categories, deals...",
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full rounded-full border border-slate-200 bg-white shadow-2xs hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all ${className}`}
    >
      <Search className="ml-3.5 w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="mr-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          aria-label="Clear search text"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="submit"
        className="mr-1.5 px-4 py-1.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
