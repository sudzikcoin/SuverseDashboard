"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

interface Document {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  storagePath: string
  createdAt: string
}

interface DocumentManagerProps {
  companyId: string
  companyName: string
  onClose: () => void
}

export default function DocumentManager({
  companyId,
  companyName,
  onClose,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    fetchDocuments()
  }, [companyId])

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/documents/${companyId}`)
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      setStatus("Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setStatus("")

    try {
      const formElement = e.currentTarget
      const fileInput = formElement.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      
      if (!fileInput?.files || fileInput.files.length === 0) {
        setStatus("Please select at least one file")
        setUploading(false)
        return
      }

      const formData = new FormData()
      Array.from(fileInput.files).forEach((file) => {
        formData.append("file", file)
      })

      const res = await fetch(`/api/documents/${companyId}`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setStatus(`Successfully uploaded ${fileInput.files.length} file(s)`)
        fileInput.value = ""
        fetchDocuments()
      } else {
        setStatus(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading:", error)
      setStatus("Failed to upload documents")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return

    try {
      const res = await fetch(`/api/documents/${companyId}?id=${docId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setStatus("Document deleted")
        fetchDocuments()
      } else {
        const data = await res.json()
        setStatus(data.error || "Delete failed")
      }
    } catch (error) {
      console.error("Error deleting:", error)
      setStatus("Failed to delete document")
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/95 border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">
              Documents — {companyName}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Upload and manage client documents (PDF, PNG, JPG - max 10MB each)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 border-b border-white/10 bg-slate-800/50">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black file:font-semibold hover:file:bg-emerald-600 file:cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-semibold px-6 py-3 rounded-xl transition"
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
          </form>

          {status && (
            <div
              className={`mt-4 px-4 py-2 rounded-lg ${
                status.includes("Success") || status.includes("deleted")
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {status}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-lg">No documents yet</p>
              <p className="text-sm mt-2">Upload your first document above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {doc.mimeType === "application/pdf" ? (
                          <svg
                            className="w-8 h-8 text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-4 0h1.5a1 1 0 110 2H9.5v1h.5a1 1 0 110 2h-1a1 1 0 01-1-1v-3a1 1 0 011-1z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-8 h-8 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 font-medium truncate">
                          {doc.filename}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {formatBytes(doc.sizeBytes)} •{" "}
                          {format(new Date(doc.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={`/api/files?path=${encodeURIComponent(
                        doc.storagePath
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      className="text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
