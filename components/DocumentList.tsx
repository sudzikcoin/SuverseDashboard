import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/format";

export default async function DocumentList({ 
  companyId, 
  userId 
}: { 
  companyId?: string; 
  userId?: string 
}) {
  const docs = await prisma.document.findMany({
    where: { 
      ...(companyId && { companyId }), 
      ...(userId && { userId }) 
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
            <span className="font-medium text-su-text">{d.name}</span>
            <div className="flex items-center gap-3 text-xs text-su-muted">
              <span className="inline-flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-su-emerald/20 text-su-emerald border border-su-emerald/40">
                  {d.type}
                </span>
              </span>
              <span suppressHydrationWarning>{formatNumber(d.size ?? 0)} bytes</span>
              <span>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
            </div>
            {d.notes && (
              <p className="text-xs text-su-muted italic">{d.notes}</p>
            )}
          </div>
          {d.url ? (
            <a 
              href={d.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-su-emerald/10 text-su-emerald hover:bg-su-emerald/20 transition font-medium text-sm border border-su-emerald/40"
            >
              Open
            </a>
          ) : (
            <span className="text-white/40 text-sm">no file</span>
          )}
        </div>
      ))}
    </div>
  );
}
