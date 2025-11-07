import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/format";

export default async function DocumentList({ 
  companyId, 
  uploadedById 
}: { 
  companyId: string; 
  uploadedById?: string 
}) {
  const docs = await prisma.document.findMany({
    where: { 
      companyId,
      ...(uploadedById && { uploadedById }) 
    },
    orderBy: { createdAt: "desc" },
  });

  if (!docs.length) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-6 text-center">
        <p className="text-su-muted">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {docs.map(d => (
        <div 
          key={d.id} 
          className="glass rounded-xl border border-white/10 px-4 py-3 flex justify-between items-center hover:border-su-emerald/30 transition"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-su-text">{d.filename}</span>
            <div className="flex items-center gap-3 text-xs text-su-muted">
              <span className="inline-flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-su-emerald/20 text-su-emerald border border-su-emerald/40">
                  {d.mimeType}
                </span>
              </span>
              <span suppressHydrationWarning>{formatNumber(d.sizeBytes)} bytes</span>
              <span>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <a 
            href={`/api/files?path=${encodeURIComponent(d.storagePath)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-su-emerald/10 text-su-emerald hover:bg-su-emerald/20 transition font-medium text-sm border border-su-emerald/40"
          >
            Open
          </a>
        </div>
      ))}
    </div>
  );
}
