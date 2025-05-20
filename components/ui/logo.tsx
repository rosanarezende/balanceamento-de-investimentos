import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  icon?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  withText?: boolean
}

const LOGO_DARK_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2_20250519_205643_0001-jwHSizUNUv3PlioAZMQzjeHDb0b1Xl.png"
const LOGO_LIGHT_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205643_0000-hdgTdkfc35ThdiejMWPueDZdR80Mdw.png"
const ICON_DARK_URL = "https://github-production-user-asset-6210df.s3.amazonaws.com/45580434/445793977-4f79da24-732c-464f-8a8e-78f4f941083f.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250520%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250520T210803Z&X-Amz-Expires=300&X-Amz-Signature=a2a781c96b7f80359b32ad39bda17c7f18ba1a0ce1ac0b712820f47a8819e86c&X-Amz-SignedHeaders=host"
const ICON_LIGHT_URL = "https://github-production-user-asset-6210df.s3.amazonaws.com/45580434/445793976-49dfa6fe-4b44-43c7-966f-6ed335ebc837.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250520%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250520T210919Z&X-Amz-Expires=300&X-Amz-Signature=ef29cc383b54e545cf6538153b945cafb671b6e000675ddfd8efb47698f7567b&X-Amz-SignedHeaders=host"

export function Logo({ icon, size = "md", withText = false }: LogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === "dark" ? LOGO_DARK_URL : LOGO_LIGHT_URL
  const iconSrc = theme === "dark" ? ICON_DARK_URL : ICON_LIGHT_URL
  const src = icon ? iconSrc : logoSrc

  const sizeClasses = {
    sm: { img: 32, text: "text-lg", div: "w-8 h-8" },
    md: { img: 48, text: "text-xl", div: "w-12 h-12" },
    lg: { img: 64, text: "text-2xl", div: "w-16 h-16" },
    xl: { img: 192, text: "text-5xl", div: "w-48 h-48" },
    "2xl": { img: 320, text: "text-7xl", div: "w-80 h-80" },
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
