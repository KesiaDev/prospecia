import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    prospectavel: "bg-gray-100 text-gray-800",
    em_contato: "bg-blue-100 text-blue-800",
    qualificado: "bg-yellow-100 text-yellow-800",
    disponivel: "bg-green-100 text-green-800",
    ativado: "bg-purple-100 text-purple-800",
    descartado: "bg-red-100 text-red-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export function getClassificacaoColor(classificacao: string | null): string {
  const colors: Record<string, string> = {
    quente: "bg-red-100 text-red-800",
    morno: "bg-orange-100 text-orange-800",
    frio: "bg-blue-100 text-blue-800",
  }
  return colors[classificacao || ""] || "bg-gray-100 text-gray-800"
}


