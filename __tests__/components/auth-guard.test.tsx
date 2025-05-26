import { render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock do useAuth
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

describe("AuthGuard", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it("should render children when user is authenticated", async () => {
    // Configurar useAuth para retornar usuário autenticado
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123", email: "test@example.com" },
      loading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido foi renderizado
    expect(screen.getByTestId("protected-content")).toBeInTheDocument()

    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("should redirect to login when user is not authenticated", async () => {
    // Configurar useAuth para retornar usuário não autenticado
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido não foi renderizado
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()

    // Verificar se o redirecionamento foi chamado
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("should show loading state when authentication is in progress", async () => {
    // Configurar useAuth para retornar estado de carregamento
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido não foi renderizado
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()

    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled()

    // Verificar se o indicador de carregamento foi renderizado
    await waitFor(() => {
      expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    })
  })

  it("should render children when user is authenticated and loading is false", async () => {
    // Configurar useAuth para retornar usuário autenticado e loading false
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123", email: "test@example.com" },
      loading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido foi renderizado
    expect(screen.getByTestId("protected-content")).toBeInTheDocument()

    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("should render children when user is authenticated and loading is true", async () => {
    // Configurar useAuth para retornar usuário autenticado e loading true
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "123", email: "test@example.com" },
      loading: true,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido foi renderizado
    expect(screen.getByTestId("protected-content")).toBeInTheDocument()

    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("should render children when user is not authenticated and loading is true", async () => {
    // Configurar useAuth para retornar usuário não autenticado e loading true
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido não foi renderizado
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()

    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled()

    // Verificar se o indicador de carregamento foi renderizado
    await waitFor(() => {
      expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    })
  })

  it("should render children when user is not authenticated and loading is false", async () => {
    // Configurar useAuth para retornar usuário não autenticado e loading false
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>,
    )

    // Verificar se o conteúdo protegido não foi renderizado
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()

    // Verificar se o redirecionamento foi chamado
    expect(mockPush).toHaveBeenCalledWith("/login")
  })
})
