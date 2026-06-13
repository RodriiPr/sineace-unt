import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ReportesClient } from '@/components/reportes/ReportesClient'

export const metadata = {
  title: 'Reportes | SINEACE UNT',
}

export default async function ReportesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const cookieStore = await cookies()
  const carreraActivaId = cookieStore.get('carreraId')?.value

  const carreras = await prisma.carrera.findMany({
    where: { activo: true },
    include: { facultad: true },
    orderBy: { nombre: 'asc' },
  })

  // Obtener periodos disponibles desde los registros de indicadores
  const periodosDesdeRegistros = await prisma.registroIndicador.findMany({
    select: { periodo: true },
    distinct: ['periodo'],
    orderBy: { periodo: 'desc' },
  })

  const periodosDesdeVariables = await prisma.variableIndicador.findMany({
    select: { periodo: true },
    distinct: ['periodo'],
    orderBy: { periodo: 'desc' },
  })

  // Combinar y deduplicar periodos
  const periodosSet = new Set<string>()
  for (const r of periodosDesdeRegistros) periodosSet.add(r.periodo)
  for (const v of periodosDesdeVariables) periodosSet.add(v.periodo)

  const periodos = Array.from(periodosSet)
    .sort()
    .reverse()
    .map((p) => ({ periodo: p }))

  if (periodos.length === 0) {
    // Si no hay periodos en BD, ofrecer opciones por defecto
    const defaultPeriodos = ['2025-I', '2024-II', '2024-I', '2023-II', '2023-I']
    periodos.push(...defaultPeriodos.map((p) => ({ periodo: p })))
  }

  return (
    <div className="space-y-6">
      <ReportesClient carreras={carreras} periodos={periodos} carreraActivaId={carreraActivaId || undefined} />
    </div>
  )
}
