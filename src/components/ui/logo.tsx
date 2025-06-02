import Image from "next/image"
import Link from "next/link"

import { useTheme } from "@/core/state/theme-context"

interface LogoProps {
  icon?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  withText?: boolean
}

const LOGO_DARK_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2_20250519_205643_0001-jwHSizUNUv3PlioAZMQzjeHDb0b1Xl.png"
const LOGO_LIGHT_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205643_0000-hdgTdkfc35ThdiejMWPueDZdR80Mdw.png"
const ICON_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon-oQejjZLvlzKkhVsN6JrQfFUVjoJx2S.png"

export function Logo({ icon, size = "md", withText = false }: LogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === "dark" ? LOGO_DARK_URL : LOGO_LIGHT_URL
  const src = icon ? ICON_URL : logoSrc

  const sizeClasses = {
    sm: { img: 32, text: "text-lg", div: "w-8 h-8" },
    md: { img: 64, text: "text-2xl", div: "w-16 h-16" },
    lg: { img: 192, text: "text-5xl", div: "w-48 h-48" },
    xl: { img: 320, text: "text-7xl", div: "w-80 h-80" },
  }

  const sizes = sizeClasses[size] || sizeClasses["md"]

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className={`relative ${sizes.div}`}>
        <Image
          src={src || "/placeholder.svg"}
          alt="EquilibreInvest Logo"
          fill
          className="object-contain"
          sizes={`${sizes.img}px`}
        />
      </div>
      {withText && (
        <span className={`font-bold ${sizes.text} tracking-tight text-white`}>EquilibreInvest</span>
      )}
    </Link>
  )
}
