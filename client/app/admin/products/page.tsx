import { ProductTable } from "./components/ProductTable";
import { BulkOperations } from "./components/BulkOperations";

export default function AdminProductsPage() {
  return (
    <section className="page-stack">
      <BulkOperations />
      <ProductTable />
    </section>
  );
}
