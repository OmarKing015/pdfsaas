import { createClient } from "@/utlis/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    console.log('Debug API - Looking for fileId:', fileId);
    
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get all files
    const { data: files, error: listError } = await supabase.storage
      .from('pdf_files')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (listError) {
      return NextResponse.json({ 
        error: listError.message,
        fileId,
        files: []
      }, { status: 500 });
    }

    const pdfFiles = (files || [])
      .filter(file => file.name.toLowerCase().endsWith('.pdf'))
      .map(file => {
        const { data: urlData } = supabase.storage
          .from('pdf_files')
          .getPublicUrl(file.name);

        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          uploadedAt: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || 0,
        };
      });

    const matchedFile = pdfFiles.find(f => f.id === fileId || f.name === fileId);

    return NextResponse.json({
      searchingFor: fileId,
      found: !!matchedFile,
      matchedFile: matchedFile || null,
      allFiles: pdfFiles.map(f => ({ id: f.id, name: f.name })),
      totalFiles: pdfFiles.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: `Debug error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}