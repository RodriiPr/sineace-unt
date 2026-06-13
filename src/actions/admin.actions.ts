'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Rol } from '@prisma/client'

async function checkSuperAdmin() {
  const session = await auth()
  if (!session?.user || session.user.rol !== Rol.SUPERADMIN) throw new Error('Solo SUPERADMIN puede realizar esta acción')
  return session.user
}

export async function cambiarRolUsuario(userId: string, nuevoRol: Rol) {
  try {
    await checkSuperAdmin()
    await prisma.user.update({ where: { id: userId }, data: { rol: nuevoRol } })
    revalidatePath('/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleActivoUsuario(userId: string, activo: boolean) {
  try {
    await checkSuperAdmin()
    await prisma.user.update({ where: { id: userId }, data: { activo } })
    revalidatePath('/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
