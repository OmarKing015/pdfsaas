"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadPdf } from "@/lib/pdf-storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PdfUploadProps {
  onUploadSuccess: () => void;
}

export default function PdfUpload({ onUploadSuccess }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (f) => f.type === "application/pdf",
      );
      if (pdfFiles.length === 0) {
        toast.error("Only PDF files are accepted.");
        return;
      }

      setUploading(true);
      try {
        await Promise.all(pdfFiles.map((file) => uploadPdf(file)));
        toast.success(
          pdfFiles.length === 1
            ? `"${pdfFiles[0].name}" uploaded successfully.`
            : `${pdfFiles.length} files uploaded successfully.`,
        );
        onUploadSuccess();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled: uploading,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "group relative cursor-pointer border-2 border-dashed transition-all duration-300",
        isDragActive || dragActive
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/60 hover:bg-muted/30",
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 px-8 text-center">
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragActive
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-primary/10 text-primary group-hover:bg-primary/20",
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isDragActive ? (
            <FileText className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {uploading
              ? "Uploading…"
              : isDragActive
                ? "Drop your PDFs here"
                : "Drag & drop PDFs here"}
          </p>
          <p className="text-sm text-muted-foreground">
            {uploading ? "Please wait" : "or click to browse files · PDF only"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
