"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { MassDispatchSection } from "@/components/landing/mass-dispatch-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { DownloadPageSection } from "@/components/landing/download-page-section"
import { SignupSection } from "@/components/landing/signup-section"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)

  const sectionIds = ["inicio", "recursos", "disparos", "planos", "depoimentos", "download", "criar-conta"]

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sectionIds[index])
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = sectionIds.map(id => document.getElementById(id))
      const scrollPosition = window.scrollY + window.innerHeight / 3

      sections.forEach((section, index) => {
        if (section) {
          const sectionTop = section.offsetTop
          const sectionBottom = sectionTop + section.offsetHeight
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(index)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="relative min-h-screen w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      {/* Fixed Background */}
      {!isMobile ? (
        <div ref={shaderContainerRef} className="fixed inset-0 z-0" style={{ contain: "strict" }}>
          <Shader className="h-full w-full">
            <Swirl
              colorA="#111c21"
              colorB="#00bf63"
              speed={0.3}
              detail={0.3}
              blend={40}
              coarseX={10}
              coarseY={10}
              mediumX={10}
              mediumY={10}
              fineX={10}
              fineY={10}
            />
            <ChromaFlow
              baseColor="#111c21"
              upColor="#00bf63"
              downColor="#111c21"
              leftColor="#00bf63"
              rightColor="#00bf63"
              intensity={0.7}
              radius={1.5}
              momentum={20}
              maskType="alpha"
              opacity={0.9}
            />
          </Shader>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#111c21] via-[#0d1a1f] to-[#00bf63]">
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-md bg-background/10 transition-opacity duration-700 sm:px-6 sm:py-5 md:px-12 md:py-7 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection(0)}
          className="relative z-50 flex shrink-0 items-center transition-transform hover:scale-105"
        >
          <Image
            src="/zap-logo.png"
            alt="ScalaZap"
            width={180}
            height={80}
            className="h-8 w-auto sm:h-10 md:h-12"
            priority
          />
        </button>

        <div className="ml-4 hidden items-center gap-6 md:ml-8 lg:ml-12 lg:flex lg:gap-8">
          {["Inicio", "Recursos", "Disparos", "Planos", "Depoimentos", "Download", "Criar Conta"].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative whitespace-nowrap font-sans text-sm font-medium transition-colors ${
                activeSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  activeSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="ml-4 shrink-0">
          <MagneticButton variant="secondary" href="/login" trackEvent="ViewLogin">
            <span className="hidden sm:inline">Fazer Login</span>
            <span className="sm:hidden">Login</span>
          </MagneticButton>
        </div>
      </nav>

      {/* Main Content - Vertical Scroll */}
      <div
        className={`relative z-10 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div id="inicio">
          <HeroSection scrollToSection={scrollToSection} />
        </div>
        <div id="recursos">
          <FeaturesSection />
        </div>
        <div id="disparos">
          <MassDispatchSection />
        </div>
        <div id="planos">
          <PricingSection />
        </div>
        <div id="depoimentos">
          <TestimonialsSection />
        </div>
        <div id="download">
          <DownloadPageSection />
        </div>
        <div id="criar-conta">
          <SignupSection />
        </div>
      </div>
    </main>
  )
}
