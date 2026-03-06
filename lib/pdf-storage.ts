import { supabase } from "./supabase";
import type { PdfFile } from "@/types/pdf";

const BUCKET = "pdfs";

/**
 * Upload a PDF file to Supabase Storage.
 * The file is stored under its original name (with timestamp prefix to avoid collisions).
 * Returns the public URL of the uploaded file.
 */
export async function uploadPdf(file: File): Promise<PdfFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${timestamp}_${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    contentType: "application/pdf",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return {
    name: file.name,
    url: urlData.publicUrl,
    createdAt: new Date().toISOString(),
    size: file.size,
  };
}

/**
 * List all PDF files in the Supabase Storage bucket.
 * Returns an array of PdfFile objects with public URLs.
 */
export async function listPdfs(): Promise<PdfFile[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 200,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) throw new Error(`List failed: ${error.message}`);
  if (!data) return [];

  return data
    .filter((item) => !item.id?.startsWith(".")) // exclude placeholder files
    .map((item) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(item.name);
      // Strip the timestamp prefix from display name
      const displayName = item.name.replace(/^\d+_/, "").replace(/_/g, " ");
      return {
        name: displayName,
        url: urlData.publicUrl,
        createdAt: item.created_at ?? new Date().toISOString(),
        size: item.metadata?.size ?? 0,
      };
    });
}

/**
 * Delete a PDF file from Supabase Storage by its storage path (filename including timestamp prefix).
 */
export async function deletePdf(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Extract the storage path (filename) from a full public URL.
 * Used to get the path needed for deletion.
 */
export function getFilePathFromUrl(url: string): string {
  const parts = url.split(`/object/public/${BUCKET}/`);
  return parts[1] ?? url;
}
