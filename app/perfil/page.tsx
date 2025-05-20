"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { CardGlass } from "@/components/ui/card-glass"
import { SectionTitle } from "@/components/ui/section-title"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { User, Settings, HelpCircle, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Logo } from "@/components/ui/logo"
import AuthGuard from "@/components/auth-guard"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Só acessamos o hook useTheme após a montagem do componente no cliente
  const { theme: currentTheme, toggleTheme } = useTheme()
  const [theme, setTheme] = useState<"light" | "dark">(currentTheme || "dark")
  const [toggleThemeFunc, setToggleThemeFunc] = useState<(() => void) | null>(() => toggleTheme)

  useEffect(() => {
    setMounted(true)
    // try {
    //   // Só importamos o hook useTheme no lado do cliente
    //   const { theme: currentTheme, toggleTheme } = useTheme()
    //   setTheme(currentTheme)
    //   setToggleThemeFunc(() => toggleTheme)
    // } catch (error) {
    //   console.error("Erro ao acessar o tema:", error)
    // }
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  // Não renderizamos nada durante a pré-renderização no servidor
  if (!mounted) {
    return null
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <SectionTitle
            title="Perfil e Configurações"
            subtitle="Gerencie suas preferências e conta"
            icon={<Settings size={20} />}
          />

          <div className="grid gap-6">
            {/* Perfil do Usuário */}
            <CardGlass>
              <SectionTitle title="Informações do Usuário" icon={<User size={20} />} className="mb-6" />

              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center text-white text-3xl font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-1">{user?.displayName || "Usuário"}</h3>
                  <p className="text-text-secondary">{user?.email}</p>
                  <p className="text-text-tertiary text-sm mt-2">
                    Membro desde{" "}
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString("pt-BR")
                      : "data desconhecida"}
                  </p>
                </div>
              </div>

              <Button variant="destructive" onClick={handleSignOut} disabled={loading} className="w-full md:w-auto">
                <LogOut size={16} className="mr-2" />
                {loading ? "Saindo..." : "Sair da Conta"}
              </Button>
            </CardGlass>

            {/* Configurações */}
            <CardGlass>
              <SectionTitle title="Configurações" icon={<Settings size={20} />} className="mb-6" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="text-base font-medium">
                      Tema Escuro
                    </Label>
                    <p className="text-text-tertiary text-sm">Ativar ou desativar o tema escuro</p>
                  </div>
                  <Switch id="darkMode" checked={theme === "dark"} onCheckedChange={toggleThemeFunc || (() => {})} />
                </div>

                {/* Outras configurações podem ser adicionadas aqui */}
              </div>
            </CardGlass>

            {/* Ajuda e FAQ */}
            <CardGlass>
              <SectionTitle title="Ajuda e FAQ" icon={<HelpCircle size={20} />} className="mb-6" />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>O que é o EquilibreInvest?</AccordionTrigger>
                  <AccordionContent>
                    O EquilibreInvest é uma aplicação para ajudar investidores a balancear suas carteiras de ações. Ele
                    permite que você defina percentuais meta para cada ativo e calcula quanto você deve investir em cada
                    um para manter sua carteira equilibrada.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funciona a calculadora de balanceamento?</AccordionTrigger>
                  <AccordionContent>
                    A calculadora de balanceamento analisa sua carteira atual, compara com os percentuais meta que você
                    definiu para cada ativo, e calcula quanto você deve investir em cada ação para aproximar sua
                    carteira da alocação ideal. Ela leva em consideração suas recomendações pessoais para cada ativo.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>O que significam as recomendações?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">As recomendações são suas indicações pessoais para cada ativo:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <span className="text-state-success font-medium">Comprar</span>: Recomendado para aportes. O
                        ativo está subvalorizado ou tem boas perspectivas de crescimento.
                      </li>
                      <li>
                        <span className="text-state-warning font-medium">Aguardar</span>: Mantenha as posições
                        existentes, mas aguarde antes de fazer novos aportes.
                      </li>
                      <li>
                        <span className="text-state-error font-medium">Vender</span>: Não recomendado para aportes.
                        Considere vender posições existentes se necessário.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Como funciona a lista de observação?</AccordionTrigger>
                  <AccordionContent>
                    A lista de observação permite que você acompanhe ativos que ainda não possui em sua carteira. Você
                    pode definir preços alvo e receber alertas visuais quando o preço atual estiver próximo ou atingir o
                    valor desejado.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardGlass>

            {/* Sobre */}
            <CardGlass>
              <div className="flex flex-col items-center justify-center py-6">
                <Logo size="md" />
                <p className="text-text-tertiary text-sm mt-4">Versão 2.0.0</p>
                <p className="text-text-tertiary text-sm mt-1">© 2023 EquilibreInvest. Todos os direitos reservados.</p>
              </div>
            </CardGlass>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
