export default function RoleStrip() {
  const roles = [
    ["Company (Buyer)", "/register", "Create account"],
    ["Accountant", "/register", "Invite clients"],
    ["Admin", "/login", "Sign in"],
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 grid gap-4 sm:grid-cols-3">
      {roles.map(([r, href, cta]) => (
        <a key={r} href={href} className="rounded-2xl bg-slate-900 ring-1 ring-white/10 p-6 hover:ring-white/20">
          <h3 className="text-gray-100 font-semibold">{r}</h3>
          <p className="mt-2 text-gray-300">Role-based dashboards and permissions.</p>
          <span className="mt-4 inline-block rounded-full bg-emerald-500 text-slate-900 px-4 py-2 font-medium">{cta}</span>
        </a>
      ))}
    </section>
  )
}
