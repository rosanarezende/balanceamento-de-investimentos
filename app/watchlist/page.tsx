"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { SectionTitle } from "@/components/ui/section-title"
import { Button } from "@/components/ui/button"
import { WatchlistCard } from "@/components/watchlist/watchlist-card"
import { WatchlistEditModal, type WatchlistEditData } from "@/components/watchlist/watchlist-edit-modal"
import { WatchlistDeleteModal } from "@/components/watchlist/watchlist-delete-modal"
import { Eye, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist } from "@/lib/firestore"
import { fetchStockPrice } from "@/lib/api"
import { getCachedStockPrice, setCachedStockPrice } from "@/lib/client-utils/stock-price-cache"
import AuthGuard from "@/components/auth-guard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface WatchlistItem {
  ticker: string
  targetPrice: number | null
  notes: string
  currentPrice?: number
  dailyChange?: number
  dailyChangePercentage?: number
}

export default function WatchlistPage() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null)
  const [isNewItem, setIsNewItem] = useState(false)

  // Carregar a watchlist do usuário
  useEffect(() => {
    async function loadWatchlist() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const userWatchlist = await getUserWatchlist(user.uid)

        // Buscar preços atuais para todos os itens
        const watchlistWithPrices = await Promise.all(
          userWatchlist.map(async (item) => {
            try {
              let currentPrice = getCachedStockPrice(item.ticker)
              if (currentPrice === null) {
                currentPrice = await fetchStockPrice(item.ticker)
                setCachedStockPrice(item.ticker, currentPrice)
              }

              // Simular variação diária
              const dailyChangePercentage = Math.random() * 10 - 5 // -5% a +5%
              const dailyChange = currentPrice * (dailyChangePercentage / 100)

              return {
                ...item,
                currentPrice,
                dailyChange,
                dailyChangePercentage,
              }
            } catch (err) {
              console.error(`Erro ao buscar preço para ${item.ticker}:`, err)
              return {
                ...item,
                currentPrice: 0,
                dailyChange: 0,
                dailyChangePercentage: 0,
              }
            }
          }),
        )

        setWatchlist(watchlistWithPrices)
      } catch (error) {
        console.error("Erro ao carregar watchlist:", error)
        setError("Não foi possível carregar sua lista de observação. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadWatchlist()
  }, [user])

  const handleAddItem = () => {
    setSelectedItem(null)
    setIsNewItem(true)
    setEditModalOpen(true)
  }

  const handleEditItem = (item: WatchlistItem) => {
    setSelectedItem(item)
    setIsNewItem(false)
    setEditModalOpen(true)
  }

  const handleDeleteItem = (item: WatchlistItem) => {
    setSelectedItem(item)
    setDeleteModalOpen(true)
  }

  const handleSaveItem = async (data: WatchlistEditData) => {
    if (!user) return

    if (isNewItem) {
      await addToWatchlist(user.uid, data)

      // Simular preço atual e variação para o novo item
      let currentPrice = getCachedStockPrice(data.ticker)
      if (currentPrice === null) {
        currentPrice = await fetchStockPrice(data.ticker)
        setCachedStockPrice(data.ticker, currentPrice)
      }
      const dailyChangePercentage = Math.random() * 10 - 5
      const dailyChange = currentPrice * (dailyChangePercentage / 100)

      setWatchlist([
        ...watchlist,
        {
          ...data,
          currentPrice,
          dailyChange,
          dailyChangePercentage,
        },
      ])
    } else if (selectedItem) {
      await updateWatchlistItem(user.uid, selectedItem.ticker, data)

      setWatchlist(
        watchlist.map((item) =>
          item.ticker === selectedItem.ticker
            ? {
                ...item,
                ...data,
              }
            : item,
        ),
      )
    }
  }

  const handleConfirmDelete = async () => {
    if (!user || !selectedItem) return

    await removeFromWatchlist(user.uid, selectedItem.ticker)

    setWatchlist(watchlist.filter((item) => item.ticker !== selectedItem.ticker))
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
          <SectionTitle
            title="Lista de Observação"
            subtitle={`${watchlist.length} ativos sendo monitorados`}
            icon={<Eye size={20} />}
          />

          <Button onClick={handleAddItem} className="btn-primary">
            <Plus size={16} className="mr-2" />
            Adicionar Ativo
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-state-error/10 border border-state-error/20 text-state-error">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 bg-background-tertiary rounded-lg">
            <p className="text-text-secondary mb-4">Sua lista de observação está vazia.</p>
            <Button onClick={handleAddItem} className="btn-primary">
              <Plus size={16} className="mr-2" />
              Adicionar Ativo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchlist.map((item) => (
              <WatchlistCard
                key={item.ticker}
                ticker={item.ticker}
                currentPrice={item.currentPrice || 0}
                dailyChange={item.dailyChange || 0}
                dailyChangePercentage={item.dailyChangePercentage || 0}
                targetPrice={item.targetPrice}
                notes={item.notes}
                onEdit={() => handleEditItem(item)}
                onDelete={() => handleDeleteItem(item)}
              />
            ))}
          </div>
        )}

        {/* Modais */}
        <WatchlistEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveItem}
          item={selectedItem}
          isNew={isNewItem}
        />

        <WatchlistDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          ticker={selectedItem?.ticker || ""}
        />
      </AppShell>
    </AuthGuard>
  )
}
