'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { registrarAcreditacionSchema, actualizarEstadoAcreditacionSchema } from '@/lib/validators/acreditacion.schema'
import { AccionAuditoria, Rol, EstadoAcreditacion } from '@prisma/client'

async function checkAuth(permission: any) {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (!hasPermission(session.user.rol as Rol, permission)) {
    throw new Error('Permisos insuficientes')
  }
  return session.user
}

export async function registrarAcreditacion(data: any) {
  try {
    const user = await checkAuth('acreditacion:create')
    const parsed = registrarAcreditacionSchema.parse(data)

    const acreditacion = await prisma.acreditacion.create({
      data: {
        ...parsed,
        estado: EstadoAcreditacion.SOLICITUD,
        createdById: user.id,
      },
    })

    await prisma.auditoria.create({
      data: {
        tabla: 'Acreditacion',
        registroId: acreditacion.id,
        accion: AccionAuditoria.CREATE,
        usuarioId: user.id,
        valorNuevo: JSON.stringify(acreditacion),
      },
    })

    revalidatePath('/acreditaciones')
    return { success: true, data: acreditacion }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function actualizarEstadoAcreditacion(data: any) {
  try {
    const user = await checkAuth('acreditacion:update')
    const { id, estado } = actualizarEstadoAcreditacionSchema.parse(data)

    const acreditacionAnterior = await prisma.acreditacion.findUnique({ where: { id } })
    if (!acreditacionAnterior) throw new Error('Acreditación no encontrada')

    const updateData: any = { estado }
    
    // Automatizaciones basadas en el estado
    if (estado === EstadoAcreditacion.ACREDITADA || estado === EstadoAcreditacion.NO_ACREDITADA) {
      updateData.fechaFinReal = new Date()
    }

    const acreditacion = await prisma.acreditacion.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditoria.create({
      data: {
        tabla: 'Acreditacion',
        registroId: acreditacion.id,
        accion: AccionAuditoria.UPDATE,
        usuarioId: user.id,
        valorAnterior: JSON.stringify({ estado: acreditacionAnterior.estado }),
        valorNuevo: JSON.stringify({ estado }),
      },
    })

    revalidatePath(`/acreditaciones/${id}`)
    revalidatePath('/acreditaciones')
    return { success: true, data: acreditacion }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
