export default function TrustRow() {
  const items = ["SOC-style Logs", "Audit Trail", "Email Receipts", "PDF Certificates"]
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 flex flex-wrap items-center justify-center gap-3">
      {items.map(x => (
        <span key={x} className="rounded-full bg-white/5 text-gray-300 ring-1 ring-white/10 px-3 py-1">{x}</span>
      ))}
    </section>
  )
}
