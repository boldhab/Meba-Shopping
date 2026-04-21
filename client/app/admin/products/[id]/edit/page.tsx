import { ProductForm } from "../../components/ProductForm";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>Edit product #{params.id}</h1>
      <ProductForm productId={params.id} />
    </section>
  );
}
