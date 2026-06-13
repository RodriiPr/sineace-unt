import { z } from 'zod'

export const registrarVariableSchema = z.object({
  carreraId: z.string().cuid('ID de carrera inválido'),
  indicadorId: z.string().cuid('ID de indicador inválido'),
  periodo: z.string().min(1, 'El periodo es obligatorio'),
  nombreVariable: z.string().min(1, 'El nombre de la variable es obligatorio'),
  valorNumerico: z.number().min(0, 'El valor no puede ser negativo'),
  fuenteDato: z.string().min(1, 'La fuente de información es obligatoria'),
})

export type RegistrarVariableInput = z.infer<typeof registrarVariableSchema>

export const actualizarVariableSchema = z.object({
  id: z.string().cuid('ID de variable inválido'),
  valorNumerico: z.number().min(0, 'El valor no puede ser negativo'),
  fuenteDato: z.string().min(1, 'La fuente de información es obligatoria'),
})

export type ActualizarVariableInput = z.infer<typeof actualizarVariableSchema>

export const calcularIndicadorSchema = z.object({
  indicadorId: z.string().cuid('ID de indicador inválido'),
  carreraId: z.string().cuid('ID de carrera inválido'),
  periodo: z.string().min(1, 'El periodo es obligatorio'),
})

export type CalcularIndicadorInput = z.infer<typeof calcularIndicadorSchema>

export const atenderAlertaSchema = z.object({
  id: z.string().cuid('ID de alerta inválido'),
  observacionAtencion: z.string().min(1, 'Debe ingresar una observación al atender la alerta'),
})

export type AtenderAlertaInput = z.infer<typeof atenderAlertaSchema>
