export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <section className="page-stack">
      <h1>Category: {slug}</h1>
      <p>Category landing page placeholder.</p>
    </section>
  );
}
