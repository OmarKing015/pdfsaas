import { createClient } from "@/utlis/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface PdfFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export async function GET() {
  try {
    console.log("API called - getting PDFs");

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Try to list files in the pdf_files bucket
    const { data: files, error: listError } = await supabase.storage
      .from("pdf_files")
      .list("", {
        limit: 100,
        offset: 0,
      });

    if (listError) {
      console.error("Error listing files:", listError);

      // Check if it's an RLS error
      if (
        listError.message.includes("row-level security") ||
        listError.message.includes("policy")
      ) {
        return NextResponse.json(
          {
            error: "Row Level Security policy violation",
            message:
              "You need to create RLS policies for the storage bucket or disable RLS",
            files: [],
            needsRLSSetup: true,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: listError.message,
          files: [],
        },
        { status: 500 }
      );
    }

    if (!files) {
      return NextResponse.json({
        files: [],
        message: "No files found in pdf_files bucket",
      });
    }

    console.log("Files found:", files.length);

    // Filter and transform PDF files
    const pdfFiles: PdfFile[] = files
      .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
      .map((file) => {
        const { data: urlData } = supabase.storage
          .from("pdf_files")
          .getPublicUrl(file.name);

        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          uploadedAt: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || 0,
        };
      });

    return NextResponse.json({
      files: pdfFiles,
      bucket: "pdf_files",
      totalFiles: files.length,
      pdfCount: pdfFiles.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
