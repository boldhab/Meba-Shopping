import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: Readonly<ButtonProps>) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65";

  return (
    <button className={className ? `${baseClasses} ${className}` : baseClasses} {...props}>
      {children}
    </button>
  );
}
