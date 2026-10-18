import React, { type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  icon?: React.ReactNode;
};

export function Input({
  className = "",
  error,
  icon,
  id,
  ...props
}: Readonly<InputProps>) {
  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
