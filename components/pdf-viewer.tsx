"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"

interface DrawingState {
  tool: "pencil" | "eraser"
  color: string
  thickness: number
}

interface PdfViewerProps {
  fileId: string
  drawingState: DrawingState
}

export function PdfViewer({ fileId, drawingState }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingContext, setDrawingContext] = useState<CanvasRenderingContext2D | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
  }, [])

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true)
        setError(null)

        const pdfUrl = getPdfUrl(fileId)
        if (!pdfUrl) {
          setError("PDF not found")
          setLoading(false)
          return
        }

        const pdf = await pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        }).promise

        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading PDF:", error)
        setError("Failed to load PDF")
        setLoading(false)
      }
    }

    loadPdf()
  }, [fileId])

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc) return

      try {
        const page = await pdfDoc.getPage(currentPage)
        const viewport = page.getViewport({ scale })

        const canvas = pdfCanvasRef.current
        if (!canvas) return

        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise

        // Update drawing canvas size to match
        const drawingCanvas = drawingCanvasRef.current
        if (drawingCanvas) {
          drawingCanvas.width = viewport.width
          drawingCanvas.height = viewport.height
          const drawCtx = drawingCanvas.getContext("2d")
          if (drawCtx) {
            setDrawingContext(drawCtx)
          }
        }
      } catch (error) {
        console.error("[v0] Error rendering page:", error)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, scale])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingContext) return
    setIsDrawing(true)

    const rect = drawingCanvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    drawingContext.beginPath()
    drawingContext.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingContext) return

    const rect = drawingCanvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (drawingState.tool === "eraser") {
      drawingContext.clearRect(
        x - drawingState.thickness / 2,
        y - drawingState.thickness / 2,
        drawingState.thickness,
        drawingState.thickness,
      )
    } else {
      drawingContext.strokeStyle = drawingState.color
      drawingContext.lineWidth = drawingState.thickness
      drawingContext.lineCap = "round"
      drawingContext.lineJoin = "round"
      drawingContext.lineTo(x, y)
      drawingContext.stroke()
    }
  }

  const stopDrawing = () => {
    if (!drawingContext) return
    setIsDrawing(false)
    drawingContext.closePath()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col items-center justify-start overflow-auto bg-muted/30 p-4">
      {/* PDF Display */}
      <div className="relative mb-4">
        {/* PDF Canvas */}
        <canvas ref={pdfCanvasRef} className="relative z-0 block bg-white shadow-lg" />

        {/* Drawing Canvas (overlay) */}
        <canvas
          ref={drawingCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute left-0 top-0 z-10 cursor-crosshair"
        />
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded px-3 py-1 hover:bg-muted disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded px-3 py-1 hover:bg-muted disabled:opacity-50"
        >
          Next
        </button>
        <span className="ml-4">|</span>
        <button onClick={() => setScale(Math.max(0.5, scale - 0.2))} className="rounded px-3 py-1 hover:bg-muted">
          Zoom Out
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(Math.min(3, scale + 0.2))} className="rounded px-3 py-1 hover:bg-muted">
          Zoom In
        </button>
      </div>
    </div>
  )
}

function getPdfUrl(fileId: string): string | null {
  const pdfUrls: Record<string, string> = {
    "5": "https://www.cs.cmu.edu/~guyb/realworld/slidespdf/Strang.pdf", // Linear Algebra textbook
    "1": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", // Sample PDF
    "2": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    "3": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    "4": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
  }

  return pdfUrls[fileId] || null
}
