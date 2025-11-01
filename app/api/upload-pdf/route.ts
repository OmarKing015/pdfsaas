import { createClient } from "@/utlis/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("PDF upload API called");

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedName}`;

    console.log(`Uploading file: ${fileName}, size: ${file.size} bytes`);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdf_files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);

      if (
        uploadError.message.includes("row-level security") ||
        uploadError.message.includes("policy")
      ) {
        return NextResponse.json(
          {
            error: "Permission denied. Please check storage bucket policies.",
            needsRLSSetup: true,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from("pdf_files")
      .getPublicUrl(fileName);

    console.log("File uploaded successfully:", uploadData.path);

    return NextResponse.json({
      success: true,
      file: {
        id: uploadData.id || fileName,
        name: file.name,
        fileName: fileName,
        url: urlData.publicUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        path: uploadData.path,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Unexpected upload error:", error);
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
