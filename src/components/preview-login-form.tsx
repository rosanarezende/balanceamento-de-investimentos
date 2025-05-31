"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { usePreviewAuth } from "@/contexts/preview-auth-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorDisplay } from "@/core/state/error-handling"

export function PreviewLoginForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const { signIn, loading, error, clearError } = usePreviewAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && name) {
      signIn(email, name)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login para Preview</CardTitle>
        <CardDescription>Use este formulário para testar a aplicação no ambiente de preview.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <ErrorDisplay 
              message={error} 
              onRetry={() => clearError()} 
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="preview-name">Nome</Label>
            <Input
              id="preview-name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearError()
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-email">Email</Label>
            <Input
              id="preview-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError()
              }}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no Preview"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
