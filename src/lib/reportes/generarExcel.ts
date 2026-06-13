import * as XLSX from 'xlsx'

export interface ReporteExcelData {
  carrera: { nombre: string; codigo: string; facultad: { nombre: string } }
  periodo: string
  estandares: Array<{
    id: string
    codigo: string
    nombre: string
    indicadores: Array<{
      id: string
      codigo: string
      nombre: string
      valorReferencial: string
      tipoDato: string
      frecuenciaCalculo: string
      registroActual?: {
        valorCalculado: number
        cumpleReferencial: boolean
        fechaCalculo?: Date | string
      } | null
      registroAnterior?: {
        valorCalculado: number
        cumpleReferencial: boolean
      } | null
    }>
  }>
  totalIndicadores: number
  indicadoresCumplen: number
  indicadoresNoCumplen: number
  indicadoresSinCalcular: number
  fechaGeneracion: string
}

export function generarExcelBuffer(data: ReporteExcelData): Buffer {
  const wb = XLSX.utils.book_new()

  // =========================================================
  // Hoja 1: Resumen Global
  // =========================================================
  const resumenData = [
    ['UNIVERSIDAD NACIONAL DE TRUJILLO'],
    ['Sistema de Gestión de Acreditación — Reporte Oficial de Indicadores SINEACE'],
    ['Modelo CONEAU 2025 — Res. N.° 000106-2025-SINEACE/COSUSINEACE-P'],
    [],
    ['Carrera:', data.carrera.nombre],
    ['Código:', data.carrera.codigo],
    ['Facultad:', data.carrera.facultad.nombre],
    ['Periodo:', data.periodo],
    ['Fecha de generación:', data.fechaGeneracion],
    [],
    ['RESUMEN DE CUMPLIMIENTO'],
    ['Indicadores', 'Cantidad', 'Porcentaje'],
    ['Total', data.totalIndicadores, '100%'],
    ['Cumplen', data.indicadoresCumplen, data.totalIndicadores > 0 ? `${((data.indicadoresCumplen / data.totalIndicadores) * 100).toFixed(1)}%` : '0%'],
    ['No cumplen', data.indicadoresNoCumplen, data.totalIndicadores > 0 ? `${((data.indicadoresNoCumplen / data.totalIndicadores) * 100).toFixed(1)}%` : '0%'],
    ['Sin calcular', data.indicadoresSinCalcular, data.totalIndicadores > 0 ? `${((data.indicadoresSinCalcular / data.totalIndicadores) * 100).toFixed(1)}%` : '0%'],
  ]
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
  wsResumen['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Global')

  // =========================================================
  // Hoja 2: Detalle por Indicador
  // =========================================================
  const detalleHeader = [
    'Estándar',
    'Código Indicador',
    'Nombre',
    'Tipo Dato',
    'Frecuencia',
    'Valor Referencial',
    'Valor Calculado',
    'Cumple',
    'Valor Periodo Anterior',
    'Tendencia',
    'Fecha Cálculo',
  ]
  const detalleRows = [detalleHeader]

  for (const estandar of data.estandares) {
    for (const ind of estandar.indicadores) {
      const reg = ind.registroActual
      const regAnt = ind.registroAnterior
      let tendencia = '—'
      if (reg && regAnt) {
        const diff = Number(reg.valorCalculado) - Number(regAnt.valorCalculado)
        if (diff > 0.5) tendencia = `↗ Mejorando (+${diff.toFixed(1)})`
        else if (diff < -0.5) tendencia = `↘ Empeorando (${diff.toFixed(1)})`
        else tendencia = '→ Estable'
      }
      detalleRows.push([
        `${estandar.codigo} - ${estandar.nombre}`,
        ind.codigo,
        ind.nombre,
        ind.tipoDato,
        ind.frecuenciaCalculo,
        ind.valorReferencial,
        reg ? Number(reg.valorCalculado).toFixed(4) : '—',
        reg ? (reg.cumpleReferencial ? 'SÍ' : 'NO') : '—',
        regAnt ? Number(regAnt.valorCalculado).toFixed(4) : '—',
        tendencia,
        reg?.fechaCalculo ? String(reg.fechaCalculo) : '—',
      ])
    }
  }

  const wsDetalle = XLSX.utils.aoa_to_sheet(detalleRows)
  wsDetalle['!cols'] = [
    { wch: 30 }, { wch: 14 }, { wch: 50 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 10 },
    { wch: 20 }, { wch: 22 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle Indicadores')

  // =========================================================
  // Hoja 3: Plan de Mejoras
  // =========================================================
  const mejorasHeader = [
    'Estándar',
    'Código',
    'Indicador',
    'Valor Actual',
    'Valor Referencial',
    'Brecha',
    'Acción Sugerida',
  ]
  const mejorasRows = [mejorasHeader]

  for (const estandar of data.estandares) {
    for (const ind of estandar.indicadores) {
      if (ind.registroActual && !ind.registroActual.cumpleReferencial) {
        const brecha = Number(ind.registroActual.valorCalculado) - parseFloat(ind.valorReferencial.replace(/[^0-9.]/g, ''))
        mejorasRows.push([
          `${estandar.codigo} - ${estandar.nombre}`,
          ind.codigo,
          ind.nombre,
          Number(ind.registroActual.valorCalculado).toFixed(4),
          ind.valorReferencial,
          brecha.toFixed(2),
          'Revisar variables de entrada y fuente de datos. Verificar periodicidad del cálculo.',
        ])
      }
    }
  }

  const wsMejoras = XLSX.utils.aoa_to_sheet(mejorasRows.length > 1 ? mejorasRows : [mejorasHeader, ['', '', 'No se requieren mejoras — todos los indicadores cumplen.', '', '', '', '']])
  wsMejoras['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 50 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, wsMejoras, 'Plan de Mejoras')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return buffer
}
