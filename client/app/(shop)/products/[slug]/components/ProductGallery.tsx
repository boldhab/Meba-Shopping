"use client";

import { useState } from "react";
import { getProductPlaceholderImage } from "@/lib/utils/productImages";
import { ShoppingBag, ZoomIn } from "lucide-react";

export function ProductGallery({
  imageUrls,
  productName,
}: {
  imageUrls: string[];
  productName: string;
}) {
  const validImages = imageUrls.filter(Boolean);
  const initialImage = validImages[0] ?? getProductPlaceholderImage();
  const [selectedImage, setSelectedImage] = useState(initialImage);

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4" aria-label={`${productName} image gallery`}>
      {/* Main Image Box */}
      <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={productName}
            onError={() => setSelectedImage(getProductPlaceholderImage())}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <ShoppingBag className="w-16 h-16 stroke-[1.5]" />
            <span className="text-xs text-slate-400 mt-2">No product image uploaded</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/80 backdrop-blur-md shadow-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>

      {/* Thumbnails (if multiple images) */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1" aria-label="Product preview thumbnails">
          {validImages.map((url, index) => {
            const isSelected = selectedImage === url;
            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setSelectedImage(url)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-100 scale-105"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
                aria-label={`View ${productName} image ${index + 1}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}