export default function FAQ() {
  const items = [
    ["Can I test without Stripe?", "Yes — test mode creates demo orders without charge."],
    ["Which credits are supported?", "ITC, PTC, 45Q, 48C, 48E (demo set)."],
    ["How do holds work?", "A 72-hour reserved quantity reduces available inventory."],
    ["Do you support accountants?", "Yes, invite clients and manage purchases."],
    ["Can I export data?", "CSV export for inventory and purchases."],
  ]
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-white text-2xl font-semibold">FAQ</h2>
      <div className="mt-6 space-y-4">
        {items.map(([q, a]) => (
          <details key={q} className="rounded-2xl bg-slate-900 ring-1 ring-white/10 p-5">
            <summary className="cursor-pointer text-gray-100 font-medium">{q}</summary>
            <p className="mt-2 text-gray-300">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
