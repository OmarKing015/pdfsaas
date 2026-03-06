"use client";

import { useEffect, useState } from "react";
import { RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PdfCard from "@/components/pdf-card";
import { listPdfs, deletePdf, getFilePathFromUrl } from "@/lib/pdf-storage";
import { toast } from "sonner";
import type { PdfFile } from "@/types/pdf";

interface PdfListProps {
  refreshTrigger: number;
}

export default function PdfList({ refreshTrigger }: PdfListProps) {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const data = await listPdfs();
      setPdfs(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, [refreshTrigger]);

  const handleDelete = async (pdf: PdfFile) => {
    setDeletingUrl(pdf.url);
    try {
      const filePath = getFilePathFromUrl(pdf.url);
      await deletePdf(filePath);
      setPdfs((prev) => prev.filter((p) => p.url !== pdf.url));
      toast.success(`"${pdf.name}" deleted.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Library</h2>
          {!loading && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {pdfs.length} {pdfs.length === 1 ? "file" : "files"}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPdfs}
          disabled={loading}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No PDFs yet</p>
            <p className="text-xs text-muted-foreground">
              Upload a file above to get started
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pdfs.map((pdf) => (
              <PdfCard
                key={pdf.url}
                pdf={pdf}
                onDelete={handleDelete}
                isDeleting={deletingUrl === pdf.url}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
