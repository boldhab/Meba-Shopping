import { getProductBySlug } from "@/lib/api/products";
import { notFound } from "next/navigation";
import { AddToCart } from "./components/AddToCart";
import { ProductInfo } from "./components/ProductInfo";
import { ReviewSection } from "./components/ReviewSection";
import { getProductImageUrls } from "@/lib/utils/productImages";

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const imageUrls = getProductImageUrls(product.slug, product.name);
  const reviews = product.reviews ?? [];

  return (
    <section className="page-stack product-detail-page">
      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-gallery__main">
            <img src={imageUrls[0]} alt={product.name} />
          </div>
          <div className="product-gallery__thumbs">
            {imageUrls.slice(1).map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt={`${product.name} view ${index + 2}`} />
            ))}
          </div>
        </div>

        <div className="product-detail-content">
          <div>
            {product.category && (
              <p className="product-detail-content__category">{product.category.name}</p>
            )}
            <h1>{product.name}</h1>
          </div>

          <ProductInfo description={product.description} price={product.price} stock={product.stock} reviews={reviews} />

          <div className="product-detail-content__purchase">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      <ReviewSection reviews={reviews} />
    </section>
  );
}
