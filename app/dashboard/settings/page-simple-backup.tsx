"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function SettingsPageSimple() {
  console.log('[SETTINGS SIMPLE] 🏗️ Componente montado')
  
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    console.log('[SETTINGS SIMPLE] ⚡ useEffect disparado')
    setLoaded(true)
    console.log('[SETTINGS SIMPLE] ✅ Loaded setado para true')
  }, [])

  console.log('[SETTINGS SIMPLE] 🖼️ Renderizando - loaded:', loaded)

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Settings Page - TESTE SIMPLES</h1>
          <p className="text-xl mb-4">Loaded: {loaded ? 'TRUE' : 'FALSE'}</p>
          <p className="text-muted-foreground">Se você vê isso, a página está funcionando!</p>
          <div className="mt-8 p-4 bg-card rounded-lg border">
            <p className="font-mono text-sm">Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

