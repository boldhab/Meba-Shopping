import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Readonly<InputProps>) {
  const baseClasses =
    "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(14,122,83,0.2)]";

  return <input className={className ? `${baseClasses} ${className}` : baseClasses} {...props} />;
}
