export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-12 text-su-muted border-t border-white/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">© {new Date().getFullYear()} SuVerse. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/login" className="hover:text-su-emerald transition text-sm">Dashboard</a>
          <a href="/marketplace" className="hover:text-su-emerald transition text-sm">Inventory</a>
          <a href="/register" className="hover:text-su-emerald transition text-sm">Sign Up</a>
        </div>
      </div>
    </footer>
  )
}
