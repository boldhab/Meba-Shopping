export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <section className="page-stack">
      <h1>Category: {params.slug}</h1>
      <p>Category landing page placeholder.</p>
    </section>
  );
}
