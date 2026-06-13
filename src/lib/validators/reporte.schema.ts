import { z } from 'zod'

export const generarReporteSchema = z.object({
  carreraId: z.string().cuid('ID de carrera inválido'),
  periodo: z.string().min(1, 'El periodo es obligatorio'),
  tipoReporte: z.enum(['operacional', 'gestion', 'sineace']),
  formato: z.enum(['pdf', 'xlsx']),
})

export type GenerarReporteInput = z.infer<typeof generarReporteSchema>
