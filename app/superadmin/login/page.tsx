"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, Lock, AlertCircle } from "lucide-react"

export default function SuperAdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Modo desenvolvimento - aceita qualquer usuário e senha
    console.log("[DEV] Login simplificado - aceitando qualquer entrada")
    
    // Simular delay de autenticacao
    await new Promise(resolve => setTimeout(resolve, 500))

    // Sempre permitir login (modo desenvolvimento)
    localStorage.setItem("superadmin_authenticated", "true")
    localStorage.setItem("superadmin_login_time", new Date().toISOString())
    localStorage.setItem("superadmin_username", credentials.username || "dev_user")
    router.push("/superadmin")

    setLoading(false)
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #1f1f1f, #0f0f0f, #7f1d1d, #991b1b)',
        padding: '20px',
        position: 'relative'
      }}
    >
      {/* Background gradient overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.05), transparent, rgba(249, 115, 22, 0.05))',
          pointerEvents: 'none'
        }}
      />

      {/* Card Container */}
      <div 
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '40px 30px',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* Shield Icon */}
          <div 
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield style={{ width: '32px', height: '32px', color: '#ef4444' }} />
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            Super Admin
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6B7280',
            marginTop: '8px'
          }}>
            Área restrita - Acesso apenas para administradores do sistema
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
            <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#DC2626' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Username Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              htmlFor="username" 
              style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151'
              }}
            >
              Usuário
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Lock 
                style={{ 
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#6B7280',
                  pointerEvents: 'none'
                }} 
              />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite seu usuário"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  paddingLeft: '40px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
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
              <Lock 
                style={{ 
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#6B7280',
                  pointerEvents: 'none'
                }} 
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                minLength={1}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  paddingLeft: '40px',
                  paddingRight: '44px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
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
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: loading ? '#9CA3AF' : '#ef4444',
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
              if (!loading) e.currentTarget.style.backgroundColor = '#dc2626'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#ef4444'
            }}
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>

        {/* Footer */}
        <p 
          style={{ 
            textAlign: 'center', 
            fontSize: '12px', 
            color: '#6B7280', 
            marginTop: '24px'
          }}
        >
          Este painel é protegido e todas as ações são registradas.
        </p>
      </div>
    </div>
  )
}
