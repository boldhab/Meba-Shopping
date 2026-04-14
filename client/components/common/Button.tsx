import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: Readonly<ButtonProps>) {
  return (
    <button className={className ? `button ${className}` : "button"} {...props}>
      {children}
    </button>
  );
}
