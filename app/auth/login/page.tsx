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

    try {
      const result = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      })

      if (result?.error) {
        // Mensagens de erro mais específicas
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

      if (!result?.ok) {
        setErro("Erro ao fazer login. Tente novamente.")
        setLoading(false)
        return
      }

      // Verifica se o onboarding foi completado através da sessão
      // O middleware vai redirecionar automaticamente se necessário
      // Mas vamos verificar aqui também para melhor UX
      try {
        const sessionResponse = await fetch("/api/auth/session")
        const session = await sessionResponse.json()
        
        if (session?.user?.onboardingCompleto) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
        router.refresh()
      } catch (error) {
        // Em caso de erro ao verificar sessão, deixa o middleware lidar
        router.push("/onboarding")
        router.refresh()
      }
    } catch (error) {
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

