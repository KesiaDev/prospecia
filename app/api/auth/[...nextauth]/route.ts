import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Validação em runtime (não durante build)
// Verifica se o secret é válido e não é um placeholder temporário
const validateSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET
  
  if (!secret || 
      secret === 'build-time-temporary-secret-replace-in-runtime' ||
      secret.startsWith('temporary-dev-secret')) {
    console.error('[NextAuth] ERRO: NEXTAUTH_SECRET não está configurado corretamente!')
    console.error('[NextAuth] Configure NEXTAUTH_SECRET nas variáveis de ambiente do Railway')
    console.error('[NextAuth] Para gerar: openssl rand -base64 32')
    
    // Em produção runtime, lança erro
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      throw new Error('NEXTAUTH_SECRET é obrigatório em produção. Configure nas variáveis de ambiente.')
    }
  }
}

// Valida apenas em runtime, não durante build
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  validateSecret()
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

