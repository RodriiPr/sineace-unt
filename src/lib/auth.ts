import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from './prisma'
import { Rol } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = loginSchema.safeParse(credentials)

          if (!parsedCredentials.success) {
            console.error('Invalid credentials format')
            return null
          }

          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            return null
          }

          if (!user.activo) {
            console.error('User is disabled')
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              rol: user.rol,
              nombre: user.nombre,
              apellido: user.apellido,
              activo: user.activo,
            }
          }

          return null
        } catch (error) {
          console.error('Error in authorize:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.rol = user.rol as Rol
        token.nombre = user.nombre as string
        token.apellido = user.apellido as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.rol = token.rol
        session.user.nombre = token.nombre
        session.user.apellido = token.apellido
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
      const isLoginRoute = nextUrl.pathname.startsWith('/login')

      if (isApiAuthRoute) {
        return true
      }

      if (isLoginRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true
      }

      // Proteger todas las rutas del dashboard
      const isDashboardRoute =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/carreras') ||
        nextUrl.pathname.startsWith('/facultades') ||
        nextUrl.pathname.startsWith('/acreditaciones') ||
        nextUrl.pathname.startsWith('/indicadores-sineace') ||
        nextUrl.pathname.startsWith('/reportes')

      if (isDashboardRoute) {
        if (!isLoggedIn) {
          return false // Redirige a signIn (/login)
        }
        return true
      }

      // Por defecto, permitir acceso (ej: landing page)
      return true
    },
  },
})
