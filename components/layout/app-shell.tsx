"use client"

import { type ReactNode, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { LayoutDashboard, BarChart3, Calculator, Clock, Eye, Settings, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { signOut, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calculadora", href: "/calculadora-balanceamento", icon: Calculator },
    { name: "Histórico", href: "/historico", icon: Clock },
    { name: "Watchlist", href: "/watchlist", icon: Eye },
    { name: "Gráficos", href: "/dashboard", icon: BarChart3 },
    { name: "Editar Ativos", href: "/editar-ativos", icon: Settings },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  // Evitar renderização no servidor para prevenir erros de hidratação
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 glassmorphism border-b border-border-secondary">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden mr-2 p-2 rounded-md text-text-secondary hover:bg-background-tertiary"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo icon withText size="md" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/perfil"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background-tertiary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.displayName?.split(" ")[0] || "Usuário"}
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-md text-text-secondary hover:bg-background-tertiary"
              aria-label="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-30 bg-background-primary/90 backdrop-blur-sm transition-all duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="pt-20 px-4">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-text-secondary hover:bg-background-tertiary",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}

            <Link
              href="/perfil"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                pathname === "/perfil"
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:bg-background-tertiary",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border-secondary">
          <div className="p-4 flex-1">
            <nav className="flex flex-col gap-2 mt-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-text-secondary hover:bg-background-tertiary",
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-border-secondary">
            <Link
              href="/perfil"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                pathname === "/perfil"
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:bg-background-tertiary",
              )}
            >
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
