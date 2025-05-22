const HF_API_KEY = process.env.HF_API_KEY || ""; // Opcional para alguns modelos

// Esta função é usada pelo arquivo de rota para gerar o texto
export async function generateText({ prompt, maxTokens, temperature }: any) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`, // Opcional para alguns modelos
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens || 150,
          temperature: temperature || 0.7,
        },
      }),
    }
  );

  const result = await response.json();
  return { text: result[0]?.generated_text || "" };
}