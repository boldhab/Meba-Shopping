import { ProductTable } from "./components/ProductTable";

export default function AdminProductsPage() {
  return (
    <section className="page-stack">
      <h1>Manage products</h1>
      <ProductTable />
    </section>
  );
}
