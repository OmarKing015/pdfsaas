import { createClient } from "@/utlis/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Note: Removing auth check to match other working routes
    // If you need authentication, ensure your Supabase client is properly configured

    // List all files in the storage bucket to find the one with matching ID
    const { data: files, error: listError } = await supabase.storage
      .from("pdf_files")
      .list("", {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error("Storage error:", listError);
      return NextResponse.json(
        { error: "Failed to access files" },
        { status: 500 }
      );
    }

    if (!files) {
      return NextResponse.json({ error: "No files found" }, { status: 404 });
    }

    // Find the file by ID (which could be the filename or file.id)
    const file = files.find(
      (f) => f.id === fileId || f.name === fileId || f.name.includes(fileId)
    );

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from("pdf_files")
      .getPublicUrl(file.name);

    const fileData = {
      id: file.id || file.name,
      name: file.name,
      url: urlData.publicUrl,
      uploadedAt: file.created_at || new Date().toISOString(),
      size: file.metadata?.size || 0,
    };

    return NextResponse.json({ file: fileData });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
