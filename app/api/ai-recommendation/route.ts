import { NextResponse } from "next/server"
import { generateText } from "@/lib/ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

    // Usar o AI SDK da Vercel para gerar texto
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      maxTokens: 150,
      temperature: 0.7,
    })

    return NextResponse.json({ recommendation: text })
  } catch (error) {
    console.error("Erro na API de recomendação:", error)
    return NextResponse.json({ error: "Erro ao gerar recomendação" }, { status: 500 })
  }
}
