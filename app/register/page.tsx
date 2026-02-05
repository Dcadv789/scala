"use client"

import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
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
      <RegisterForm />
    </div>
  )
}
