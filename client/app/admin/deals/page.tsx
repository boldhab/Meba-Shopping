import { DealsManager } from "./components/DealsManager";

export default function AdminDealsPage() {
  return (
    <section className="page-stack">
      <h1>Manage deals</h1>
      <p>Configure Daily, Weekly, Clearance, and Ceremony deals for products.</p>
      <DealsManager />
    </section>
  );
}
