"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiClient } from "@/lib/api/client";

export function BulkOperations() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleExport = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiClient.baseUrl}/admin/products/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (err) {
      alert("Failed to export products.");
    }
  };

  const handleImport = async () => {
    if (!token || !file) return;
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiClient.baseUrl}/admin/products/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Import failed.");
      
      const result = await response.json();
      setMessage({ type: "success", text: `Successfully imported ${result.count} products.` });
      setFile(null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to import products." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="panel form-stack">
      <div>
        <h2 className="m-0">Bulk Operations</h2>
        <p className="m-0 text-sm text-(--color-muted)">Export your catalog to CSV or import/update products in bulk.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-stack p-4 border border-dashed border-(--color-border) rounded-lg">
          <h3 className="text-sm font-bold">Export Catalog</h3>
          <p className="text-xs text-(--color-muted) mb-3">Download all products in CSV format for editing or backup.</p>
          <button onClick={handleExport} className="button bg-slate-800 text-white w-fit">
            Download CSV
          </button>
        </div>

        <div className="card-stack p-4 border border-dashed border-(--color-border) rounded-lg">
          <h3 className="text-sm font-bold">Import / Update</h3>
          <p className="text-xs text-(--color-muted) mb-3">Upload a CSV file to add new products or update existing ones by SKU/Slug.</p>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs mb-3"
          />
          <button 
            onClick={handleImport} 
            disabled={!file || isUploading} 
            className="button w-fit"
          >
            {isUploading ? "Uploading..." : "Start Import"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
