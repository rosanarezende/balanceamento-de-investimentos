import { NextResponse } from "next/server"
import { fetchStockPriceServer } from "@/lib/server/stock-price"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")
  const eligibleStocks = searchParams.get("eligibleStocks")
  const investmentValue = searchParams.get("investmentValue")

  if (typeof ticker !== "string") {
    return NextResponse.json({ error: "Ticker deve ser uma string" }, { status: 400 })
  }

  if (!ticker.trim()) {
    return NextResponse.json({ error: "Ticker não pode estar vazio" }, { status: 400 })
  }

  if (!eligibleStocks || isNaN(Number(eligibleStocks))) {
    return NextResponse.json({ error: "eligibleStocks inválido" }, { status: 400 })
  }

  if (!investmentValue || isNaN(Number(investmentValue))) {
    return NextResponse.json({ error: "investmentValue inválido" }, { status: 400 })
  }

  try {
    const price = await fetchStockPriceServer(ticker)
    return NextResponse.json({ price })
  } 
  catch (error) {
    console.error("Erro ao buscar preço da ação:", error)
    return NextResponse.json({ error: "Erro ao buscar preço" }, { status: 500 })
  }
}
