import { getProductBySlug, getProducts, ProductReview } from "@/lib/api/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "./components/ProductGallery";
import { AddToCart } from "./components/AddToCart";
import { ProductInfo } from "./components/ProductInfo";
import { ReviewSection } from "./components/ReviewSection";
import { ProductFaq } from "./components/ProductFaq";
import { ProductQA } from "./components/ProductQA";
import { RelatedProducts } from "./components/RelatedProducts";
import { Rating } from "@/components/ui/Rating";
import { ShieldCheck, Truck, RotateCcw, ChevronRight, ShoppingBag } from "lucide-react";

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

  const imageUrls = product.imageUrl ? [product.imageUrl] : [];
  const reviews = product.reviews ?? [];
  const averageRating = calculateAverageRating(reviews);
  const primaryCategory = product.category?.name ?? "Supermarket";
  const primaryCategorySlug = product.category?.slug ?? "all";

  const relatedResult = product.categoryId
    ? await getProducts({ categoryId: product.categoryId, limit: "8" })
    : { items: [], total: 0 };

  const relatedProducts = relatedResult.items
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/categories/${primaryCategorySlug}`} className="hover:text-blue-600 transition-colors">
          {primaryCategory}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Gallery (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <ProductGallery imageUrls={imageUrls} productName={product.name} />
        </div>

        {/* Right Column: Buy Box & Product Info (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <Link
              href={`/categories/${primaryCategorySlug}`}
              className="text-xs font-extrabold text-blue-600 uppercase tracking-widest hover:underline block mb-1.5"
            >
              {primaryCategory}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating & Availability Header Strip */}
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <a href="#reviews" className="flex items-center gap-1.5 hover:underline">
                {averageRating ? (
                  <Rating value={averageRating} size="sm" showValue reviewCount={reviews.length} />
                ) : (
                  <span className="text-slate-400 font-medium">No reviews yet</span>
                )}
              </a>

              <span className="text-slate-300">•</span>

              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                  product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Pricing, Description & Sizing Specs */}
          <ProductInfo
            description={product.description}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            discountPercent={product.discountPercent}
            dealType={product.dealType}
            isDealActive={product.isDealActive}
            stock={product.stock}
            reviewCount={reviews.length}
          />

          {/* Buy Buttons & Bundle Selectors */}
          <AddToCart product={product} />
        </div>
      </div>

      {/* Customer Trust Strip */}
      <section className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-orange-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Express Addis Delivery</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Free standard shipping on orders over 1,000 ETB. Prompt courier dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Authentic Fresh Sourcing</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Direct partnerships with verified Ethiopian farmers, roasters, and suppliers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">7-Day Guarantee</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Hassle-free replacement or refund if any perishable or sealed item arrives damaged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <ReviewSection productId={product.id} reviews={reviews} averageRating={averageRating} />
      </section>

      {/* Q&A and FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <ProductFaq />
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <ProductQA productId={product.id} />
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Frequently Bought Together</h2>
              <p className="text-xs text-slate-500">Customers who bought this also ordered</p>
            </div>
            <Link
              href={`/categories/${primaryCategorySlug}`}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View more in {primaryCategory} →
            </Link>
          </div>
          <RelatedProducts products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
