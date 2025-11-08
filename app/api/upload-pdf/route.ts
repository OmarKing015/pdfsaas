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

    // Relaxed file type validation - accept if file exists and has reasonable name
    const hasValidExtension = file.name.toLowerCase().endsWith(".pdf");
    const hasValidMimeType = file.type.includes("pdf") || file.type === "application/octet-stream";
    
    if (!hasValidExtension && !hasValidMimeType) {
      // Only reject if it's clearly not a PDF
      const suspiciousExtensions = ['.txt', '.doc', '.docx', '.jpg', '.png', '.gif'];
      const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (hasSuspiciousExtension) {
        return NextResponse.json(
          { error: "Only PDF files are allowed" },
          { status: 400 }
        );
      }
    }

    // Relaxed file size validation (max 50MB instead of 10MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // Basic file validation - just ensure it's not empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File appears to be empty" },
        { status: 400 }
      );
    }

    // Optional PDF validation - only warn, don't reject
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Check PDF magic number (%PDF) - but don't reject if missing
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      if (pdfHeader !== '%PDF') {
        console.warn(`File ${file.name} may not be a valid PDF (missing PDF header)`);
        // Don't reject - let the viewer handle it
      }

      // Check if file is suspiciously small
      if (buffer.byteLength < 50) {
        console.warn(`File ${file.name} is very small (${buffer.byteLength} bytes)`);
        // Don't reject - might be a minimal PDF
      }
    } catch (validationError) {
      console.warn("PDF validation warning:", validationError);
      // Don't reject - continue with upload
    }

    // Generate unique filename to avoid conflicts with fallback handling
    const timestamp = Date.now();
    let originalName = file.name || "uploaded_file";
    
    // Ensure the file has a .pdf extension
    if (!originalName.toLowerCase().endsWith('.pdf')) {
      originalName += '.pdf';
    }
    
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedName}`;

    console.log(`Uploading file: ${fileName}, original: ${file.name}, size: ${file.size} bytes`);

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
        name: file.name || "uploaded_file.pdf",
        fileName: fileName,
        url: urlData.publicUrl,
        size: file.size || 0,
        uploadedAt: new Date().toISOString(),
        path: uploadData.path,
        // Add metadata for debugging
        originalMimeType: file.type || "unknown",
        processedSuccessfully: true,
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
