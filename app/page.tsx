"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { NewHero } from "@/components/landing/new-hero"
import { FeaturesMarquee } from "@/components/landing/features-marquee"
import { CentralizedFeatures } from "@/components/landing/centralized-features"
import { AllFeatures } from "@/components/landing/all-features"
import { Automations } from "@/components/landing/automations"
import { FeaturesTabs } from "@/components/landing/features-tabs"
import { CTASection } from "@/components/landing/cta-section"
import { NewPricing } from "@/components/landing/new-pricing"
import { NewFooter } from "@/components/landing/new-footer"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  const scrollToSection = (index: number) => {
    const sections = ["inicio", "funcionalidades", "recursos", "automacoes", "tabs", "planos"]
    const element = document.getElementById(sections[index])
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#00bf63] to-[#00d470]">
      
      {/* Navigation */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-md bg-gradient-to-r from-[#00bf63] to-[#00d470] border-b border-black/10 transition-opacity duration-700 sm:px-6 sm:py-5 md:px-12 md:py-7 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection(0)}
          className="flex items-center gap-2 text-xl font-bold text-[#0d1a1f] md:text-2xl"
        >
          <span>ScalaZap</span>
        </button>

        {/* Desktop Navigation */}
        <div className="ml-4 hidden items-center gap-6 md:ml-8 lg:ml-12 lg:flex lg:gap-8">
          {["Início", "Funcionalidades", "Recursos", "Automações", "Integrações", "Planos"].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative whitespace-nowrap font-sans text-sm font-medium transition-colors ${
                activeSection === index ? "text-[#0d1a1f]" : "text-[#0d1a1f]/80 hover:text-[#0d1a1f]"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-[#0d1a1f] transition-all duration-300 ${
                  activeSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
          <a
            href="/login"
            className="rounded-full bg-[#0d1a1f] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0d1a1f]/90"
          >
            Entrar
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative z-50 ml-4 flex items-center justify-center rounded-lg bg-[#0d1a1f]/20 p-2 backdrop-blur-sm transition-colors hover:bg-[#0d1a1f]/30 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-[#0d1a1f]" />
          ) : (
            <Menu className="h-6 w-6 text-[#0d1a1f]" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0d1a1f]/95 backdrop-blur-lg lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
            {["Início", "Funcionalidades", "Recursos", "Automações", "Integrações", "Planos"].map((item, index) => (
              <button
                key={item}
                onClick={() => scrollToSection(index)}
                className="text-2xl font-medium text-white transition-colors hover:text-white/80"
              >
                {item}
              </button>
            ))}
            <a
              href="/login"
              className="mt-4 rounded-full bg-white px-8 py-3 text-lg font-medium text-[#0d1a1f] transition-colors hover:bg-white/90"
            >
              Entrar
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        
        {/* Hero - Verde */}
        <div id="inicio">
          <NewHero />
        </div>

        {/* Carrossel de Funcionalidades - Escuro */}
        <div className="bg-[#0d1a1f]">
          <FeaturesMarquee />
        </div>

        {/* Funcionalidades Centralizadas - Escuro */}
        <div id="funcionalidades" className="bg-[#0d1a1f]">
          <CentralizedFeatures />
        </div>

        {/* Todas as Funcionalidades - Verde */}
        <div id="recursos" className="bg-gradient-to-br from-[#00bf63] to-[#00d470]">
          <AllFeatures />
        </div>

        {/* Automações - Escuro */}
        <div id="automacoes" className="bg-[#0d1a1f]">
          <Automations />
        </div>

        {/* Tabs - Verde */}
        <div id="tabs" className="bg-gradient-to-br from-[#00bf63] to-[#00d470]">
          <FeaturesTabs />
        </div>

        {/* CTA Intermediário - Escuro */}
        <div className="bg-[#0d1a1f]">
          <CTASection />
        </div>

        {/* Planos - Verde */}
        <div id="planos" className="bg-gradient-to-br from-[#00bf63] to-[#00d470]">
          <NewPricing />
        </div>

      </main>

      {/* Footer - Escuro */}
      <NewFooter />

    </div>
  )
}
