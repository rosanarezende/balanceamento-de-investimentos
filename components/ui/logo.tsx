import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "default" | "white" | "dark"
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  withText?: boolean
}

export function Logo({ variant = "dark", size = "md", withText = false }: LogoProps) {
  const logoSrc =
    variant === "dark"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2_20250519_205643_0001-jwHSizUNUv3PlioAZMQzjeHDb0b1Xl.png"
      : variant === "white"
        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205643_0000-hdgTdkfc35ThdiejMWPueDZdR80Mdw.png"
        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205705_0000-Ou6XpU3g4F4xUQlewPwQxzImrOAZzB.png"

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
          src={logoSrc || "/placeholder.svg"}
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
