import { ProductForm } from "../../components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="page-stack">
      <h1>Edit product #{id}</h1>
      <ProductForm productId={id} />
    </section>
  );
}
