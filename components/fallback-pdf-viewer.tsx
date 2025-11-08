"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Download } from "lucide-react"

interface FallbackPdfViewerProps {
  pdfUrl: string
  fileName: string
}

export function FallbackPdfViewer({ pdfUrl, fileName }: FallbackPdfViewerProps) {
  const [iframeError, setIframeError] = useState(false)

  const handleIframeError = () => {
    setIframeError(true)
  }

  if (iframeError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">PDF Preview Not Available</h3>
          <p className="text-gray-600">
            This PDF cannot be displayed in the browser. You can download it to view with your preferred PDF reader.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href={pdfUrl} download={fileName}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-white">
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title={`PDF Viewer - ${fileName}`}
        onError={handleIframeError}
        onLoad={(e) => {
          // Check if iframe loaded successfully
          try {
            const iframe = e.target as HTMLIFrameElement
            if (!iframe.contentDocument && !iframe.contentWindow) {
              handleIframeError()
            }
          } catch (err) {
            handleIframeError()
          }
        }}
      />
    </div>
  )
}