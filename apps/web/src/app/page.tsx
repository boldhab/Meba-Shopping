const quickLinks = [
  "Browse products",
  "Manage cart",
  "Checkout orders",
  "Admin dashboard"
];

export default function HomePage() {
  return (
    <main className="hero">
      <section className="hero__content">
        <p className="hero__eyebrow">Meba Supermarket System</p>
        <h1>Full-stack grocery commerce starter workspace</h1>
        <p className="hero__description">
          This project is organized for customer shopping, order processing,
          inventory control, and admin operations.
        </p>
        <ul className="hero__list">
          {quickLinks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

