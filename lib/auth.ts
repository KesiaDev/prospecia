import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { empresa: true }
        })

        if (!usuario) return null

        const senhaValida = await bcrypt.compare(
          credentials.senha,
          usuario.senha
        )

        if (!senhaValida) return null

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

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.empresaId = user.empresaId
        token.onboardingCompleto = user.onboardingCompleto
      }

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

  secret: process.env.NEXTAUTH_SECRET,
}

