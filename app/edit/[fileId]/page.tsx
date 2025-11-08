"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { FallbackPdfViewer } from "@/components/fallback-pdf-viewer"

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
  const [useFallbackViewer, setUseFallbackViewer] = useState(false)
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

    let viewerInstance: any = null

    const validatePdfFile = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        
        // Check if it's actually a PDF
        if (!contentType?.includes('pdf') && !url.toLowerCase().endsWith('.pdf')) {
          console.warn('File does not appear to be a PDF')
          return false
        }
        
        // Check if file is too large (over 50MB might cause issues)
        if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
          console.warn('PDF file is very large and might cause issues')
        }
        
        return true
      } catch (err) {
        console.warn('Could not validate PDF file:', err)
        return true // Allow loading anyway
      }
    }

    const loadNutrientViewer = async () => {
      try {
        // Validate the PDF file first
        const isValidPdf = await validatePdfFile(pdfFile.url)
        if (!isValidPdf) {
          setError('This file format is not supported by the PDF viewer.')
          return
        }

        // Wait for DOM to be ready and NutrientViewer to be available
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            window.addEventListener('load', () => resolve(true))
          }
        })

        // Add a small delay to ensure everything is properly initialized
        await new Promise(resolve => setTimeout(resolve, 100))

        if (typeof window !== 'undefined' && (window as any).NutrientViewer && containerRef.current) {
          // Clear any existing content
          containerRef.current.innerHTML = ''

          // Add error handling for Nutrient Viewer initialization
          viewerInstance = await (window as any).NutrientViewer.load({
            container: containerRef.current,
            document: pdfFile.url,
            baseUrl: `${window.location.protocol}//${window.location.host}/`,
            // Add configuration to handle problematic PDFs
            initialViewState: {
              zoom: 'auto'
            },
            // Enable error recovery
            enableAnnotations: true,
            enableFormFilling: true,
          }).catch((nutrientError: any) => {
            console.error('Nutrient Viewer failed to load PDF:', nutrientError)
            
            // Check if it's the specific "matches" error
            if (nutrientError.message?.includes('matches') || nutrientError.toString().includes('matches')) {
              throw new Error('This PDF file has a format that is not compatible with the advanced viewer. The file may be corrupted or use unsupported features.')
            }
            
            throw new Error(`PDF viewer error: ${nutrientError.message || 'Unknown error'}`)
          })
        } else {
          console.error('NutrientViewer not available')
          setError('PDF viewer not loaded. Please refresh the page.')
        }
      } catch (err) {
        console.error('Failed to load Nutrient Viewer:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        
        if (errorMessage.includes('matches') || errorMessage.includes('not compatible')) {
          console.log('Falling back to basic PDF viewer due to compatibility issues')
          setUseFallbackViewer(true)
        } else {
          console.log('Falling back to basic PDF viewer due to error:', errorMessage)
          setUseFallbackViewer(true)
        }
      }
    }

    loadNutrientViewer()

    return () => {
      try {
        if (viewerInstance && typeof viewerInstance.unload === 'function') {
          viewerInstance.unload()
        } else if (typeof window !== 'undefined' && (window as any).NutrientViewer && containerRef.current) {
          (window as any).NutrientViewer.unload(containerRef.current)
        }
      } catch (err) {
        console.warn('Error during cleanup:', err)
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
              onClick={() => router.push('/dashboard')}
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
              onClick={() => router.push('/dashboard')}
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
            onClick={() => router.push('/dashboard')}
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
          {!useFallbackViewer && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setUseFallbackViewer(true)}
              className="hover:bg-gray-50"
            >
              Use Basic Viewer
            </Button>
          )}
          {useFallbackViewer && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setUseFallbackViewer(false)
                // Reset any errors when switching back
                setError(null)
              }}
              className="hover:bg-gray-50"
            >
              Use Advanced Viewer
            </Button>
          )}
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
        {useFallbackViewer ? (
          <FallbackPdfViewer pdfUrl={pdfFile.url} fileName={pdfFile.name} />
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full bg-white"
            style={{
              height: "calc(100vh - 120px)",
              width: "100%",
            }}
          />
        )}
      </div>
    </div>
  )
}