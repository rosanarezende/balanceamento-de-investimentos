"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Calculator,
  Clock,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"

import { useAuth } from "@/core/state/auth-context"
import { cn } from "@/core/utils/styling"

import { LucideProps } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<LucideProps>
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Carteira", href: "/carteira", icon: BarChart3 },
  { name: "Calculadora", href: "/calculadora-balanceamento", icon: Calculator },
  { name: "Histórico", href: "/historico", icon: Clock },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex-none w-64 bg-sidebar-background text-sidebar-foreground transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Logo icon size="sm" />
          <button
            className="md:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center p-2 space-x-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full p-2 space-x-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border bg-background">
          <button
            className="md:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <Logo icon size="sm" />
            <span className="text-lg font-bold">EquilibreInvest</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-foreground hover:text-primary"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}
