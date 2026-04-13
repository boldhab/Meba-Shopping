import { OrderTable } from "./components/OrderTable";

export default function AdminOrdersPage() {
  return (
    <section className="page-stack">
      <h1>Manage orders</h1>
      <OrderTable />
    </section>
  );
}
