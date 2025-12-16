"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nomeEmpresa: "",
    cnpj: "",
  })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErro(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }

      // Autentica automaticamente após registro bem-sucedido
      try {
        const signInResult = await signIn("credentials", {
          email: formData.email,
          senha: formData.senha,
          redirect: false,
        })

        if (signInResult?.error) {
          // Se falhar autenticação automática, redireciona para login
          router.push("/auth/login?registro=sucesso")
          return
        }

        // Se autenticação bem-sucedida, redireciona para onboarding
        // O middleware vai garantir que usuários sem onboarding vão para /onboarding
        router.push("/onboarding")
        router.refresh()
      } catch (authError) {
        // Em caso de erro na autenticação, redireciona para login
        router.push("/auth/login?registro=sucesso")
      }
    } catch (error) {
      setErro("Erro ao criar conta. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">ProspecIA</h1>
          <p className="text-gray-600">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Seu Nome
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <input
              id="nomeEmpresa"
              type="text"
              value={formData.nomeEmpresa}
              onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Minha Empresa LTDA"
            />
          </div>

          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ (opcional)
            </label>
            <input
              id="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
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
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

