export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack">
      <h1>User #{params.id}</h1>
      <p>User detail placeholder.</p>
    </section>
  );
}
