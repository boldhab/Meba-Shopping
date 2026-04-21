import Link from "next/link";
import { Product } from "@/lib/api/products";
import { getProductImageUrls } from "@/lib/utils/productImages";

export function ProductCard({ product }: { product: Product }) {
  const [fallbackImage] = getProductImageUrls(product.slug, product.name);
  const coverImage = product.imageUrl ?? fallbackImage;
  const isOutOfStock = product.stock <= 0;
  const productHref = `/products/${product.slug || product.id}`;
  const activeDealType = product.isDealActive ? product.dealType : null;
  const dealLabel = activeDealType
    ? `${activeDealType.charAt(0)}${activeDealType.slice(1).toLowerCase()} Deal`
    : null;

  return (
    <Link href={productHref} className="product-card" aria-label={`View details for ${product.name}`}>
      <div className="product-card__media">
        <img className="product-card__image" src={coverImage} alt={product.name} loading="lazy" />
        {isOutOfStock && <span className="product-card__badge">Out of stock</span>}
        {dealLabel && <span className="product-card__badge">{dealLabel}</span>}
      </div>

      <div className="product-card__content">
        {product.category && (
          <p className="product-card__category">{product.category.name}</p>
        )}

        <h3 className="product-card__title">{product.name}</h3>

        <p className="product-card__description">{product.description ?? "Fresh and quality-selected item."}</p>
      </div>

      <div className="product-card__footer">
        <p className="product-card__price">${Number(product.price).toFixed(2)}</p>
        <p className="product-card__stock">{isOutOfStock ? "Unavailable" : `${product.stock} in stock`}</p>
      </div>
    </Link>
  );
}
