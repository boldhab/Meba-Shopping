"use client";

import { useEffect, useMemo } from "react";

type ImageUploadProps = {
  label: string;
  file: File | null;
  existingImageUrl?: string;
  required?: boolean;
  productName?: string;
  onChange: (file: File | null) => void;
};

export function ImageUpload({
  label,
  file,
  existingImageUrl,
  required,
  productName,
  onChange,
}: ImageUploadProps) {
  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }

    return existingImageUrl ?? "";
  }, [existingImageUrl, file]);

  useEffect(() => {
    if (!file) {
      return;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [file, previewUrl]);

  return (
    <label className="label-stack">
      <span>{label}</span>
      <input
        className="input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        required={required}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] ?? null;
          onChange(selectedFile);
        }}
      />

      {previewUrl ? (
        <div className="label-stack">
          <span>{file ? "Selected image" : "Current image"}</span>
          <img
            src={previewUrl}
            alt={`${productName ?? "Product"} preview`}
            className="max-h-40 w-auto rounded-lg border border-(--color-border)"
          />
        </div>
      ) : null}
    </label>
  );
}
