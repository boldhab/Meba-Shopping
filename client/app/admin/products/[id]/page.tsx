export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="page-stack">
      <h1>Product record #{id}</h1>
      <p>Admin product detail placeholder.</p>
    </section>
  );
}
