import { AddToCart } from "./components/AddToCart";
import { ProductInfo } from "./components/ProductInfo";
import { ReviewSection } from "./components/ReviewSection";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>Product #{params.id}</h1>
      <ProductInfo />
      <AddToCart />
      <ReviewSection />
    </section>
  );
}
