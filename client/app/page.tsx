import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { getActiveDeals, type DealType, type Product } from "@/lib/api/products";

const quickLinks = [
  { href: "/products", label: "Browse products" },
  { href: "/cart", label: "Review your cart" },
  { href: "/checkout", label: "Start checkout" },
  { href: "/admin", label: "Open admin dashboard" }
];

const DEAL_TYPE_ORDER: DealType[] = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"];

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  DAILY: "Daily Deals",
  WEEKLY: "Weekly Deals",
  CLEARANCE: "Clearance Deals",
  CEREMONY: "Ceremony Deals",
};

const DEAL_TYPE_SUMMARIES: Record<DealType, string> = {
  DAILY: "Fresh daily picks updated for fast-moving shoppers.",
  WEEKLY: "Longer-running offers worth tracking through the week.",
  CLEARANCE: "Last-chance markdowns before inventory runs out.",
  CEREMONY: "Celebration-ready products gathered into one section.",
};

function groupDeals(products: Product[]) {
  return products.reduce<Record<DealType, Product[]>>(
    (groups, product) => {
      if (product.dealType) {
        groups[product.dealType].push(product);
      }

      return groups;
    },
    {
      DAILY: [],
      WEEKLY: [],
      CLEARANCE: [],
      CEREMONY: [],
    }
  );
}

export default async function HomePage() {
  const dealsResult = await getActiveDeals({ limit: "24" });
  const groupedDeals = groupDeals(dealsResult.items);

  return (
    <section className="page-stack">
      <div className="hero">
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
      </div>

      <section className="home-deals">
        <div className="home-deals__intro">
          <div>
            <p className="home-deals__eyebrow">Live deal sections</p>
            <h2 className="m-0">Shop each deal category from the homepage</h2>
            <p className="home-deals__description">
              Preview today&apos;s active offers by section, then jump straight into the full promotions view for that category.
            </p>
          </div>
          <Link href="/promotions" className="home-deals__link">
            View all deals
          </Link>
        </div>

        <div className="home-deals__sections">
          {DEAL_TYPE_ORDER.map((dealType) => {
            const items = groupedDeals[dealType].slice(0, 4);

            return (
              <section key={dealType} className="home-deals__section">
                <div className="home-deals__section-header">
                  <div>
                    <p className="home-deals__section-tag">{DEAL_TYPE_LABELS[dealType]}</p>
                    <h3>{DEAL_TYPE_LABELS[dealType]}</h3>
                    <p>{DEAL_TYPE_SUMMARIES[dealType]}</p>
                  </div>
                  <div className="home-deals__section-actions">
                    <span className="home-deals__swipe-hint">Swipe to explore</span>
                    <Link href={`/promotions?type=${dealType}`} className="home-deals__section-link">
                      Open section
                    </Link>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="home-deals__grid">
                    {items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="home-deals__empty">
                    No active {DEAL_TYPE_LABELS[dealType].toLowerCase()} right now.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </section>
  );
}
