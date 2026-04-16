import { getProductBySlug, ProductReview } from "@/lib/api/products";
import { notFound } from "next/navigation";
import { ProductGallery } from "./components/ProductGallery";
import { AddToCart } from "./components/AddToCart";
import { ProductInfo } from "./components/ProductInfo";
import { ReviewSection } from "./components/ReviewSection";
import { getProductImageUrls } from "@/lib/utils/productImages";

function calculateAverageRating(reviews: ProductReview[]) {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const imageUrls = getProductImageUrls(product.slug, product.name);
  const reviews = product.reviews ?? [];
  const averageRating = calculateAverageRating(reviews);
  const reviewText = averageRating
    ? `${averageRating.toFixed(1)} ★ (${reviews.length} Reviews)`
    : "No reviews yet";
  const availabilityText = product.stock > 0 ? `${product.stock} available` : "Out of stock";
  const primaryCategory = product.category?.name ?? "Marketplace";

  return (
    <section className="page-stack product-detail-page">
      <div className="product-detail-layout">
        <ProductGallery imageUrls={imageUrls} productName={product.name} />

        <aside className="product-detail-content panel">
          <div className="product-detail-content__header">
            <p className="product-detail-content__category">{primaryCategory}</p>
            <h1>{product.name}</h1>
            <div className="product-detail-content__meta-row">
              <a href="#reviews" className="product-detail-content__rating">
                {reviewText}
              </a>
              <span className={`product-detail-content__stock ${product.stock > 0 ? "is-available" : "is-soldout"}`}>
                {availabilityText}
              </span>
            </div>
          </div>

          <ProductInfo
            description={product.description}
            price={product.price}
            stock={product.stock}
            reviewCount={reviews.length}
          />

          <AddToCart product={product} />
        </aside>
      </div>

      <div className="product-detail-below">
        <section className="product-highlights panel">
          <div className="product-highlights__heading">
            <p className="product-highlights__eyebrow">Marketplace promise</p>
            <h2>Built for quick comparison and confident checkout</h2>
          </div>
          <div className="product-highlights__grid">
            <article className="product-highlight-card">
              <strong>Free shipping</strong>
              <span>Fast delivery estimate shown before checkout.</span>
            </article>
            <article className="product-highlight-card">
              <strong>Buyer protection</strong>
              <span>Secure payment flow with transparent refund handling.</span>
            </article>
            <article className="product-highlight-card">
              <strong>Real reviews</strong>
              <span>Ratings and comments stay visible next to the offer.</span>
            </article>
          </div>
        </section>

        <div id="reviews" className="product-reviews">
          <ReviewSection reviews={reviews} averageRating={averageRating} />
        </div>
      </div>
    </section>
  );
}
