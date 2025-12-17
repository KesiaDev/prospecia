import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Endpoint de health check para verificar status do banco de dados
 */
export async function GET() {
  try {
    // Verificar se DATABASE_URL está configurado
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          status: "error",
          database: "not_configured",
          message: "DATABASE_URL não está configurado"
        },
        { status: 503 }
      )
    }

    // Testar conexão com banco
    try {
      await prisma.$queryRaw`SELECT 1`
      
      // Tentar uma query simples para verificar se as tabelas existem
      const count = await prisma.empresa.count()
      
      return NextResponse.json({
        status: "ok",
        database: "connected",
        tables: "exists",
        timestamp: new Date().toISOString()
      })
    } catch (dbError: any) {
      console.error("[HEALTH] Erro ao conectar com banco:", dbError)
      
      if (dbError.code === 'P1001' || dbError.message?.includes('connect')) {
        return NextResponse.json(
          {
            status: "error",
            database: "connection_failed",
            message: "Não foi possível conectar ao banco de dados",
            error: dbError.message
          },
          { status: 503 }
        )
      }

      if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation')) {
        return NextResponse.json(
          {
            status: "error",
            database: "tables_missing",
            message: "Tabelas do banco de dados não foram criadas",
            error: dbError.message
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          status: "error",
          database: "unknown_error",
          message: "Erro desconhecido ao acessar banco de dados",
          error: dbError.message
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar health",
        error: error.message
      },
      { status: 500 }
    )
  }
}


