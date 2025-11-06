import Hero from "@/components/landing/Hero"
import TrustRow from "@/components/landing/TrustRow"
import Benefits from "@/components/landing/Benefits"
import HowItWorks from "@/components/landing/HowItWorks"
import RoleStrip from "@/components/landing/RoleStrip"
import FAQ from "@/components/landing/FAQ"
import Footer from "@/components/landing/Footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <TrustRow />
      <Benefits />
      <HowItWorks />
      <RoleStrip />
      <FAQ />
      <Footer />
    </main>
  )
}
