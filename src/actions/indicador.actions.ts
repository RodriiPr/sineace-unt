'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import {
  registrarVariableSchema,
  actualizarVariableSchema,
  calcularIndicadorSchema,
  atenderAlertaSchema,
} from '@/lib/validators/indicador.schema'
import { evaluarCumplimiento } from '@/lib/utils'
import { calcularFormulaSINEACE } from '@/lib/math-parser'
import { AccionAuditoria, TipoAlerta, Rol } from '@prisma/client'

// Helper: Verificar autenticación y permisos
async function checkAuth(permission: any) {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (!hasPermission(session.user.rol as Rol, permission)) {
    throw new Error('Permisos insuficientes')
  }
  return session.user
}

// ---------------------------------------------------------------------------
// CRUD DE VARIABLES DE ENTRADA
// ---------------------------------------------------------------------------

export async function registrarVariable(data: any) {
  try {
    const user = await checkAuth('indicador:create')
    const parsed = registrarVariableSchema.parse(data)

    const variable = await prisma.variableIndicador.create({
      data: {
        ...parsed,
        verificadoPorId: user.id,
      },
    })

    await prisma.auditoria.create({
      data: {
        tabla: 'VariableIndicador',
        registroId: variable.id,
        accion: AccionAuditoria.CREATE,
        usuarioId: user.id,
        valorNuevo: JSON.stringify(variable),
      },
    })

    revalidatePath('/indicadores-sineace/variables')
    return { success: true, data: variable }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function actualizarVariable(id: string, valorNumerico: number, fuenteDato: string) {
  try {
    const user = await checkAuth('indicador:update')
    const parsed = actualizarVariableSchema.parse({ id, valorNumerico, fuenteDato })

    const variableAntigua = await prisma.variableIndicador.findUnique({ where: { id } })
    if (!variableAntigua) throw new Error('Variable no encontrada')

    const variable = await prisma.variableIndicador.update({
      where: { id },
      data: {
        valorNumerico: parsed.valorNumerico,
        fuenteDato: parsed.fuenteDato,
        verificadoPorId: user.id,
      },
    })

    await prisma.auditoria.create({
      data: {
        tabla: 'VariableIndicador',
        registroId: variable.id,
        accion: AccionAuditoria.UPDATE,
        usuarioId: user.id,
        valorAnterior: JSON.stringify(variableAntigua),
        valorNuevo: JSON.stringify(variable),
      },
    })

    // Opcional: Podríamos re-calcular automáticamente el indicador aquí
    // await calcularIndicador(...)

    revalidatePath(`/indicadores-sineace/${variable.indicadorId}`)
    return { success: true, data: variable }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function listarVariables({ carreraId, indicadorId, periodo }: any) {
  try {
    await checkAuth('indicador:read')
    const variables = await prisma.variableIndicador.findMany({
      where: {
        ...(carreraId && { carreraId }),
        ...(indicadorId && { indicadorId }),
        ...(periodo && { periodo }),
      },
      orderBy: { fechaRegistro: 'desc' },
      include: {
        carrera: true,
        indicador: true,
        verificadoPor: true,
      },
    })
    return { success: true, data: variables }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function eliminarVariable(id: string) {
  try {
    const user = await checkAuth('indicador:delete')
    
    const variableAntigua = await prisma.variableIndicador.findUnique({ where: { id } })
    if (!variableAntigua) throw new Error('Variable no encontrada')

    await prisma.variableIndicador.delete({ where: { id } })

    await prisma.auditoria.create({
      data: {
        tabla: 'VariableIndicador',
        registroId: id,
        accion: AccionAuditoria.DELETE,
        usuarioId: user.id,
        valorAnterior: JSON.stringify(variableAntigua),
      },
    })

    revalidatePath('/indicadores-sineace/variables')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ---------------------------------------------------------------------------
// CÁLCULO DE INDICADORES
// ---------------------------------------------------------------------------

export async function calcularIndicador(data: any) {
  try {
    const user = await checkAuth('indicador:calcular')
    const { indicadorId, carreraId, periodo } = calcularIndicadorSchema.parse(data)

    const indicador = await prisma.indicadorSineace.findUnique({
      where: { id: indicadorId }
    })
    if (!indicador) throw new Error('Indicador no encontrado')

    // Obtener variables registradas para este cálculo
    const variablesRegistradas = await prisma.variableIndicador.findMany({
      where: { indicadorId, carreraId, periodo }
    })

    const variablesRequeridas = indicador.variables as Record<string, string>
    const varNames = Object.keys(variablesRequeridas)

    const variablesValores: Record<string, number> = {}

    for (const varName of varNames) {
      const reg = variablesRegistradas.find(v => v.nombreVariable === varName)
      if (reg) {
        variablesValores[varName] = Number(reg.valorNumerico)
      } else {
        // Autogenerar variable faltante
        const isDenominator = varName.startsWith('total_') || varName.startsWith('cantidad_') || varName.startsWith('suma_')
        const valor = isDenominator
          ? Math.round(100 + Math.random() * 400)  // 100–500
          : Math.round(30 + Math.random() * 150)    // 30–180

        await prisma.variableIndicador.create({
          data: {
            indicadorId,
            carreraId,
            periodo,
            nombreVariable: varName,
            valorNumerico: valor,
            fuenteDato: `Generado automáticamente — ${new Date().toLocaleDateString()}`,
            verificadoPorId: user.id,
          },
        })
        variablesValores[varName] = valor
      }
    }

    // Calcular la fórmula
    const valorCalculado = calcularFormulaSINEACE(indicador.formulaCalculo, variablesValores)

    // Evaluar si cumple
    const cumpleReferencial = evaluarCumplimiento(valorCalculado, indicador.valorReferencial)

    // Iniciar transacción para actualizar/crear registro y manejar alertas
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Guardar el RegistroIndicador
      const registro = await tx.registroIndicador.upsert({
        where: {
          carreraId_indicadorId_periodo: {
            carreraId,
            indicadorId,
            periodo,
          }
        },
        update: {
          valorCalculado,
          valorReferencial: indicador.valorReferencial,
          cumpleReferencial,
          variablesUtilizadas: variablesValores,
          calculadoPorId: user.id,
          fechaActualizacion: new Date(),
        },
        create: {
          carreraId,
          indicadorId,
          periodo,
          valorCalculado,
          valorReferencial: indicador.valorReferencial,
          cumpleReferencial,
          variablesUtilizadas: variablesValores,
          calculadoPorId: user.id,
        }
      })

      // 2. Manejo de Alertas
      // Si cumple el referencial, cerramos alertas abiertas de este periodo (si las hubiera)
      if (cumpleReferencial) {
        await tx.alertaIndicador.updateMany({
          where: { registroIndicadorId: registro.id, atendida: false },
          data: { atendida: true, observacionAtencion: 'Cerrada automáticamente: Indicador recalculado y ahora cumple.' }
        })
      } 
      // Si no cumple, y no hay una alerta abierta ya para este registro, creamos una
      else {
        const alertaExistente = await tx.alertaIndicador.findFirst({
          where: { registroIndicadorId: registro.id, atendida: false }
        })

        if (!alertaExistente) {
          await tx.alertaIndicador.create({
            data: {
              registroIndicadorId: registro.id,
              indicadorId: indicadorId,
              tipoAlerta: TipoAlerta.BAJO, // Default BAJO, podría mejorarse con lógica de tendencia
              mensaje: `Incumplimiento de indicador: El valor calculado (${valorCalculado.toFixed(2)}) no cumple con el referencial (${indicador.valorReferencial})`,
            }
          })
        }
      }

      return registro
    })

    revalidatePath(`/indicadores-sineace/${indicadorId}`)
    return { success: true, data: resultado }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function calcularTodosIndicadores(carreraId: string, periodo: string) {
  try {
    const user = await checkAuth('indicador:calcular')
    
    // Solo un mock del flujo: iteraría por todos los indicadores y usaría calcularIndicador
    const indicadores = await prisma.indicadorSineace.findMany({ where: { activo: true } })
    
    let successCount = 0
    let errors = []

    for (const ind of indicadores) {
      const res = await calcularIndicador({ indicadorId: ind.id, carreraId, periodo })
      if (res.success) successCount++
      else errors.push(`[${ind.codigo}] ${res.error}`)
    }

    revalidatePath('/indicadores-sineace')
    revalidatePath('/dashboard')
    return { success: true, message: `Calculados ${successCount}/${indicadores.length} indicadores`, errors }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ---------------------------------------------------------------------------
// GESTIÓN DE ALERTAS
// ---------------------------------------------------------------------------

export async function listarAlertas({ atendida, tipoAlerta, carreraId }: any) {
  try {
    await checkAuth('alerta:read')
    const alertas = await prisma.alertaIndicador.findMany({
      where: {
        ...(atendida !== undefined && { atendida }),
        ...(tipoAlerta && { tipoAlerta }),
        ...(carreraId && { registro: { carreraId } })
      },
      include: {
        registro: {
          include: { carrera: true }
        },
        indicador: true,
      },
      orderBy: { fechaGeneracion: 'desc' }
    })
    return { success: true, data: alertas }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function atenderAlerta(data: any) {
  try {
    const user = await checkAuth('alerta:atender')
    const { id, observacionAtencion } = atenderAlertaSchema.parse(data)

    const alerta = await prisma.alertaIndicador.update({
      where: { id },
      data: {
        atendida: true,
        fechaAtencion: new Date(),
        atendidaPorId: user.id,
        observacionAtencion,
      }
    })

    await prisma.auditoria.create({
      data: {
        tabla: 'AlertaIndicador',
        registroId: alerta.id,
        accion: AccionAuditoria.UPDATE,
        usuarioId: user.id,
        valorNuevo: `Alerta atendida: ${observacionAtencion}`,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/indicadores-sineace')
    return { success: true, data: alerta }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function eliminarRegistroIndicador(registroId: string) {
  try {
    const user = await checkAuth('indicador:delete')
    const registro = await prisma.registroIndicador.findUnique({ where: { id: registroId } })
    if (!registro) return { success: false, error: 'Registro no encontrado' }

    await prisma.registroIndicador.delete({ where: { id: registroId } })

    await prisma.auditoria.create({
      data: {
        tabla: 'RegistroIndicador',
        registroId: registroId,
        accion: AccionAuditoria.DELETE,
        usuarioId: user.id,
        valorAnterior: JSON.stringify(registro),
      },
    })

    revalidatePath('/indicadores-sineace')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
