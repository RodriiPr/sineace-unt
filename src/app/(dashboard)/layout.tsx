import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { LogOut } from 'lucide-react'
import { CarreraSelector } from '@/components/layout/CarreraSelector'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  const cookieStore = await cookies()
  const carreraActivaId = cookieStore.get('carreraId')?.value

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-900">
          <span className="text-xl">SINEACE UNT</span>
        </Link>
        <nav className="hidden md:flex gap-5 text-sm font-medium ml-6">
          <Link href="/dashboard" className="transition-colors hover:text-blue-600">Dashboard</Link>
          <Link href="/indicadores-sineace" className="transition-colors hover:text-blue-600">Indicadores</Link>
          <Link href="/acreditaciones" className="transition-colors hover:text-blue-600">Acreditaciones</Link>
          <Link href="/reportes" className="transition-colors hover:text-blue-600">Reportes</Link>
          <span className="text-slate-300">|</span>
          <Link href="/carreras" className="transition-colors hover:text-blue-600 text-slate-500">Carreras</Link>
          <Link href="/facultades" className="transition-colors hover:text-blue-600 text-slate-500">Facultades</Link>
          <Link href="/auditoria" className="transition-colors hover:text-blue-600 text-slate-500">Auditoría</Link>
          <Link href="/usuarios" className="transition-colors hover:text-blue-600 text-slate-500">Usuarios</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <CarreraSelector carreras={carreras} activaId={carreraActivaId} />
          <div className="text-sm hidden sm:block">
            <span className="font-semibold">{session.user.nombre} {session.user.apellido}</span>
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
              {session.user.rol}
            </span>
          </div>
          <form action={async () => {
            'use server'
            await signOut()
          }}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
