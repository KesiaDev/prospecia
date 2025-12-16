"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

interface AtivarLeadButtonProps {
  leadIds: string[]
  onSuccess?: () => void
}

export function AtivarLeadButton({ leadIds, onSuccess }: AtivarLeadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleAtivar = async () => {
    if (leadIds.length === 0) return

    setErro("")
    setLoading(true)

    try {
      const response = await fetch("/api/leads/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErro(data.error || "Erro ao ativar leads")
        setLoading(false)
        return
      }

      if (onSuccess) {
        onSuccess()
      }

      router.refresh()
    } catch (error) {
      setErro("Erro ao ativar leads. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div>
      {erro && (
        <p className="text-sm text-red-600 mb-2">{erro}</p>
      )}
      <button
        onClick={handleAtivar}
        disabled={loading || leadIds.length === 0}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {loading
          ? "Ativando..."
          : leadIds.length === 1
          ? "Ativar Lead"
          : `Ativar ${leadIds.length} Leads`}
      </button>
    </div>
  )
}

