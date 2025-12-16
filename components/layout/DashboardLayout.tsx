"use client"

import { Sidebar } from "./Sidebar"
import { useSession } from "next-auth/react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {session?.user && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Olá, {session.user.nome}
              </h2>
              <p className="text-gray-600">Bem-vindo ao ProspecIA</p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

