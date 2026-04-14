import { getProductBySlug } from "@/lib/api/products";
import { notFound } from "next/navigation";
import { AddToCart } from "./components/AddToCart";
import { ProductInfo } from "./components/ProductInfo";
import { ReviewSection } from "./components/ReviewSection";

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div className="relative aspect-square w-full rounded-3xl bg-zinc-100 overflow-hidden dark:bg-zinc-800 shadow-inner group">
          <div className="absolute inset-0 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform duration-700 ease-out">
            <span className="text-8xl">🛒</span>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            {product.category && (
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {product.category.name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 hidden">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>

          <ProductInfo description={product.description} price={product.price} />
          
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      <div className="mt-24">
        <ReviewSection productId={product.id} />
      </div>
    </section>
  );
}

