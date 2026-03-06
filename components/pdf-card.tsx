"use client";

import { FileText, Trash2, Eye, Calendar, HardDrive } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { PdfFile } from "@/types/pdf";

interface PdfCardProps {
  pdf: PdfFile;
  onDelete: (pdf: PdfFile) => void;
  isDeleting: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PdfCard({ pdf, onDelete, isDeleting }: PdfCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Thumbnail area */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background transition-colors duration-200 group-hover:from-primary/15">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform duration-200 group-hover:scale-110">
          <FileText className="h-8 w-8" />
        </div>
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 text-xs font-semibold uppercase tracking-wide"
        >
          PDF
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-2">
        <p
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground"
          title={pdf.name}
        >
          {pdf.name}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(pdf.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatBytes(pdf.size)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 px-4 pb-4 pt-0">
        <Button asChild size="sm" className="flex-1 gap-1.5">
          <Link
            href={`/view?url=${encodeURIComponent(pdf.url)}&name=${encodeURIComponent(pdf.name)}`}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1.5"
          disabled={isDeleting}
          onClick={() => onDelete(pdf)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? "…" : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
