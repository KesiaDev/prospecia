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

    // Verifica se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    // Verifica se CNPJ já existe (se fornecido)
    if (cnpj) {
      const empresaExistente = await prisma.empresa.findUnique({
        where: { cnpj },
      })

      if (empresaExistente) {
        return NextResponse.json(
          { error: "CNPJ já cadastrado" },
          { status: 400 }
        )
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Cria empresa e usuário
    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresa,
        cnpj: cnpj || null,
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
  } catch (error) {
    console.error("Erro ao criar conta:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

