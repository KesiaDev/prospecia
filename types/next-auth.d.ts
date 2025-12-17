import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      nome: string
      empresaId: string
      onboardingCompleto: boolean
    }
  }

  interface User {
    id: string
    email: string
    nome: string
    empresaId: string
    onboardingCompleto: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    empresaId: string
    onboardingCompleto: boolean
  }
}


