import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "default" | "white" | "dark"
  size?: "sm" | "md" | "lg"
  withText?: boolean
}

export function Logo({ variant = "dark", size = "md", withText = true }: LogoProps) {
  const logoSrc =
    variant === "dark"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2_20250519_205643_0001-jwHSizUNUv3PlioAZMQzjeHDb0b1Xl.png"
      : variant === "white"
        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205643_0000-hdgTdkfc35ThdiejMWPueDZdR80Mdw.png"
        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1_20250519_205705_0000-Ou6XpU3g4F4xUQlewPwQxzImrOAZzB.png"

  const sizeClasses = {
    sm: { img: 32, text: "text-lg" },
    md: { img: 48, text: "text-xl" },
    lg: { img: 64, text: "text-2xl" },
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt="EquilibreInvest Logo"
          width={sizeClasses[size].img}
          height={sizeClasses[size].img}
          className="object-contain"
        />
      </div>
      {withText && (
        <span className={`font-bold ${sizeClasses[size].text} tracking-tight text-white`}>EquilibreInvest</span>
      )}
    </Link>
  )
}
