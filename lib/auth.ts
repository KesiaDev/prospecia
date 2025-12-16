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
if (typeof window === 'undefined') {
  const secret = process.env.NEXTAUTH_SECRET
  
  if (!secret || secret.trim() === '') {
    console.error('[NextAuth] NEXTAUTH_SECRET não está definido ou está vazio!')
    console.error('[NextAuth] Por favor, defina NEXTAUTH_SECRET no arquivo .env')
    console.error('[NextAuth] Para gerar um secret: openssl rand -base64 32')
    
    // Em desenvolvimento, gera um secret temporário (NÃO USAR EM PRODUÇÃO)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[NextAuth] Usando secret temporário para desenvolvimento. Configure NEXTAUTH_SECRET no .env!')
      process.env.NEXTAUTH_SECRET = 'temporary-dev-secret-change-in-production-' + Date.now()
    } else {
      throw new Error('NEXTAUTH_SECRET é obrigatório em produção. Configure no arquivo .env')
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
        if (!credentials?.email || !credentials?.senha) {
          return null
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { empresa: true }
        })

        if (!usuario) {
          return null
        }

        const senhaValida = await bcrypt.compare(credentials.senha, usuario.senha)

        if (!senhaValida) {
          return null
        }

        return {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          empresaId: usuario.empresaId,
          onboardingCompleto: usuario.onboardingCompleto,
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
  // Secret já foi validado e definido acima na validação de variáveis de ambiente
  secret: process.env.NEXTAUTH_SECRET!,
}

