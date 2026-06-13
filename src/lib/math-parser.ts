import { z } from 'zod'

/**
 * Evalúa expresiones matemáticas simples (+, -, *, /, (), %)
 * de forma segura sin usar eval().
 * Solo soporta números y operadores aritméticos básicos.
 */
export function safeMathEvaluate(expression: string): number {
  // Limpiar la expresión de espacios innecesarios
  const expr = expression.replace(/\s+/g, '')

  // Validar que solo contiene números, operadores, paréntesis y puntos decimales
  if (!/^[\d.+\-*/()]+$/.test(expr)) {
    throw new Error('Expresión matemática inválida o contiene caracteres no permitidos')
  }

  // Usamos el constructor Function que es más seguro que eval
  // pero primero nos aseguramos (arriba) de que solo contenga matemática básica
  return new Function(`return ${expr}`)()
}

/**
 * Reemplaza variables en una fórmula por sus valores correspondientes
 * y luego la evalúa de forma segura.
 */
export function calcularFormulaSINEACE(formula: string, variablesValores: Record<string, number>): number {
  let expr = formula

  // Reemplazar cada variable en la fórmula por su valor
  for (const [variable, valor] of Object.entries(variablesValores)) {
    // Usar regex con word boundary \b para evitar reemplazar subcadenas
    const regex = new RegExp(`\\b${variable}\\b`, 'g')
    expr = expr.replace(regex, valor.toString())
  }

  // Verificar si quedaron letras en la expresión (variables no reemplazadas)
  if (/[a-zA-Z_]+/.test(expr)) {
    throw new Error(`Faltan variables por asignar en la fórmula: ${expr}`)
  }

  // Evaluar de forma segura
  return safeMathEvaluate(expr)
}
