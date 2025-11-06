export default function HowItWorks() {
  const steps = [
    ["Browse credits", "Filter by type, vintage, state, price."],
    ["Reserve or buy", "Place a 72-hour hold or pay now via Stripe."],
    ["Close", "Broker package + closing certificate in your inbox."],
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-white text-2xl font-semibold">How it works</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map(([t, b], i) => (
          <div key={t} className="rounded-2xl bg-slate-900 ring-1 ring-white/10 p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-slate-900 font-bold">{i+1}</span>
            <h3 className="mt-4 text-gray-100 font-semibold">{t}</h3>
            <p className="mt-2 text-gray-300">{b}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
