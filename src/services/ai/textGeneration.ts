"use server";

import { HfInference } from "@huggingface/inference";

/**
 * Serviço para geração de texto usando modelos de IA
 * 
 * Este módulo contém funções para interagir com APIs de IA para
 * gerar recomendações e análises de investimentos.
 */

// Inicializar o cliente HuggingFace apenas no servidor
const HF_API_KEY = process.env.HF_API_KEY || "";
const hf = new HfInference(HF_API_KEY);

interface GenerateTextParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Gera texto usando o modelo Mistral-7B-Instruct
 * @param params Parâmetros para geração de texto
 * @returns Texto gerado
 */
export async function generateText({
  prompt,
  maxTokens = 150,
  temperature = 0.7,
}: GenerateTextParams) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HF_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API de IA: ${response.statusText}`);
    }

    const result = await response.json();
    return { text: result[0]?.generated_text || "" };
  } catch (error) {
    console.error("Erro ao gerar texto com IA:", error);
    return { text: "Não foi possível gerar uma recomendação no momento. Por favor, tente novamente mais tarde." };
  }
}

/**
 * Gera uma recomendação de investimento baseada em dados do portfólio
 * @param portfolioData Dados do portfólio para análise
 * @returns Recomendação gerada
 */
export async function generateInvestmentRecommendation(portfolioData: string) {
  const prompt = `
    Como um consultor financeiro especializado, analise os seguintes dados de portfólio e forneça uma recomendação 
    de investimento clara e concisa em português:
    
    ${portfolioData}
    
    Sua recomendação deve incluir:
    1. Uma análise do balanceamento atual
    2. Sugestões específicas para melhorar a diversificação
    3. Considerações sobre risco e retorno
  `;
  
  return generateText({
    prompt,
    maxTokens: 300,
    temperature: 0.7,
  });
}
