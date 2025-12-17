import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (!session.user.onboardingCompleto) {
      redirect("/onboarding")
    }
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">ProspecIA</h1>
          <p className="text-gray-600">Geração e Qualificação de Leads via WhatsApp com SDR IA</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full text-center bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Entrar
          </Link>
          <Link
            href="/auth/registro"
            className="block w-full text-center bg-white text-primary-600 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  )
}


