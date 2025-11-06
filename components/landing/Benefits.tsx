export default function Benefits() {
  const items = [
    { title: "Transparent Pricing", body: "Live discounts, min blocks, fees, all in one card." },
    { title: "Compliance-First", body: "KYC, W-9/ID, IRS transfer docs checklist in-app." },
    { title: "Fast Closing", body: "72-hour holds, purchase orders, auto PDFs." },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 grid gap-4 sm:grid-cols-3">
      {items.map(x => (
        <div key={x.title} className="rounded-2xl bg-slate-900 ring-1 ring-white/10 p-6 hover:ring-white/20">
          <h3 className="text-gray-100 font-semibold">{x.title}</h3>
          <p className="mt-2 text-gray-300">{x.body}</p>
        </div>
      ))}
    </section>
  )
}
