import { LoadingState } from "@/components/ui/loading-state"

export default function Loading() {
  return (
    <div className="container mx-auto max-w-md p-8">
      <LoadingState message="Carregando calculadora de balanceamento..." />
    </div>
  )
}
