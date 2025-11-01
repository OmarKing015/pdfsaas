"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PdfUploader } from "@/components/pdf-uploader"
import { FileText, Calendar, Eye, RefreshCw } from "lucide-react"

interface PdfFile {
  id: string
  name: string
  url: string
  uploadedAt: string
  size: number
}

export default function DashboardPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([])
  const [showUploader, setShowUploader] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch PDFs from API
  const fetchPdfs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/getPdfs')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch PDFs')
      }
      
      setPdfs(data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDFs')
      console.error('Error fetching PDFs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load PDFs on component mount
  useEffect(() => {
    fetchPdfs()
  }, [])

  const handleFileUpload = (fileId: string, fileName: string) => {
    // Refresh the list after upload
    fetchPdfs()
    setShowUploader(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDF Annotator</h1>
              <p className="mt-2 text-gray-600">Upload, view, and annotate your PDF documents with ease</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchPdfs}
                variant="outline"
                size="lg"
                disabled={loading}
                className="hover:bg-gray-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowUploader(!showUploader)}
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                size="lg"
              >
                {showUploader ? "Cancel" : "+ Upload New PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Uploader Section */}
      {showUploader && (
        <div className="bg-blue-50 border-b px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New PDF</h2>
              <PdfUploader onUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      )}

      {/* PDF List */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 border border-red-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading PDFs</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <Button 
                  onClick={fetchPdfs} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Loading your PDFs...</h2>
            <p className="mt-2 text-gray-600">Please wait while we fetch your documents</p>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">No PDFs yet</h2>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Get started by uploading your first PDF document. You can then view, annotate, and edit it.
            </p>
            <Button
              onClick={() => setShowUploader(true)}
              className="mt-6 bg-blue-600 text-white hover:bg-blue-700"
            >
              Upload Your First PDF
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your PDF Documents</h2>
              <p className="text-sm text-gray-600">{pdfs.length} document{pdfs.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div className="col-span-6">Document</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {pdfs.map((pdf, index) => (
                <div key={pdf.id} className={`grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${index !== pdfs.length - 1 ? 'border-b' : ''}`}>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{pdf.name}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {(pdf.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(pdf.uploadedAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2">
                    <Link href={`/edit/${pdf.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
