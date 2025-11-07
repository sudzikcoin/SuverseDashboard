"use client";
import { useState } from "react";

type Props = {
  title?: string;
  companyId?: string;
  defaultType?: string;
  onUploadComplete?: () => void;
};

export default function FileUpload({ 
  title = "Upload Document", 
  companyId, 
  defaultType = "KYC",
  onUploadComplete 
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState(defaultType);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    if (companyId) fd.append("companyId", companyId);
    if (notes) fd.append("notes", notes);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(`Error: ${j.error ? JSON.stringify(j.error) : "Upload failed"}`);
    } else {
      setMsg("Uploaded ✓");
      setFile(null);
      setNotes("");
      onUploadComplete?.();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl border border-white/10 p-4 backdrop-blur">
      <h3 className="text-lg font-semibold mb-3 text-su-text">{title}</h3>
      <div className="grid gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-su-text file:mr-4 file:rounded-full file:border-0 file:bg-su-emerald file:px-4 file:py-2 file:text-white hover:file:bg-su-emerald/80 file:transition"
        />
        <div className="flex gap-2">
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Type (e.g., W9, KYC, POA)"
            className="flex-1 rounded-xl bg-black/20 px-3 py-2 text-su-text placeholder:text-white/45 outline-none border border-white/10 focus:border-su-emerald/50 transition"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 rounded-xl bg-black/20 px-3 py-2 text-su-text placeholder:text-white/45 outline-none border border-white/10 focus:border-su-emerald/50 transition"
          />
        </div>
        <button
          disabled={busy || !file}
          className="rounded-xl bg-su-emerald px-4 py-2 text-white font-medium disabled:opacity-50 hover:bg-su-emerald/90 transition glow-emerald"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
        {msg && <p className="text-sm text-su-text">{msg}</p>}
      </div>
    </form>
  );
}
