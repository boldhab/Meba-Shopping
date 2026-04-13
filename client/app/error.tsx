"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="state-card">
      <h1>Something went wrong</h1>
      <p>{error.message || "An unexpected error interrupted the page."}</p>
      <button className="button" onClick={reset} type="button">
        Try again
      </button>
    </section>
  );
}
