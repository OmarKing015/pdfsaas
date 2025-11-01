"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2 } from "lucide-react"

interface PdfFile {
  id: string
  name: string
  url: string
  uploadedAt: string
  size: number
}

export default function EditorPage({ params }: { params: Promise<{ fileId: string }> }) {
  const router = useRouter()
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Resolve params and fetch file data
  useEffect(() => {
    const initializeFile = async () => {
      try {
        const resolvedParams = await params
        const id = resolvedParams.fileId
        setFileId(id)

        const response = await fetch(`/api/files/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch file')
        }

        const data = await response.json()
        setPdfFile(data.file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch file')
      } finally {
        setLoading(false)
      }
    }

    initializeFile()
  }, [params])
  // Initialize Nutrient Viewer when file is loaded
  useEffect(() => {
    if (!pdfFile?.url || !containerRef.current) return

    const loadNutrientViewer = async () => {
      try {
        // Wait for NutrientViewer to be available
        if (typeof window !== 'undefined' && (window as any).NutrientViewer) {
          await (window as any).NutrientViewer.load({
            container: containerRef.current,
            document: pdfFile.url,
          })
        } else {
          console.error('NutrientViewer not available')
          setError('PDF viewer not loaded')
        }
      } catch (err) {
        console.error('Failed to load Nutrient Viewer:', err)
        setError('Failed to load PDF viewer')
      }
    }

    loadNutrientViewer()

    return () => {
      if (typeof window !== 'undefined' && (window as any).NutrientViewer && containerRef.current) {
        (window as any).NutrientViewer.unload(containerRef.current)
      }
    }
  }, [pdfFile])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 shadow-lg border-0 bg-white">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Loading PDF</h3>
              <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your document...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 shadow-lg border-0 bg-white max-w-md">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 text- w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 shadow-lg border-0 bg-white max-w-md">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">File not found</h2>
              <p className="text-gray-600 mt-2">The PDF file you're looking for doesn't exist or has been removed.</p>
            </div>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.push('/')} 
            variant="ghost" 
            size="sm"
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {pdfFile.name}
            </h1>
            <p className="text-sm text-gray-500">
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild className="hover:bg-gray-50">
            <a href={pdfFile.url} download={pdfFile.name}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-full bg-white"
          style={{
            height: "calc(100vh - 120px)",
            width: "100%",
          }}
        />
      </div>
    </div>
  )
}