'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Rol } from '@prisma/client'
import type { Permission } from '@/lib/permissions'

async function checkAuth(perm: Permission) {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (!hasPermission(session.user.rol as Rol, perm)) throw new Error('Permisos insuficientes')
  return session.user
}

export async function crearCarrera(data: { nombre: string; codigo: string; facultadId: string }) {
  try {
    await checkAuth('carrera:create')
    await prisma.carrera.create({ data })
    revalidatePath('/carreras')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function actualizarCarrera(id: string, data: { nombre?: string; codigo?: string; facultadId?: string; activo?: boolean }) {
  try {
    await checkAuth('carrera:update')
    await prisma.carrera.update({ where: { id }, data })
    revalidatePath('/carreras')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function eliminarCarrera(id: string) {
  try {
    await checkAuth('carrera:delete')
    await prisma.carrera.delete({ where: { id } })
    revalidatePath('/carreras')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function crearFacultad(data: { nombre: string; codigo: string }) {
  try {
    await checkAuth('facultad:create')
    await prisma.facultad.create({ data })
    revalidatePath('/facultades')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function actualizarFacultad(id: string, data: { nombre?: string; codigo?: string; activo?: boolean }) {
  try {
    await checkAuth('facultad:update')
    await prisma.facultad.update({ where: { id }, data })
    revalidatePath('/facultades')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function eliminarFacultad(id: string) {
  try {
    await checkAuth('facultad:delete')
    await prisma.facultad.delete({ where: { id } })
    revalidatePath('/facultades')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
