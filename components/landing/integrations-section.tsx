"use client"

import { Badge } from "@/components/ui/badge"

const integrations = [
  { name: "Hotmart", color: "#F04E23", letter: "H" },
  { name: "Kiwify", color: "#8B5CF6", letter: "K" },
  { name: "Eduzz", color: "#FF6B00", letter: "E" },
  { name: "Monetizze", color: "#00D4AA", letter: "M" },
  { name: "Braip", color: "#7C3AED", letter: "B" },
  { name: "Yampi", color: "#FF4785", letter: "Y" },
  { name: "Hubla", color: "#22C55E", letter: "H" },
  { name: "PerfectPay", color: "#3B82F6", letter: "P" },
  { name: "Ticto", color: "#EF4444", letter: "T" },
  { name: "Greenn", color: "#10B981", letter: "G" },
  { name: "Pepper", color: "#F97316", letter: "P" },
  { name: "Lastlink", color: "#6366F1", letter: "L" },
  { name: "Stripe", color: "#635BFF", letter: "S" },
  { name: "PagSeguro", color: "#41BF47", letter: "PS" },
  { name: "Mercado Pago", color: "#00BCFF", letter: "MP" },
  { name: "Asaas", color: "#1E40AF", letter: "A" },
]

export function IntegrationsSection() {
  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            {integrations.length}+ Integracoes Disponiveis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Conecte com suas plataformas favoritas
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Integracao nativa com as principais plataformas de infoprodutos, gateways de 
            pagamento e e-commerces do mercado
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110 group-hover:shadow-lg"
                style={{ backgroundColor: integration.color }}
                title={integration.name}
              >
                {integration.letter}
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                {integration.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            E muito mais... Novas integracoes adicionadas constantemente
          </p>
        </div>
      </div>
    </section>
  )
}
