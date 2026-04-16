import { getProductBySlug, ProductReview } from "@/lib/api/products";
import { notFound } from "next/navigation";
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

  return (
    <section className="page-stack product-detail-page">
      <div className="product-detail-layout">
        
        {/* LEFT BLOCK: GALLERY */}
        <div className="product-gallery">
          <div className="product-gallery__main">
            <img src={imageUrls[0]} alt={product.name} />
          </div>
          <div className="product-gallery__thumbs">
            {imageUrls.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt={`${product.name} view ${index + 1}`} />
            ))}
          </div>
        </div>

        {/* RIGHT BLOCK: DETAILS & ACTIONS */}
        <div className="product-detail-content">
          <div className="product-detail-content__header">
            {product.category && (
              <p className="product-detail-content__category">{product.category.name}</p>
            )}
            <h1>{product.name}</h1>
            <a href="#reviews" className="product-detail-content__rating">
              {reviewText}
            </a>
          </div>
          
          <ProductInfo description={product.description} price={product.price} />

          <AddToCart product={product} />
        </div>
      </div>

      <div id="reviews">
        <ReviewSection reviews={reviews} />
      </div>
    </section>
  );
}
