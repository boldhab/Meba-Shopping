import Link from "next/link";

const quickLinks = [
  { href: "/products", label: "Browse products" },
  { href: "/cart", label: "Review your cart" },
  { href: "/checkout", label: "Start checkout" },
  { href: "/admin", label: "Open admin dashboard" }
];

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="hero__eyebrow">Meba Shopping</p>
        <h1>Structured for shopping, account, and admin experiences.</h1>
        <p className="hero__description">
          The frontend now mirrors the route groups and reusable component layout from the requested project structure.
        </p>
        <div className="hero__actions">
          {quickLinks.map((link) => (
            <Link key={link.href} className="hero__link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
