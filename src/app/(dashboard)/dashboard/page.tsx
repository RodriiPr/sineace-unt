import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { RadarChartSineace } from '@/components/dashboard/RadarChartSineace'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AlertCircle, CheckCircle2, Activity, ShieldAlert } from 'lucide-react'

export const metadata = {
  title: 'Dashboard Principal | SINEACE UNT',
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const carreraActivaId = cookieStore.get('carreraId')?.value

  const filterRegistro = carreraActivaId ? { carreraId: carreraActivaId } : {}
  const filterAlerta = carreraActivaId ? { registro: { carreraId: carreraActivaId } } : {}
  const carreraNombre = carreraActivaId
    ? (await prisma.carrera.findFirst({ where: { id: carreraActivaId, activo: true }, select: { nombre: true } }))?.nombre
    : undefined

  const totalIndicadores = await prisma.indicadorSineace.count({ where: { activo: true } })
  const carrerasActivasCount = await prisma.carrera.count({ where: { activo: true } })
  const expectedTotal = carreraActivaId ? totalIndicadores : totalIndicadores * carrerasActivasCount
  const alertasAbiertas = await prisma.alertaIndicador.count({ where: { atendida: false, ...filterAlerta } })
  // Obtener el último periodo con registros
  const ultimoPeriodo = await prisma.registroIndicador.findFirst({
    where: { ...filterRegistro },
    orderBy: { periodo: 'desc' },
    select: { periodo: true },
  })

  // KPIs reales desde RegistroIndicador
  let indicadoresEvaluados = 0
  let indicadoresCumplen = 0
  let porcentajeCumplimiento = 0
  let periodoAnteriorCumplimiento: number | null = null

  if (ultimoPeriodo) {
    const registrosUltimo = await prisma.registroIndicador.findMany({
      where: { periodo: ultimoPeriodo.periodo, ...filterRegistro },
      select: { id: true, cumpleReferencial: true },
    })
    indicadoresEvaluados = registrosUltimo.length
    indicadoresCumplen = registrosUltimo.filter((r) => r.cumpleReferencial).length
    porcentajeCumplimiento = indicadoresEvaluados > 0
      ? Math.round((indicadoresCumplen / indicadoresEvaluados) * 100)
      : 0

    // Periodo anterior para comparación
    const periodos = await prisma.registroIndicador.findMany({
      distinct: ['periodo'],
      select: { periodo: true },
      orderBy: { periodo: 'desc' },
      take: 2,
    })
    if (periodos.length > 1) {
      const registrosAnterior = await prisma.registroIndicador.findMany({
        where: { periodo: periodos[1].periodo, ...filterRegistro },
        select: { id: true, cumpleReferencial: true },
      })
      const cumplenAnterior = registrosAnterior.filter((r) => r.cumpleReferencial).length
      periodoAnteriorCumplimiento = registrosAnterior.length > 0
        ? Math.round((cumplenAnterior / registrosAnterior.length) * 100)
        : null
    }
  }

  const diffPeriodo = periodoAnteriorCumplimiento !== null
    ? porcentajeCumplimiento - periodoAnteriorCumplimiento
    : null

  // Radar: cumplimiento por estándar
  const estandares = await prisma.estandarSineace.findMany({
    where: { activo: true },
    include: {
      indicadores: {
        where: { activo: true },
        select: { id: true },
      },
    },
    orderBy: { codigo: 'asc' },
  })

  const radarData = []
  if (ultimoPeriodo) {
    for (const est of estandares) {
      const indicadorIds = est.indicadores.map((i) => i.id)
      const registros = await prisma.registroIndicador.findMany({
        where: {
          indicadorId: { in: indicadorIds },
          periodo: ultimoPeriodo.periodo,
          ...filterRegistro,
        },
        select: { id: true, cumpleReferencial: true },
      })
      const cumplen = registros.filter((r) => r.cumpleReferencial).length
      const cumplimiento = registros.length > 0
        ? Math.round((cumplen / registros.length) * 100)
        : 0
      radarData.push({
        estandar: est.codigo,
        cumplimiento,
        fullMark: 100,
      })
    }
  } else {
    for (const est of estandares) {
      radarData.push({
        estandar: est.codigo,
        cumplimiento: 0,
        fullMark: 100,
      })
    }
  }

  // Últimas alertas
  const alertasRaw = await prisma.alertaIndicador.findMany({
    where: { atendida: false, ...filterAlerta },
    take: 5,
    orderBy: { fechaGeneracion: 'desc' },
    include: {
      indicador: true,
      registro: { include: { carrera: true } },
    },
  })

  // Serializar para evitar Decimal en console.error
  const alertas = alertasRaw.map((a) => ({
    ...a,
    registro: { ...a.registro, valorCalculado: Number(a.registro.valorCalculado) },
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard de Acreditación</h1>
        <p className="text-muted-foreground mt-1">
          Visión del cumplimiento del Modelo CONEAU 2025
          {carreraNombre && <span className="ml-2 text-sm">— <span className="font-semibold">{carreraNombre}</span></span>}
          {ultimoPeriodo && <span className="ml-2 text-sm">— Periodo: <span className="font-semibold">{ultimoPeriodo.periodo}</span></span>}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Global</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {ultimoPeriodo ? `${porcentajeCumplimiento}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {diffPeriodo !== null
                ? `${diffPeriodo >= 0 ? '+' : ''}${diffPeriodo}% vs periodo anterior`
                : ultimoPeriodo ? 'Primer periodo registrado' : 'Sin datos aún'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Evaluados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {indicadoresEvaluados} / {expectedTotal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expectedTotal - indicadoresEvaluados > 0
                ? `Faltan ${expectedTotal - indicadoresEvaluados} indicadores por evaluar`
                : 'Todos los indicadores han sido evaluados'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{carreraNombre ? 'Programa Filtrado' : 'Programas en Proceso'}</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{carreraNombre || carrerasActivasCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {carreraNombre ? 'Programa de estudio seleccionado' : 'Programas de estudio activos'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Alertas Tempranas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{alertasAbiertas}</div>
            <p className="text-xs text-red-600/80 mt-1">
              {alertasAbiertas > 0 ? 'Requieren atención inmediata' : 'Sin alertas pendientes'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico Radar SINEACE */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Cumplimiento por Estándares SINEACE</CardTitle>
            <CardDescription>
              Promedio de los 10 estándares del Modelo CONEAU 2025
              {ultimoPeriodo ? ` — ${ultimoPeriodo.periodo}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadarChartSineace data={radarData} />
          </CardContent>
        </Card>

        {/* Panel de Alertas Tempranas */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Alertas Recientes
              <Badge variant="destructive" className="ml-2">{alertasAbiertas} pendientes</Badge>
            </CardTitle>
            <CardDescription>
              Indicadores críticos que no cumplen el valor referencial
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 rounded-lg border-dashed border-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-slate-600">No hay alertas tempranas pendientes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-red-50/30 border-red-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    <div className="flex justify-between items-start pl-2">
                      <div className="font-semibold text-sm text-slate-900">
                        {alerta.indicador.codigo} - {alerta.registro.carrera.codigo}
                      </div>
                      <Badge variant="outline" className="text-[10px] text-red-700 bg-red-100 border-red-200">
                        {alerta.tipoAlerta}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 pl-2 leading-relaxed">
                      {alerta.mensaje}
                    </p>
                    <div className="flex justify-between items-center mt-2 pl-2 border-t pt-2 border-red-100">
                      <span className="text-[10px] text-slate-500">
                        Periodo: {alerta.registro.periodo}
                      </span>
                      <Link href={`/indicadores-sineace/${alerta.indicadorId}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "h-6 text-xs text-blue-600 hover:text-blue-800" })}>
                        Revisar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <Link href="/indicadores-sineace" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
                Ver todas las alertas
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
