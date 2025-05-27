import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { PreviewAuthProvider } from "@/contexts/preview-auth-context";
import { ToastContainer } from "@/components/ui/toast-container";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquilibreInvest",
  description: "Gerencie e equilibre sua carteira de investimentos de forma inteligente",
  icons: {
    icon: "/favicon.ico", // ou outro caminho se preferir
  },
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <PreviewAuthProvider>
            <ThemeProvider>
              {children}
              <ToastContainer />
            </ThemeProvider>
          </PreviewAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
