"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    const nomeParam = searchParams.get("nome")
    const emailParam = searchParams.get("email")
    
    if (nomeParam) setNome(decodeURIComponent(nomeParam))
    if (emailParam) setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #111c21, #0d1a1f, #00bf63)',
        padding: '20px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <div 
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00bf63, #00d470)',
            opacity: 0.1,
            filter: 'blur(40px)'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00bf63, #00d470)',
            opacity: 0.1,
            filter: 'blur(30px)'
          }}
        />

        {/* Success Icon */}
        <div 
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#00bf63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 10px 30px rgba(0, 191, 99, 0.3)'
          }}
        >
          <CheckCircle style={{ width: '60px', height: '60px', color: 'white' }} />
        </div>

        {/* Title */}
        <h1 
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px',
            position: 'relative',
            zIndex: 1
          }}
        >
          Parabéns! 🎉
        </h1>

        {/* Subtitle */}
        <p 
          style={{
            fontSize: '18px',
            color: '#6B7280',
            marginBottom: '30px',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 1
          }}
        >
          {nome ? (
            <>
              <strong style={{ color: '#00bf63' }}>{nome}</strong>, seu cadastro foi realizado com sucesso!
            </>
          ) : (
            'Seu cadastro foi realizado com sucesso!'
          )}
        </p>

        {/* Info Box */}
        <div 
          style={{
            backgroundColor: '#F0FDF4',
            border: '2px solid #00bf63',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#00bf63' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Próximos Passos
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
            Nossa equipe entrará em contato em breve no email <strong>{email || 'fornecido'}</strong> para 
            finalizar a ativação da sua conta e liberar todos os recursos do seu plano.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
          <Link
            href="/login"
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#00bf63',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 191, 99, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00a855'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 191, 99, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00bf63'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 99, 0.3)'
            }}
          >
            Fazer Login
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </Link>
          
          <Link
            href="/"
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'transparent',
              color: '#00bf63',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #00bf63',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0FDF4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Voltar para Home
          </Link>
        </div>

        {/* Footer Text */}
        <p 
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '30px',
            position: 'relative',
            zIndex: 1
          }}
        >
          Obrigado por escolher o ScalaZap! 🚀
        </p>
      </div>
    </div>
  )
}

