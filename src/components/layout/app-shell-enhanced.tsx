"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calculator,
  Clock,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useAuth } from "@/core/state/auth-context"
import { useTheme } from "@/core/state/theme-context"
import { cn } from "@/core/utils/styling"

import { LucideProps } from "lucide-react"
import AuthGuard from "../auth-guard"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<LucideProps>
  implemented: boolean
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/carteira", icon: LayoutDashboard, implemented: true },
  { name: "Calculadora", href: "/calculadora-balanceamento", icon: Calculator, implemented: true },
  { name: "Histórico", href: "/historico", icon: Clock, implemented: true },
  { name: "Watchlist", href: "/watchlist", icon: Eye, implemented: false },
  { name: "Configurações", href: "/configuracoes", icon: Settings, implemented: false },
]

export function AppShellEnhanced({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [initials, setInitials] = useState("U")

  useEffect(() => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ')
      if (nameParts.length >= 2) {
        setInitials(`${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`)
      } else if (nameParts.length === 1) {
        setInitials(nameParts[0][0])
      }
    } else if (user?.email) {
      setInitials(user.email[0].toUpperCase())
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0 md:relative"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Logo icon size="sm" />
            <button
              className="md:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground rounded-full p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col justify-between h-[calc(100%-64px)]">
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href === "/carteira" && pathname === "/");

                return (
                  <TooltipProvider key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.implemented ? item.href : "#"}
                          className={cn(
                            "flex items-center p-2 space-x-3 rounded-md transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-hover hover:text-sidebar-hover-foreground",
                            !item.implemented ? "opacity-50 cursor-not-allowed" : ""
                          )}
                          onClick={(e) => !item.implemented && e.preventDefault()}
                        >
                          <item.icon size={20} />
                          <span>{item.name}</span>
                          {!item.implemented && (
                            <span className="ml-auto text-xs bg-sidebar-accent/30 text-sidebar-accent-foreground/70 px-1.5 py-0.5 rounded">
                              Em breve
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!item.implemented && (
                        <TooltipContent side="right">
                          <p>Funcionalidade em desenvolvimento</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>

            <div className="p-4 border-t border-sidebar-border space-y-2">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-sidebar-hover"
                  aria-label="Alternar tema"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <span className="text-xs text-sidebar-foreground/70">
                  v1.0.0
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center w-full p-2 space-x-3 rounded-md hover:bg-sidebar-hover hover:text-sidebar-hover-foreground transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center">
              <button
                className="md:hidden mr-4 p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu size={20} />
              </button>

              <div className="md:hidden flex items-center">
                <Logo icon size="sm" />
              </div>

              <h1 className="text-xl font-semibold hidden md:block">
                EquilibreInvest
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
              </div>

              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Usuário"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
