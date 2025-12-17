import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Limpar e validar NEXTAUTH_URL antes de ser usado pelo NextAuth
// Remove sufixos estranhos como ":String" que podem aparecer em alguns ambientes
if (typeof window === 'undefined' && process.env.NEXTAUTH_URL) {
  const originalUrl = process.env.NEXTAUTH_URL
  // Remove qualquer sufixo ":String" ou ":string" que possa ter sido adicionado
  const cleanUrl = originalUrl
    .trim()
    .replace(/:String$/i, '')
    .replace(/:string$/i, '')
    .replace(/:String:/g, ':')
    .replace(/:string:/g, ':')
  
  // Garante que é uma URL válida
  if (cleanUrl && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
    process.env.NEXTAUTH_URL = cleanUrl
  } else if (!cleanUrl && process.env.NODE_ENV !== 'production') {
    // Fallback para desenvolvimento local se a URL estiver vazia ou inválida
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
  }
}

// Validar e garantir que NEXTAUTH_SECRET está definido
// Não lança erro durante build, apenas valida e limpa o valor
if (typeof window === 'undefined') {
  const secret = process.env.NEXTAUTH_SECRET
  
  if (!secret || secret.trim() === '') {
    // Durante build, apenas avisa mas não lança erro
    // O erro será lançado em runtime no route handler se necessário
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[NextAuth] NEXTAUTH_SECRET não está definido durante o build.')
      console.warn('[NextAuth] Certifique-se de configurar NEXTAUTH_SECRET nas variáveis de ambiente do Railway.')
      // Usa um secret temporário apenas para o build não falhar
      process.env.NEXTAUTH_SECRET = 'build-time-temporary-secret-replace-in-runtime'
    } else if (process.env.NODE_ENV !== 'production') {
      // Em desenvolvimento local, gera um secret temporário
      console.warn('[NextAuth] Usando secret temporário para desenvolvimento. Configure NEXTAUTH_SECRET no .env!')
      process.env.NEXTAUTH_SECRET = 'temporary-dev-secret-change-in-production-' + Date.now()
    } else {
      // Em produção runtime, apenas avisa (erro será lançado no route handler)
      console.error('[NextAuth] NEXTAUTH_SECRET não está definido!')
      console.error('[NextAuth] Configure NEXTAUTH_SECRET nas variáveis de ambiente.')
    }
  } else {
    // Remove espaços e caracteres estranhos
    process.env.NEXTAUTH_SECRET = secret.trim()
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.senha) {
            console.error("[AUTH] Credenciais não fornecidas")
            return null
          }

          // Verificar conexão com banco
          if (!process.env.DATABASE_URL) {
            console.error("[AUTH] DATABASE_URL não configurado")
            throw new Error("Banco de dados não configurado")
          }

          let usuario
          try {
            usuario = await prisma.usuario.findUnique({
              where: { email: credentials.email },
              include: { empresa: true }
            })
          } catch (dbError: any) {
            console.error("[AUTH] Erro ao buscar usuário:", {
              code: dbError.code,
              message: dbError.message
            })
            
            if (dbError.code === 'P1001' || dbError.message?.includes('connect') || dbError.message?.includes('Can\'t reach')) {
              throw new Error("Erro de conexão com banco de dados")
            }
            throw dbError
          }

          if (!usuario) {
            console.warn("[AUTH] Usuário não encontrado:", credentials.email)
            return null
          }

          const senhaValida = await bcrypt.compare(credentials.senha, usuario.senha)

          if (!senhaValida) {
            console.warn("[AUTH] Senha inválida para:", credentials.email)
            return null
          }

          console.log("[AUTH] Login bem-sucedido para:", credentials.email)
          return {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            empresaId: usuario.empresaId,
            onboardingCompleto: usuario.onboardingCompleto,
          }
        } catch (error: any) {
          console.error("[AUTH] Erro no authorize:", error)
          // Retorna null para que o NextAuth trate como credenciais inválidas
          // Mas loga o erro para debug
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.empresaId = user.empresaId
        token.onboardingCompleto = user.onboardingCompleto
      }
      
      // Se for um update da sessão, busca dados atualizados do banco
      if (trigger === "update") {
        const usuario = await prisma.usuario.findUnique({
          where: { id: token.sub },
          select: { onboardingCompleto: true, empresaId: true },
        })
        
        if (usuario) {
          token.onboardingCompleto = usuario.onboardingCompleto
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.empresaId = token.empresaId as string
        session.user.onboardingCompleto = token.onboardingCompleto as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  // Secret - será validado em runtime no route handler
  // Durante build, pode ser um valor temporário
  secret: process.env.NEXTAUTH_SECRET || 'temporary-secret-for-build-only',
}

