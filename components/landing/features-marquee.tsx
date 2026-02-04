"use client"

import { 
  Users, 
  Target, 
  BarChart3, 
  Send, 
  MessageSquare, 
  Calendar, 
  Zap, 
  Bot, 
  Brain,
  Shield,
  Clock,
  Webhook,
  FileText,
  TrendingUp,
  UserPlus,
  Mail,
  Bell,
  Archive,
  Tag,
  Filter,
  Download,
  Upload,
  Phone,
  Video,
  Mic,
  Image,
  File,
  Settings,
  CheckCircle2,
  AlertCircle,
  Star
} from "lucide-react"

const features = [
  { icon: Users, label: "Atendentes" },
  { icon: Target, label: "Campanhas" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Send, label: "Envios em Massa" },
  { icon: MessageSquare, label: "Chat ao Vivo" },
  { icon: Calendar, label: "Agendamentos" },
  { icon: Zap, label: "Respostas Rápidas" },
  { icon: Bot, label: "Robôs" },
  { icon: Brain, label: "Inteligência Artificial" },
  { icon: Shield, label: "API Oficial Meta" },
  { icon: Clock, label: "Atendimento 24/7" },
  { icon: Webhook, label: "Webhooks" },
  { icon: FileText, label: "Templates" },
  { icon: TrendingUp, label: "Métricas" },
  { icon: UserPlus, label: "Gestão de Equipe" },
  { icon: Mail, label: "E-mail Marketing" },
  { icon: Bell, label: "Notificações" },
  { icon: Archive, label: "Histórico" },
  { icon: Tag, label: "Etiquetas" },
  { icon: Filter, label: "Filtros Avançados" },
  { icon: Download, label: "Exportação" },
  { icon: Upload, label: "Importação" },
  { icon: Phone, label: "Chamadas" },
  { icon: Video, label: "Vídeos" },
  { icon: Mic, label: "Áudios" },
  { icon: Image, label: "Imagens" },
  { icon: File, label: "Documentos" },
  { icon: Settings, label: "Configurações" },
  { icon: CheckCircle2, label: "Validação" },
  { icon: AlertCircle, label: "Alertas" },
  { icon: Star, label: "Favoritos" },
]

export function FeaturesMarquee() {
  // Duplicar o array para criar o efeito de loop infinito
  const duplicatedFeatures = [...features, ...features]

  return (
    <section className="relative w-full overflow-hidden py-12">
      
      {/* Gradientes nas laterais para efeito de fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#0d1a1f] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#0d1a1f] to-transparent" />

      {/* Título da seção */}
      <div className="mb-8 text-center">
        <h3 className="font-sans text-lg font-semibold text-white/80 md:text-xl">
          Tudo que você precisa em uma única plataforma
        </h3>
      </div>

      {/* Container do Marquee */}
      <div className="relative">
        <div className="flex animate-marquee gap-4">
          {duplicatedFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={`${feature.label}-${index}`}
                className="group flex w-auto items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-all group-hover:scale-110 group-hover:bg-white/20">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="whitespace-nowrap font-medium text-white">
                  {feature.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </section>
  )
}

