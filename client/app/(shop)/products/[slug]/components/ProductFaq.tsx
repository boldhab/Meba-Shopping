export function ProductFaq() {
  return (
    <section className="product-faq panel">
      <p className="product-faq__eyebrow">Need help?</p>
      <h2>Frequently Asked Questions</h2>

      <div className="product-faq__list">
        <details className="product-faq__item" open>
          <summary>How fast is shipping?</summary>
          <p>Most orders are processed in 24 hours and delivered within 3-6 business days depending on location.</p>
        </details>
        <details className="product-faq__item">
          <summary>Can I return this product?</summary>
          <p>Yes, you can request a return within 7 days after delivery if the item is unused and in original condition.</p>
        </details>
        <details className="product-faq__item">
          <summary>Is this product authentic?</summary>
          <p>Yes, inventory is sourced through verified suppliers and checked before listing.</p>
        </details>
        <details className="product-faq__item">
          <summary>What if my order arrives damaged?</summary>
          <p>Contact support with photos within 48 hours of delivery, and we will arrange replacement or refund.</p>
        </details>
      </div>
    </section>
  );
}
