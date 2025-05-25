import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt deve ser uma string" }, { status: 400 });
    }

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Prompt não pode estar vazio" }, { status: 400 });
    }

    const { text } = await generateText({
      prompt,
      maxTokens: 150,
      temperature: 0.7,
    });

    return NextResponse.json({ recommendation: text });
  } catch (error) {
    console.error("Erro na API de recomendação:", error);
    return NextResponse.json({ error: "Erro ao gerar recomendação" }, { status: 500 });
  }
}
