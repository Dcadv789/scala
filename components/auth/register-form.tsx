"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

// Create Supabase client
const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan") as "basico" | "professional" | "enterprise" | "starter" | "unlimited" | null

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Mapear os valores do URL para os valores internos
  const planMap: Record<string, "starter" | "professional" | "unlimited"> = {
    "basico": "starter",
    "professional": "professional",
    "enterprise": "unlimited",
    "starter": "starter",
    "unlimited": "unlimited"
  }
  
  const [plan] = useState<"starter" | "professional" | "unlimited">(
    planFromUrl ? (planMap[planFromUrl] || "starter") : "starter"
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Função para aplicar máscara de CPF/CNPJ
  const applyCpfCnpjMask = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Se tiver 11 dígitos ou menos, formata como CPF
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // Se tiver mais de 11 dígitos, formata como CNPJ
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .substring(0, 18) // Limita ao tamanho máximo do CNPJ
    }
  }

  // Função para aplicar máscara de WhatsApp
  const applyWhatsAppMask = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos (DDD + número)
    const limited = numbers.substring(0, 11)
    
    // Aplica máscara: (00) 00000-0000
    if (limited.length <= 2) {
      return limited ? `(${limited}` : limited
    } else if (limited.length <= 7) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2)}`
    } else {
      return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`
    }
  }

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCpfCnpjMask(e.target.value)
    setCpfCnpj(masked)
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyWhatsAppMask(e.target.value)
    setWhatsapp(masked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Check if membro already exists (Multi-Tenant)
      const { data: existingMembro } = await supabase
        .from("membros")
        .select("email")
        .eq("email", email)
        .eq("ativo", true)
        .single()
      
      if (existingMembro) {
        setError("Este email ja esta cadastrado. Faca login ou use outro email.")
        setLoading(false)
        return
      }
      
      // Buscar webhook URL via API route
      const webhookConfigResponse = await fetch('/api/config/webhook-free-link')
      
      if (!webhookConfigResponse.ok) {
        console.error("[Register] Erro ao buscar webhook URL:", webhookConfigResponse.status)
        setError("Erro ao processar registro. Tente novamente.")
        setLoading(false)
        return
      }
      
      const webhookConfig = await webhookConfigResponse.json()
      
      if (!webhookConfig?.webhook_url) {
        console.error("[Register] Webhook URL não encontrado")
        setError("Erro ao processar registro. Tente novamente.")
        setLoading(false)
        return
      }
      
      // Preparar dados para enviar no webhook
      const planFromUrl = searchParams.get("plan") as string
      const webhookData = {
        nome: name,
        email: email,
        whatsapp: whatsapp,
        cpf_cnpj: cpfCnpj,
        senha: password,
        plano_escolhido: planFromUrl || "basico",
        id_plano: "189vrewwfcws5",
        timestamp: new Date().toISOString()
      }
      
      // Enviar webhook
      try {
        console.log("[Register] Enviando webhook para:", webhookConfig.webhook_url)
        console.log("[Register] Dados:", webhookData)
        
        const webhookResponse = await fetch(webhookConfig.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        })
        
        if (!webhookResponse.ok) {
          console.error("[Register] Erro ao enviar webhook:", webhookResponse.status, webhookResponse.statusText)
          setError("Erro ao processar cadastro. Tente novamente.")
          setLoading(false)
          return
        }
        
        const responseData = await webhookResponse.text()
        console.log("[Register] ✅ Webhook enviado com sucesso:", responseData)
        
        // Redirecionar para página de sucesso
        router.push(`/register/success?nome=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`)
        
      } catch (webhookErr) {
        console.error("[Register] Erro ao enviar webhook:", webhookErr)
        setError("Erro ao processar cadastro. Tente novamente.")
        setLoading(false)
        return
      }
      
    } catch (err) {
      console.error("Registration error:", err)
      setError("Erro ao verificar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        padding: '40px 30px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '40px', 
          fontWeight: 'bold', 
          color: '#00bf63',
          marginBottom: '20px'
        }}>
          ScalaZap
        </h1>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '8px'
        }}>
          Criar conta
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Comece a enviar mensagens em massa agora
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626' }} />
          <span style={{ fontSize: '14px', color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Name Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="name" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00bf63'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>

        {/* Email Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00bf63'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>

        {/* WhatsApp Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="whatsapp" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="(00) 00000-0000"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            required
            autoComplete="tel"
            maxLength={15}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00bf63'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>

        {/* CPF/CNPJ Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="cpfCnpj" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            CPF/CNPJ
          </label>
          <input
            id="cpfCnpj"
            name="cpfCnpj"
            type="text"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            value={cpfCnpj}
            onChange={handleCpfCnpjChange}
            required
            maxLength={18}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00bf63'}
            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>

        {/* Password Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            Senha
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                paddingRight: '44px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: 'white',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00bf63'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#00bf63'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {showPassword ? (
                <EyeOff style={{ width: '20px', height: '20px' }} />
              ) : (
                <Eye style={{ width: '20px', height: '20px' }} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="confirmPassword" 
            style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151'
            }}
          >
            Confirmar senha
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                paddingRight: '44px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: 'white',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00bf63'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#00bf63'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {showConfirmPassword ? (
                <EyeOff style={{ width: '20px', height: '20px' }} />
              ) : (
                <Eye style={{ width: '20px', height: '20px' }} />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: loading ? '#9CA3AF' : '#00bf63',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginTop: '8px'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#00a855'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#00bf63'
          }}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        {/* Sign In Link */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
          Já tem uma conta?{' '}
          <Link 
            href="/login" 
            style={{ 
              fontWeight: '600', 
              color: '#00bf63', 
              textDecoration: 'none'
            }}
          >
            Fazer login
          </Link>
        </p>
      </form>
    </div>
  )
}
