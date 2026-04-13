import { CategoryManager } from "./components/CategoryManager";

export default function AdminCategoriesPage() {
  return (
    <section className="page-stack">
      <h1>Manage categories</h1>
      <CategoryManager />
    </section>
  );
}
