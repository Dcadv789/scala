"use client"

import type React from "react"
import { useRef } from "react"
import Link from "next/link"

declare global {
  interface Window {
    fbq: any
  }
}

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "lg"
  onClick?: () => void
  href?: string
  trackEvent?: string
  type?: "button" | "submit" | "reset"
}

export function MagneticButton({
  children,
  className = "",
  variant = "primary",
  size = "default",
  onClick,
  href,
  trackEvent,
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    positionRef.current = { x: x * 0.15, y: y * 0.15 }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`
      }
    })
  }

  const handleMouseLeave = () => {
    positionRef.current = { x: 0, y: 0 }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = "translate3d(0px, 0px, 0)"
      }
    })
  }

  const handleClick = () => {
    if (trackEvent && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", trackEvent, {
        content_name: `Button: ${typeof children === "string" ? children : "CTA"}`,
        content_category: "CTA Click",
      })
      console.log(`[v0] Meta Pixel: ${trackEvent} event sent for button click`)
    }
    if (onClick) {
      onClick()
    }
  }

  const variants = {
    primary:
      "bg-foreground/95 text-background hover:bg-foreground backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]",
    secondary:
      "bg-foreground/5 text-foreground hover:bg-foreground/10 backdrop-blur-xl border border-foreground/10 hover:border-foreground/20",
    ghost: "bg-transparent text-foreground hover:bg-foreground/5 backdrop-blur-sm",
  }

  const sizes = {
    default: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  }

  const classNames = `
    relative overflow-hidden rounded-full font-medium
    inline-flex items-center justify-center
    transition-all duration-300 ease-out will-change-transform
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  const commonProps = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: {
      transform: "translate3d(0px, 0px, 0)",
      contain: "layout style paint",
    },
  }

  if (href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={handleClick}
        className={classNames}
        {...commonProps}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={handleClick}
      className={classNames}
      {...commonProps}
    >
      {children}
    </button>
  )
}
