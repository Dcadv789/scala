"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#features" },
    { label: "Planos", href: "#pricing" },
    { label: "Integracoes", href: "#integrations" },
    { label: "Login", href: "/login" },
  ],
  recursos: [
    { label: "FAQ", href: "#faq" },
    { label: "Suporte", href: "mailto:suporte@scalazap.com.br" },
    { label: "Central de Ajuda", href: "#help" },
  ],
  legal: [
    { label: "Termos de Uso", href: "/termos" },
    { label: "Politica de Privacidade", href: "/privacidade" },
    { label: "LGPD", href: "/lgpd" },
  ],
}

export function FooterSection() {
  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-white/10">
      {/* Meta Partner Badge */}
      <div className="py-12 text-center border-b border-white/10">
        <div className="inline-flex flex-col items-center">
          <div className="bg-white rounded-xl p-4 mb-4">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 8C11.5 8 8.5 11 8.5 15C8.5 19 11.5 22 15.5 22C17.5 22 19.3 21.2 20.5 19.8V21.5H23.5V8.5H20.5V10.2C19.3 8.8 17.5 8 15.5 8ZM16 11C18.5 11 20.5 13 20.5 15.5C20.5 18 18.5 20 16 20C13.5 20 11.5 18 11.5 15.5C11.5 13 13.5 11 16 11Z" fill="#0866FF"/>
              <path d="M35 8C31.5 8 28.5 10.5 28.5 14.5V21.5H31.5V14.5C31.5 12.5 33 11 35 11C37 11 38.5 12.5 38.5 14.5V21.5H41.5V14.5C41.5 10.5 38.5 8 35 8Z" fill="#0866FF"/>
              <text x="45" y="18" fill="#0866FF" fontSize="12" fontWeight="bold">Meta</text>
            </svg>
            <div className="text-[10px] text-gray-500 mt-1">Business Partner</div>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Parceiro Oficial da Meta</h3>
          <p className="text-gray-400 text-sm max-w-md">
            ScalaZap utiliza a API Oficial do WhatsApp Business, garantindo acesso a tecnologia oficial e segura.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Scala<span className="text-primary">Zap</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Automatize suas vendas no WhatsApp com a API Oficial. Dispare mensagens em massa, gerencie conversas e integre com suas plataformas favoritas.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            2026 ScalaZap. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-sm">
            Feito para voce vender 10x mais
          </p>
        </div>
      </div>

    </footer>
  )
}
