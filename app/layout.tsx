import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ScalaZap - Disparos em Massa WhatsApp com API Oficial",
  description:
    "Sistema completo de disparos em massa no WhatsApp usando a API Oficial do Meta. Envie milhares de mensagens, gerencie conversas em tempo real, crie templates aprovados e escale suas vendas com seguranca e sem risco de bloqueio.",
  keywords: [
    "disparo whatsapp",
    "api oficial whatsapp",
    "disparo em massa",
    "whatsapp business api",
    "envio em massa whatsapp",
    "automacao whatsapp",
    "mensagens em massa",
    "marketing whatsapp",
    "chat ao vivo whatsapp",
    "templates whatsapp",
    "scalazap",
  ],
  authors: [{ name: "ScalaZap" }],
  creator: "ScalaZap",
  publisher: "ScalaZap",
  generator: "v0.app",
  manifest: "/manifest.json",
  metadataBase: new URL("https://scalazap.com"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://scalazap.com",
    siteName: "ScalaZap",
    title: "ScalaZap - Disparos em Massa WhatsApp com API Oficial",
    description:
      "Sistema completo de disparos em massa no WhatsApp usando a API Oficial do Meta. Envie milhares de mensagens sem risco de bloqueio.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "ScalaZap Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScalaZap - Disparos em Massa WhatsApp com API Oficial",
    description:
      "Sistema completo de disparos em massa no WhatsApp usando a API Oficial do Meta.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ScalaZap",
    startupImage: "/icon-512.png",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
