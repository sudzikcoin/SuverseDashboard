"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DocumentsPanelProps {
  company: any
}

interface ShareData {
  url: string
  expiresAt: string
  ttlSeconds: number
}

export default function DocumentsPanel({ company }: DocumentsPanelProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState(company.documents || [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PDF, PNG, and JPG files are allowed")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/clients/${company.id}/documents`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const newDoc = {
          id: data.id,
          filename: data.name,
          sizeBytes: data.size,
          mimeType: data.mime,
          createdAt: data.createdAt,
        }
        setDocuments([newDoc, ...documents])
        router.refresh()
      } else {
        const data = await res.json()
        setUploadError(data.error || "Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError("Failed to upload file")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setDocuments(documents.filter((doc: any) => doc.id !== docId))
        setPreviewDoc(null)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Failed to delete document")
    }
  }

  const handleOpen = (doc: any) => {
    setPreviewDoc(doc)
    setShareData(null)
  }

  const handleShare = async (docId: string, ttlSeconds: number = 3600) => {
    setIsSharing(true)
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ttlSeconds }),
      })

      if (res.ok) {
        const data = await res.json()
        setShareData(data)
      } else {
        const data = await res.json()
        alert(data.error || "Failed to generate share link")
      }
    } catch (error) {
      console.error("Error generating share link:", error)
      alert("Failed to generate share link")
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = () => {
    if (shareData?.url) {
      navigator.clipboard.writeText(shareData.url)
      alert("Link copied to clipboard!")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Documents</h2>
        
        <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-6">
          <label className="flex flex-col items-center cursor-pointer">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-100 font-semibold mb-1">
              {isUploading ? "Uploading..." : "Click to upload"}
            </span>
            <span className="text-sm text-gray-400">PDF, PNG, or JPG (max 10MB)</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              disabled={isUploading}
            />
          </label>
          {uploadError && (
            <p className="text-red-400 text-sm mt-3 text-center">{uploadError}</p>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No documents uploaded yet
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  {doc.mimeType === "application/pdf" ? (
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-100 font-medium truncate">{doc.filename}</p>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(doc.sizeBytes)} • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleOpen(doc)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  Open
                </button>
                <button
                  onClick={() => handleShare(doc.id)}
                  className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  Share
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">{previewDoc.filename}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {formatFileSize(previewDoc.sizeBytes)} • {previewDoc.mimeType}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewDoc(null)
                  setShareData(null)
                }}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              <iframe
                src={`/api/files?id=${previewDoc.id}`}
                className="w-full h-full rounded-lg border border-white/10"
                title={previewDoc.filename}
              />
            </div>

            <div className="p-6 border-t border-white/10 space-y-4">
              {shareData ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">
                      Share link (expires {new Date(shareData.expiresAt).toLocaleString()})
                    </p>
                    <button
                      onClick={copyShareLink}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="bg-black/30 rounded px-3 py-2 font-mono text-sm text-gray-300 overflow-x-auto">
                    {shareData.url}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleShare(previewDoc.id)}
                  disabled={isSharing}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-black font-semibold px-6 py-3 rounded-lg transition"
                >
                  {isSharing ? "Generating..." : "Generate Share Link (1 hour)"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
