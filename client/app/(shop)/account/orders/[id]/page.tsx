export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>Order #{params.id}</h1>
      <p>Order detail placeholder.</p>
    </section>
  );
}
