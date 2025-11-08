"use client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

type FileItem = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
};

type Props = {
  title?: string;
};

export default function FileUpload({ title = "Upload Document" }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch files:", e);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMsg("Please select a file");
      return;
    }
    setBusy(true);
    setMsg("Uploading...");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      
      if (!res.ok) {
        setMsg(`Error: ${j.error || "Upload failed"}`);
      } else {
        setMsg("Uploaded successfully!");
        setFile(null);
        setFiles((prev) => [
          { name: j.name, url: j.url, size: j.size, updatedAt: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch (e) {
      setMsg("Upload failed");
      console.error("Upload error:", e);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;

    setDeleting(name);
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      
      if (res.status === 204) {
        setFiles((prev) => prev.filter((f) => f.name !== name));
      } else {
        alert("Delete failed");
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="glass rounded-2xl border border-white/10 p-4 backdrop-blur"
      >
        <h3 className="text-lg font-semibold mb-3 text-su-text">{title}</h3>
        <div className="grid gap-3">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-su-text file:mr-4 file:rounded-full file:border-0 file:bg-su-emerald file:px-4 file:py-2 file:text-white hover:file:bg-su-emerald/80 file:transition"
          />
          <button
            disabled={busy || !file}
            className="rounded-xl bg-su-emerald px-4 py-2 text-white font-medium disabled:opacity-50 hover:bg-su-emerald/90 transition glow-emerald"
          >
            {busy ? "Uploading..." : "Upload"}
          </button>
          {msg && <p className="text-sm text-su-text">{msg}</p>}
        </div>
      </form>

      {loading ? (
        <div className="glass rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-su-muted">Loading documents...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-su-muted">No documents yet.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {files.map((f) => (
            <div
              key={f.name}
              className="glass rounded-xl border border-white/10 px-4 py-3 flex justify-between items-center hover:border-su-emerald/30 transition"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-su-text">{f.name}</span>
                <div className="flex items-center gap-3 text-xs text-su-muted">
                  <span>{formatBytes(f.size)}</span>
                  <span suppressHydrationWarning>
                    {formatDistanceToNow(new Date(f.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/files/${encodeURIComponent(f.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-su-emerald/10 text-su-emerald hover:bg-su-emerald/20 transition font-medium text-sm border border-su-emerald/40"
                >
                  Open
                </a>

                <button
                  onClick={() => handleDelete(f.name)}
                  disabled={deleting === f.name}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition font-medium text-sm border border-red-400/40 disabled:opacity-50"
                >
                  {deleting === f.name ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
