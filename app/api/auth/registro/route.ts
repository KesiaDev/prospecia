import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, senha, nomeEmpresa, cnpj } = body

    // Validações
    if (!nome || !email || !senha || !nomeEmpresa) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      )
    }

    // Limpar CNPJ (remover formatação)
    const cnpjLimpo = cnpj ? cnpj.replace(/\D/g, '') : null

    // Verifica se email já existe
    let usuarioExistente
    try {
      usuarioExistente = await prisma.usuario.findUnique({
        where: { email },
      })
    } catch (dbError: any) {
      console.error("Erro ao verificar email:", dbError)
      // Se for erro de conexão, retorna erro específico
      if (dbError.code === 'P1001' || dbError.message?.includes('connect')) {
        return NextResponse.json(
          { error: "Erro de conexão com o banco de dados. Verifique a configuração." },
          { status: 503 }
        )
      }
      throw dbError
    }

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    // Verifica se CNPJ já existe (se fornecido)
    if (cnpjLimpo && cnpjLimpo.length > 0) {
      try {
        const empresaExistente = await prisma.empresa.findUnique({
          where: { cnpj: cnpjLimpo },
        })

        if (empresaExistente) {
          return NextResponse.json(
            { error: "CNPJ já cadastrado" },
            { status: 400 }
          )
        }
      } catch (dbError: any) {
        console.error("Erro ao verificar CNPJ:", dbError)
        // Continua mesmo se houver erro na verificação do CNPJ
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Cria empresa e usuário
    try {
      const empresa = await prisma.empresa.create({
        data: {
          nome: nomeEmpresa,
          cnpj: cnpjLimpo || null,
          usuarios: {
            create: {
              nome,
              email,
              senha: senhaHash,
              onboardingCompleto: false,
            },
          },
        },
      })

      return NextResponse.json(
        { message: "Conta criada com sucesso", empresaId: empresa.id },
        { status: 201 }
      )
    } catch (createError: any) {
      console.error("Erro ao criar empresa/usuário:", createError)
      
      // Erros específicos do Prisma
      if (createError.code === 'P2002') {
        // Violação de constraint única
        const field = createError.meta?.target?.[0]
        if (field === 'email') {
          return NextResponse.json(
            { error: "Email já cadastrado" },
            { status: 400 }
          )
        }
        if (field === 'cnpj') {
          return NextResponse.json(
            { error: "CNPJ já cadastrado" },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: "Dados já cadastrados" },
          { status: 400 }
        )
      }

      if (createError.code === 'P1001' || createError.message?.includes('connect')) {
        return NextResponse.json(
          { error: "Erro de conexão com o banco de dados. Verifique se o banco está configurado e acessível." },
          { status: 503 }
        )
      }

      if (createError.code === 'P2025' || createError.message?.includes('Record to create')) {
        return NextResponse.json(
          { error: "Erro ao criar registro. Verifique os dados fornecidos." },
          { status: 400 }
        )
      }

      // Erro genérico com mais detalhes em desenvolvimento
      const errorMessage = process.env.NODE_ENV === 'production'
        ? "Erro ao criar conta. Tente novamente."
        : createError.message || "Erro interno do servidor"

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro geral ao criar conta:", error)
    
    // Erro ao fazer parse do JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production'
          ? "Erro interno do servidor"
          : error.message || "Erro interno do servidor"
      },
      { status: 500 }
    )
  }
}

