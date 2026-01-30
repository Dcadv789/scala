"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    name: "Gabriel Arnone",
    role: "Agencia Digital",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    metric: "20 clientes atendidos",
    metricColor: "bg-green-500",
    content: "Gerencio 20 contas de clientes com um painel. Escalei sem contratar.",
    rating: 5,
  },
  {
    name: "Mariana Santos",
    role: "Loja Virtual",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 23.000/mes",
    metricColor: "bg-orange-500",
    content: "Recupero em media 35% dos carrinhos abandonados. ROI absurdo.",
    rating: 5,
  },
  {
    name: "Thiago Mendes",
    role: "PLR Digital",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 18.500/mes",
    metricColor: "bg-green-500",
    content: "Automatizei as respostas dos meus produtos PLR e tripliquei as vendas.",
    rating: 5,
  },
  {
    name: "Camila Ribeiro",
    role: "Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    metric: "+127% agendamentos",
    metricColor: "bg-red-500",
    content: "Meus clientes agendam consultas pelo WhatsApp 24h. Nunca perco lead.",
    rating: 5,
  },
  {
    name: "Bruno Almeida",
    role: "Suplementos",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 52.000 recuperados",
    metricColor: "bg-green-500",
    content: "Recuperei mais de 50 mil em carrinhos abandonados em 3 meses.",
    rating: 5,
  },
  {
    name: "Eduardo Moraes",
    role: "Infoprodutor",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 47.000 recuperados",
    metricColor: "bg-green-500",
    content: "Em 2 meses o ScalaZap pagou 1 ano de assinatura so com carrinhos abandonados.",
    rating: 5,
  },
  {
    name: "Ricardo Lima",
    role: "Mentor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    metric: "+89% engajamento",
    metricColor: "bg-green-500",
    content: "Meus alunos recebem lembretes automaticos. Nunca perco uma aula.",
    rating: 5,
  },
  {
    name: "Fernanda Oliveira",
    role: "Consultora",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 32.000/mes",
    metricColor: "bg-green-500",
    content: "Automatizei todo meu atendimento. Agora foco so em fechar vendas.",
    rating: 5,
  },
  {
    name: "Juliana Martins",
    role: "Moda Feminina",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    metric: "+340% respostas",
    metricColor: "bg-orange-500",
    content: "Antes eu perdia clientes por nao responder rapido. Agora vendo dormindo.",
    rating: 5,
  },
  {
    name: "Rafael Souza",
    role: "Cursos Online",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    metric: "+R$ 28.000/mes",
    metricColor: "bg-green-500",
    content: "O remarketing automatico recupera alunos que desistiram na hora do pix.",
    rating: 5,
  },
  {
    name: "Patricia Gomes",
    role: "Estetica",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    metric: "+95% conversao",
    metricColor: "bg-green-500",
    content: "Minha clinica lota toda semana. O WhatsApp faz o trabalho pesado.",
    rating: 5,
  },
  {
    name: "Lucas Ferreira",
    role: "Dropshipping",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
    metric: "+200% vendas",
    metricColor: "bg-green-500",
    content: "A automacao faz o trabalho de 3 atendentes. Economizei muito.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative w-full px-3 py-16 sm:px-4 md:px-8 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-7xl">
          <div className="mb-4 text-center">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-2 text-[10px]">
              Resultados Reais
            </Badge>
            <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Quem Usa, <span className="text-primary">Aprova</span>
            </h2>
          </div>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-lg border border-foreground/10 bg-foreground/5 p-2 backdrop-blur-sm hover:border-foreground/20 transition-colors"
              >
                {/* Header with photo and info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-[10px] truncate">{testimonial.name}</p>
                    <p className="text-[9px] text-foreground/60 truncate">{testimonial.role}</p>
                  </div>
                </div>

                {/* Metric Badge */}
                <Badge className={`${testimonial.metricColor} text-white border-0 text-[9px] mb-1.5 px-1.5 py-0`}>
                  {testimonial.metric}
                </Badge>

                {/* Content */}
                <p className="text-[10px] leading-tight text-foreground/80 mb-1.5 line-clamp-2">
                  "{testimonial.content}"
                </p>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
