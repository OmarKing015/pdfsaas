import { getFilePathFromUrl } from "@/lib/pdf-storage";

export default async function ViewPdfPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; name?: string }>;
}) {
  const resolvedParams = await searchParams;
  const url = resolvedParams.url;
  const name = resolvedParams.name || "Document Viewer";

  if (!url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold">Error: No PDF URL provided</h1>
        <p className="mt-2 text-muted-foreground">
          Please return to the library and select a file to view.
        </p>
        <a
          href="/"
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Return to Library
        </a>
      </div>
    );
  }

  // Use an iframe to embed the browser's native PDF viewing engine
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Back to Library"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
          <h1 className="truncate text-sm font-semibold sm:max-w-md md:max-w-xl lg:max-w-3xl">
            {name}
          </h1>
        </div>
      </header>

      <main className="flex-1 bg-zinc-100 dark:bg-zinc-900">
        <iframe
          src={`${url}#view=FitH`}
          className="h-full w-full border-0"
          title={`PDF Viewer: ${name}`}
        />
      </main>
    </div>
  );
}
