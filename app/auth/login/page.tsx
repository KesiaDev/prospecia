"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    console.log("[LOGIN] Iniciando login para:", email)

    try {
      const result = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      })

      console.log("[LOGIN] Resultado completo do signIn:", JSON.stringify(result, null, 2))

      // Se houver erro explícito, mostra mensagem
      if (result?.error) {
        console.error("[LOGIN] Erro no signIn:", result.error)
        let errorMessage = "Email ou senha incorretos"
        
        if (result.error.includes("banco") || result.error.includes("database")) {
          errorMessage = "Erro de conexão com banco de dados. Verifique a configuração."
        } else if (result.error.includes("configurado")) {
          errorMessage = "Banco de dados não configurado. Contate o suporte."
        }
        
        setErro(errorMessage)
        setLoading(false)
        return
      }

      // Se não houver erro, assume sucesso e redireciona
      // O NextAuth pode retornar undefined ou { ok: true } quando bem-sucedido
      console.log("[LOGIN] Nenhum erro detectado, assumindo login bem-sucedido")
      console.log("[LOGIN] Redirecionando imediatamente...")

      // Força redirecionamento usando window.location
      // Isso garante que a página seja recarregada completamente
      setTimeout(() => {
        window.location.href = "/onboarding"
      }, 50)

    } catch (error: any) {
      console.error("[LOGIN] Erro geral no login:", error)
      setErro("Erro ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">ProspecIA</h1>
          <p className="text-gray-600">Faça login na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/auth/registro" className="text-primary-600 hover:text-primary-700 font-semibold">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

