import { getActiveDeals } from "@/lib/api/products";
import { ProductPromotions } from "../products/components/ProductPromotions";

type PromotionsSearchParams = {
  type?: "DAILY" | "WEEKLY" | "CLEARANCE" | "CEREMONY";
};

export default async function PromotionsPage(props: {
  searchParams?: Promise<PromotionsSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const activeDealsResult = await getActiveDeals({
    dealType: searchParams?.type,
    limit: "200",
  });

  return (
    <section className="page-stack products-page">
      <div>
        <h1>Promotions</h1>
        <p className="products-page__description">
          Explore all currently active daily, weekly, ceremony, and clearance deals.
        </p>
        <p className="products-page__meta">
          {activeDealsResult.total} active deal{activeDealsResult.total === 1 ? "" : "s"} available now
        </p>
      </div>

      <ProductPromotions products={activeDealsResult.items} />
    </section>
  );
}
