import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1220]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 text-gray-100">SuVerse</h1>
          <h2 className="text-3xl mb-4 text-gray-200">Tax Credit Dashboard</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-300">
            Discover, reserve, and purchase transferable tax credits (ITC, PTC, 45Q, 48C, 48E)
            for your business.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100 rounded-xl font-semibold transition"
            >
              Enter Dashboard
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-brand hover:bg-brand-dark text-black rounded-xl font-semibold transition"
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-100">Browse Credits</h3>
              <p className="text-gray-400">View available tax credits with transparent pricing and terms</p>
            </div>
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-100">Reserve & Purchase</h3>
              <p className="text-gray-400">Hold credits for 72 hours or purchase immediately</p>
            </div>
            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-100">Broker Support</h3>
              <p className="text-gray-400">Professional compliance and transfer assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
