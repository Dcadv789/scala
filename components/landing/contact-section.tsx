"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    // TODO: Implement form submission logic
  }

  return (
    <section className="flex min-h-screen w-screen shrink-0 items-center justify-center px-4 py-20 sm:px-6 md:px-12">
      <div className="w-full max-w-2xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Comece agora
          </h2>
          <p className="mx-auto max-w-2xl text-base text-foreground/80 md:text-lg">
            Preencha o formulário e nossa equipe entrará em contato em até 24 horas
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm md:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              WhatsApp
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">
              Mensagem
            </Label>
            <Textarea
              id="message"
              placeholder="Conte-nos sobre sua necessidade..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Enviar mensagem
          </Button>
        </form>
      </div>
    </section>
  )
}
