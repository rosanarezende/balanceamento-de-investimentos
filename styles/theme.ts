export const theme = {
  colors: {
    // Cores base (tema escuro)
    background: {
      primary: "#0A0E17",
      secondary: "#111827",
      tertiary: "#1F2937",
      card: "rgba(31, 41, 55, 0.7)",
    },
    // Cores de destaque vibrantes
    accent: {
      primary: "#3B82F6", // Azul elétrico
      secondary: "#10B981", // Verde neon
      tertiary: "#8B5CF6", // Roxo
      quaternary: "#F59E0B", // Âmbar
      danger: "#EF4444", // Vermelho
    },
    // Cores de texto
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      tertiary: "#9CA3AF",
      inverse: "#111827",
    },
    // Cores de borda
    border: {
      primary: "rgba(75, 85, 99, 0.4)",
      secondary: "rgba(75, 85, 99, 0.2)",
    },
    // Cores de estado
    state: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    // Cores para gráficos
    chart: [
      "#3B82F6", // Azul
      "#10B981", // Verde
      "#8B5CF6", // Roxo
      "#F59E0B", // Âmbar
      "#EC4899", // Rosa
      "#06B6D4", // Ciano
      "#EF4444", // Vermelho
      "#A78BFA", // Lavanda
    ],
  },
  // Efeito de vidro fosco
  glass: {
    background: "rgba(31, 41, 55, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    blur: "10px",
  },
  // Sombras
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px rgba(0, 0, 0, 0.4)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.5)",
    highlight: "0 0 15px rgba(59, 130, 246, 0.5)",
  },
  // Arredondamentos
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  // Transições
  transitions: {
    fast: "150ms ease",
    normal: "300ms ease",
    slow: "500ms ease",
  },
}

// Tipos para o tema
export type Theme = typeof theme
