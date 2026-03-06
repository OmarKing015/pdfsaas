"use client";

import { useState } from "react";
import PdfUpload from "@/components/pdf-upload";
import PdfList from "@/components/pdf-list";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-foreground">
              PDF Viewer
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload &amp; read documents in your browser
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Upload section */}
        <section>
          <PdfUpload onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Library section */}
        <section>
          <PdfList refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  );
}
