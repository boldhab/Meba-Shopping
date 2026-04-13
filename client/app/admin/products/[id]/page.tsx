export default function AdminProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>Product record #{params.id}</h1>
      <p>Admin product detail placeholder.</p>
    </section>
  );
}
