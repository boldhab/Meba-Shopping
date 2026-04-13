import Link from "next/link";

export default function NotFound() {
  return (
    <section className="state-card">
      <h1>Page not found</h1>
      <p>The route you requested does not exist in the storefront yet.</p>
      <Link className="button" href="/">
        Back home
      </Link>
    </section>
  );
}
