import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Configurar locale de fechas globalmente
dayjs.locale('es')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return dayjs(date).format('DD/MM/YYYY')
}

export function formatDateTime(date: Date | string | number) {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

// -------------------------------------------------------------
// Utilidades para los Indicadores SINEACE
// -------------------------------------------------------------

export type OperadorRelacional = '≥' | '≤' | '>' | '<' | '=' | '=='

export interface ValorReferencialParsed {
  operador: OperadorRelacional
  umbral: number
}

/**
 * Parsea un valor referencial en formato string ("≥ 60%") a su operador y valor numérico.
 */
export function parseValorReferencial(referencial: string): ValorReferencialParsed {
  // Limpiar espacios extra y comillas si las tuviera
  const limpio = referencial.trim().replace(/['"]/g, '')

  // Expresión regular para separar operador y número
  const match = limpio.match(/^(≥|≤|>|<|=|==)\s*([\d.,]+)\s*%?.*$/)

  if (!match) {
    throw new Error(`Formato de valor referencial inválido: "${referencial}"`)
  }

  return {
    operador: match[1] as OperadorRelacional,
    // Reemplazar coma por punto para parsear decimales correctamente
    umbral: parseFloat(match[2].replace(',', '.')),
  }
}

/**
 * Evalúa si un valor calculado cumple con el valor referencial (SIN USAR eval())
 */
export function evaluarCumplimiento(valorCalculado: number, referencialStr: string): boolean {
  const { operador, umbral } = parseValorReferencial(referencialStr)

  switch (operador) {
    case '≥':
      return valorCalculado >= umbral
    case '≤':
      return valorCalculado <= umbral
    case '>':
      return valorCalculado > umbral
    case '<':
      return valorCalculado < umbral
    case '=':
    case '==':
      return valorCalculado === umbral
    default:
      throw new Error(`Operador no soportado: ${operador}`)
  }
}
