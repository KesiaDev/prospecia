import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Se não está autenticado, permite acesso apenas a rotas públicas
    if (!token) {
      if (path.startsWith("/auth") || path === "/") {
        return NextResponse.next()
      }
      // Redireciona para login se tentar acessar rota protegida sem autenticação
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Se autenticado mas não completou onboarding
    if (!token.onboardingCompleto) {
      // Permite acesso apenas ao onboarding e rotas de auth
      if (path.startsWith("/onboarding") || path.startsWith("/auth")) {
        return NextResponse.next()
      }
      // Bloqueia acesso a qualquer outra rota e redireciona para onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }

    // Se completou onboarding mas está tentando acessar onboarding, redireciona para dashboard
    if (token.onboardingCompleto && path.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Permite acesso a rotas protegidas se onboarding completo
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Rotas públicas não precisam de autenticação
        if (path.startsWith("/auth") || path === "/") {
          return true
        }
        
        // Rotas protegidas precisam de token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/funil/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
    "/",
  ],
}

