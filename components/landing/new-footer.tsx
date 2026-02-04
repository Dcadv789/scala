"use client"

import Link from "next/link"
import { Linkedin } from "lucide-react"

const footerLinks = {
  funcionalidades: [
    { label: "Dashboard", href: "#" },
    { label: "Contatos", href: "#" },
    { label: "Campanhas", href: "#" },
    { label: "Robôs", href: "#" },
    { label: "Grupos de contatos", href: "#" },
    { label: "Departamentos", href: "#" },
    { label: "Atendentes", href: "#" },
  ],
  planos: [
    { label: "Business", href: "#" },
    { label: "Premium", href: "#" },
    { label: "Enterprise", href: "#" },
  ],
  empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Suporte", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Programa de Afiliação", href: "#" },
  ],
}

export function NewFooter() {
  return (
    <footer className="relative w-full border-t border-white/10 bg-[#0d1a1f] px-4 py-16 sm:px-6 md:px-12">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Top Section */}
        <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">ScalaZap</h3>
            <p className="mb-6 text-sm text-white/70">
              Aumente seus resultados e eleve o atendimento do seu negócio a outro nível.
            </p>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          {/* Funcionalidades */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Funcionalidades</h4>
            <ul className="space-y-2">
              {footerLinks.funcionalidades.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Planos */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Planos</h4>
            <ul className="space-y-2">
              {footerLinks.planos.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/70">
            @2025 ScalaZap
          </p>
          <Link
            href="#"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            Ver Planos
          </Link>
        </div>

      </div>
    </footer>
  )
}

