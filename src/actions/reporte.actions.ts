'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { generarReporteSchema } from '@/lib/validators/reporte.schema'
import { AccionAuditoria, Rol } from '@prisma/client'
import dayjs from 'dayjs'

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
// GENERAR REPORTE DE INDICADORES SINEACE
// ---------------------------------------------------------------------------

async function obtenerPeriodoAnterior(periodo: string): Promise<string | null> {
  const match = periodo.match(/^(\d{4})-([III]+)$/)
  if (match) {
    const year = parseInt(match[1])
    const semestre = match[2]
    if (semestre === 'II') return `${year}-I`
    return `${year - 1}-II`
  }
  const yearMatch = periodo.match(/^(\d{4})$/)
  if (yearMatch) {
    return `${parseInt(yearMatch[1]) - 1}`
  }
  return null
}

async function queryReporteData(carreraId: string, periodo: string) {
  const carrera = await prisma.carrera.findUnique({
    where: { id: carreraId },
    include: { facultad: true },
  })
  if (!carrera) throw new Error('Carrera no encontrada')

  const periodoAnterior = await obtenerPeriodoAnterior(periodo)

  const estandares = await prisma.estandarSineace.findMany({
    where: { activo: true },
    include: {
      indicadores: {
        where: { activo: true },
        orderBy: { codigo: 'asc' },
      },
    },
    orderBy: { codigo: 'asc' },
  })

  // Obtener registros actuales y anteriores en bulk
  const todosIndicadoresIds = estandares.flatMap((e) => e.indicadores.map((i) => i.id))

  const [registrosActuales, registrosAnteriores] = await Promise.all([
    prisma.registroIndicador.findMany({
      where: {
        carreraId,
        periodo,
        indicadorId: { in: todosIndicadoresIds },
      },
    }),
    periodoAnterior
      ? prisma.registroIndicador.findMany({
          where: {
            carreraId,
            periodo: periodoAnterior,
            indicadorId: { in: todosIndicadoresIds },
          },
        })
      : Promise.resolve([]),
  ])

  const registrosActualesMap = new Map(registrosActuales.map((r) => [r.indicadorId, r]))
  const registrosAnterioresMap = new Map(registrosAnteriores.map((r) => [r.indicadorId, r]))

  let totalIndicadores = 0
  let indicadoresCumplen = 0
  let indicadoresNoCumplen = 0
  let indicadoresSinCalcular = 0

  const estandaresConData = estandares.map((est) => ({
    ...est,
    indicadores: est.indicadores.map((ind) => {
      totalIndicadores++
      const regActual = registrosActualesMap.get(ind.id) || null
      const regAnterior = registrosAnterioresMap.get(ind.id) || null

      if (!regActual) indicadoresSinCalcular++
      else if (regActual.cumpleReferencial) indicadoresCumplen++
      else indicadoresNoCumplen++

      return {
        ...ind,
        registroActual: regActual
          ? {
              ...regActual,
              valorCalculado: Number(regActual.valorCalculado),
            }
          : null,
        registroAnterior: regAnterior
          ? {
              ...regAnterior,
              valorCalculado: Number(regAnterior.valorCalculado),
            }
          : null,
      }
    }),
  }))

  return {
    carrera: { nombre: carrera.nombre, codigo: carrera.codigo, facultad: { nombre: carrera.facultad.nombre } },
    periodo,
    estandares: estandaresConData,
    totalIndicadores,
    indicadoresCumplen,
    indicadoresNoCumplen,
    indicadoresSinCalcular,
    fechaGeneracion: dayjs().format('DD/MM/YYYY HH:mm'),
  }
}

export async function generarReporteIndicadores(data: any) {
  try {
    const user = await checkAuth('reporte:generar')
    const parsed = generarReporteSchema.parse(data)

    const reportData = await queryReporteData(parsed.carreraId, parsed.periodo)

    let buffer: Buffer
    let filename: string
    let mimeType: string

    if (parsed.formato === 'pdf') {
      // Generar PDF usando @react-pdf/renderer
      const React = await import('react')
      const { renderToBuffer } = await import('@react-pdf/renderer')
      const { ReportePDFDocument } = await import('@/components/reportes/ReportePDFDocument')

      const element = React.createElement(ReportePDFDocument, { data: reportData })
      buffer = (await renderToBuffer(element)) as Buffer
      filename = `Reporte_SINEACE_${reportData.carrera.codigo}_${parsed.periodo}.pdf`
      mimeType = 'application/pdf'
    } else {
      // Generar Excel
      const { generarExcelBuffer } = await import('@/lib/reportes/generarExcel')
      buffer = generarExcelBuffer(reportData)
      filename = `Reporte_SINEACE_${reportData.carrera.codigo}_${parsed.periodo}.xlsx`
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    // Auditoría
    await prisma.auditoria.create({
      data: {
        tabla: 'Reporte',
        registroId: `${parsed.carreraId}_${parsed.periodo}`,
        accion: AccionAuditoria.CREATE,
        usuarioId: user.id,
        valorNuevo: JSON.stringify({
          tipoReporte: parsed.tipoReporte,
          formato: parsed.formato,
          periodo: parsed.periodo,
          carreraId: parsed.carreraId,
        }),
      },
    })

    // Convertir buffer a base64 para enviar al cliente
    const base64 = buffer.toString('base64')

    revalidatePath('/reportes')

    return {
      success: true,
      data: {
        base64,
        filename,
        mimeType,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
