import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Validação adicional para garantir que o secret está definido
if (!authOptions.secret) {
  console.error('[NextAuth] ERRO: NEXTAUTH_SECRET não está definido!')
  console.error('[NextAuth] Configure NEXTAUTH_SECRET no arquivo .env')
  console.error('[NextAuth] Para gerar: openssl rand -base64 32')
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET é obrigatório em produção')
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

