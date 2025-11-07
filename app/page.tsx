import Hero from "@/components/landing/Hero"
import TrustRow from "@/components/landing/TrustRow"
import Benefits from "@/components/landing/Benefits"
import HowItWorks from "@/components/landing/HowItWorks"
import RoleStrip from "@/components/landing/RoleStrip"
import FAQ from "@/components/landing/FAQ"
import Footer from "@/components/landing/Footer"
import CalculatorCard from "@/components/CalculatorCard"
import Section from "@/components/ui/Section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Hero />
      <TrustRow />
      
      <Section>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-su-text mb-3">
            Calculate Your Savings
          </h2>
          <p className="text-su-muted text-lg">
            See how much you can save with transferable tax credits
          </p>
        </div>
        <CalculatorCard compact />
      </Section>

      <Benefits />
      <HowItWorks />
      <RoleStrip />
      <FAQ />
      <Footer />
    </main>
  )
}
