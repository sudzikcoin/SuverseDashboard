export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-gray-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} SuVerse. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/login" className="hover:text-gray-200">Dashboard</a>
          <a href="/marketplace" className="hover:text-gray-200">Inventory</a>
          <a href="/register" className="hover:text-gray-200">Sign Up</a>
        </div>
      </div>
    </footer>
  )
}
