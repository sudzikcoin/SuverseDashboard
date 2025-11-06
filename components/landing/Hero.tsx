export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,197,94,0.15),transparent)]" />
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/30 px-3 py-1 text-emerald-300 text-xs">
          Broker-Verified • Role-Based • Stripe Ready
        </span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tight text-white">SuVerse</h1>
        <p className="mt-2 text-2xl text-gray-300">Tax Credit Dashboard</p>
        <p className="mt-6 text-gray-300 max-w-3xl mx-auto">
          Discover, reserve, and purchase transferable tax credits (ITC, PTC, 45Q, 48C, 48E) with transparent pricing and a broker-verified closing flow.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/register" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 font-medium shadow-xl">Sign Up</a>
          <a href="/login" className="rounded-full ring-1 ring-white/20 hover:ring-white/40 text-white px-6 py-3 font-medium">Enter Dashboard</a>
          <a href="/marketplace" className="rounded-full hover:bg-white/5 text-gray-200 px-6 py-3 font-medium">See Inventory</a>
        </div>
      </div>
    </section>
  )
}
