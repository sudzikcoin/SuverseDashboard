import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">SuVerse</h1>
          <h2 className="text-3xl mb-4">Tax Credit Dashboard</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Discover, reserve, and purchase transferable tax credits (ITC, PTC, 45Q, 48C, 48E)
            for your business.
          </p>

          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Enter Dashboard
            </Link>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Browse Credits</h3>
              <p>View available tax credits with transparent pricing and terms</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Reserve & Purchase</h3>
              <p>Hold credits for 72 hours or purchase immediately</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Broker Support</h3>
              <p>Professional compliance and transfer assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
