import { NextResponse } from "next/server"
import { fetchStockPrice } from "@/lib/api"
import { StockPriceResponseSchema } from "@/lib/schemas/stock"

export async function GET(request: Request) 
{
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")

  if (!ticker) {
    return NextResponse.json({ error: "Ticker não fornecido" }, { status: 400 })
  }

  try {
    const price = await fetchStockPrice(ticker)

    // Validação do schema antes de responder
    const response = StockPriceResponseSchema.parse({ price, ticker })

    return NextResponse.json(response, { status: 200 })
  }

  catch (error) {
    return NextResponse.json({ error: "Erro ao buscar preço" }, { status: 500 })
  }
}
