"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface PdfUploaderProps {
  onUpload?: (fileId: string, fileName: string) => void
}

export function PdfUploader({ onUpload }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Reset states
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadedFile(null)

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus('error')
      setErrorMessage("Please select a PDF file")
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setUploadStatus('error')
      setErrorMessage("File size must be less than 10MB")
      return
    }

    setIsLoading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Success
      setUploadStatus('success')
      setUploadedFile({
        name: data.file.name,
        url: data.file.url
      })

      // Call the onUpload callback if provided
      if (onUpload) {
        onUpload(data.file.id, data.file.name)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetUploader = () => {
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
        isDragging ? "border-blue-400 bg-blue-50 scale-[1.02]" : 
        uploadStatus === 'success' ? "border-green-400 bg-green-50" :
        uploadStatus === 'error' ? "border-red-400 bg-red-50" :
        "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".pdf" 
        onChange={handleFileSelect} 
        className="hidden" 
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Uploading your PDF...</p>
            <p className="mt-2 text-sm text-gray-600">Please wait while we process and store your document</p>
          </div>
        </div>
      ) : uploadStatus === 'success' ? (
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-green-800">Upload Successful!</p>
            <p className="mt-1 text-sm text-green-700 font-medium">{uploadedFile?.name}</p>
            <p className="mt-1 text-sm text-green-600">Your PDF is ready to view and annotate</p>
            {uploadedFile?.url && (
              <a 
                href={uploadedFile.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              >
                View Document →
              </a>
            )}
          </div>
          <Button
            onClick={resetUploader}
            variant="outline"
            className="mt-4 hover:bg-gray-50"
          >
            Upload Another File
          </Button>
        </div>
      ) : uploadStatus === 'error' ? (
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-red-800">Upload Failed</p>
            <p className="mt-1 text-sm text-red-700 font-medium">{errorMessage}</p>
            <p className="mt-1 text-sm text-red-600">Please check your file and try again</p>
          </div>
          <Button
            onClick={resetUploader}
            variant="outline"
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
            <Upload className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">Drop your PDF here</p>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your PDF file, or click the button below to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm px-6 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose PDF File
          </Button>
        </div>
      )}
    </div>
  )
}