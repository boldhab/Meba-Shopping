"use client";

import { useState } from "react";

export function ProductGallery({
  imageUrls,
  productName,
}: {
  imageUrls: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(imageUrls[0] ?? "");

  if (imageUrls.length === 0) {
    return (
      <section className="product-gallery panel" aria-label={`${productName} image gallery`}>
        <div className="product-gallery__main flex items-center justify-center rounded-[28px] border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-sm text-(--color-muted)">
          No product image has been uploaded yet.
        </div>
      </section>
    );
  }

  return (
    <section className="product-gallery panel" aria-label={`${productName} image gallery`}>
      <div className="product-gallery__main">
        <img src={selectedImage} alt={productName} />
      </div>

      <div className="product-gallery__thumbs" aria-label="Product previews">
        {imageUrls.map((url, index) => {
          const isSelected = selectedImage === url;

          return (
            <button
              key={`${url}-${index}`}
              className={`product-gallery__thumb ${isSelected ? "is-selected" : ""}`}
              type="button"
              onClick={() => setSelectedImage(url)}
              aria-label={`View ${productName} image ${index + 1}`}
              data-selected={isSelected}
            >
              <img src={url} alt="" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}