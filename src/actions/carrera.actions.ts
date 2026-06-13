'use server'

import { cookies } from 'next/headers'

export async function setCarreraActiva(carreraId: string) {
  const cookieStore = await cookies()
  cookieStore.set('carreraId', carreraId, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })
}
