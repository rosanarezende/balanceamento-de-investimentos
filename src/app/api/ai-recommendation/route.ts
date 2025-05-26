import { NextResponse } from "next/server";
import { generateInvestmentRecommendation } from "@/services/ai/textGeneration";

/**
 * Endpoint de API para gerar recomendações de investimento usando IA
 * 
 * Este endpoint recebe um prompt e utiliza o serviço de geração de texto
 * para fornecer recomendações personalizadas de investimento.
 */

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt deve ser uma string" }, { status: 400 });
    }

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Prompt não pode estar vazio" }, { status: 400 });
    }

    const { text } = await generateInvestmentRecommendation(prompt);

    return NextResponse.json({ 
      recommendation: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro na API de recomendação:", error);
    return NextResponse.json({ 
      error: "Erro ao gerar recomendação",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
