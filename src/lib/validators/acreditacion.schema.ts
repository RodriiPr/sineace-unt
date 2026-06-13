import { z } from 'zod'
import { EstadoAcreditacion } from '@prisma/client'

export const registrarAcreditacionSchema = z.object({
  carreraId: z.string().cuid('ID de carrera inválido'),
  entidadAcreditadora: z.string().min(1, 'La entidad acreditadora es obligatoria'),
  modelo: z.string().min(1, 'El modelo es obligatorio (ej. CONEAU 2025)'),
  fechaInicio: z.coerce.date(),
  fechaFinEstimada: z.coerce.date().optional(),
})

export type RegistrarAcreditacionInput = z.infer<typeof registrarAcreditacionSchema>

export const actualizarEstadoAcreditacionSchema = z.object({
  id: z.string().cuid('ID de acreditación inválido'),
  estado: z.nativeEnum(EstadoAcreditacion),
})

export type ActualizarEstadoAcreditacionInput = z.infer<typeof actualizarEstadoAcreditacionSchema>
