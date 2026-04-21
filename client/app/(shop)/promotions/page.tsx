import { ProductPromotions } from "../products/components/ProductPromotions";
import { getActiveDeals, type DealType } from "@/lib/api/products";

const DEAL_TYPES: DealType[] = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"];

function parseDealType(value?: string): DealType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toUpperCase() as DealType;
  return DEAL_TYPES.includes(normalized) ? normalized : undefined;
}

export default async function PromotionsPage(props: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedDealType = parseDealType(searchParams?.type);
  const dealsResult = await getActiveDeals({
    limit: "160",
    dealType: selectedDealType,
  });

  return (
    <section className="page-stack products-page">
      <div>
        <h1>Promotions</h1>
        <p className="products-page__description">
          Explore live marketplace deals organized into Daily, Weekly, Clearance, and Ceremony sections.
        </p>
        <p className="products-page__meta">
          Showing {dealsResult.total} active deal{dealsResult.total === 1 ? "" : "s"}
          {selectedDealType ? ` in ${selectedDealType.toLowerCase()} promotions` : " across all sections"}
        </p>
      </div>

      <ProductPromotions
        products={dealsResult.items}
        selectedDealType={selectedDealType}
        showEmptySections
      />
    </section>
  );
}
