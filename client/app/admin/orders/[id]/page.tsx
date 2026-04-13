export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>Admin order #{params.id}</h1>
      <p>Admin order detail placeholder.</p>
    </section>
  );
}
