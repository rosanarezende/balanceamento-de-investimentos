import { NextResponse } from "next/server"
import { fetchStockPriceServer } from "@/lib/server/stock-price"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")

  if (!ticker) {
    return NextResponse.json({ error: "Ticker não fornecido" }, { status: 400 })
  }

  try {
    const price = await fetchStockPriceServer(ticker)
    return NextResponse.json({ price })
  } 
  catch (error) {
    return NextResponse.json({ error: "Erro ao buscar preço" }, { status: 500 })
  }
}
