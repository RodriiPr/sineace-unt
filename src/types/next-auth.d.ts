import { DefaultSession } from 'next-auth'
import { Rol } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: Rol
      nombre: string
      apellido: string
    } & DefaultSession['user']
  }

  interface User {
    rol: Rol
    nombre: string
    apellido: string
    activo: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    rol: Rol
    nombre: string
    apellido: string
  }
}
