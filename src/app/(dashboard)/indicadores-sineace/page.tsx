import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { calcularTodosIndicadores } from '@/actions/indicador.actions'
import { revalidatePath } from 'next/cache'
import { FiltrosIndicadores } from '@/components/indicadores/FiltrosIndicadores'
import { CalcularTodosButton } from '@/components/indicadores/CalcularTodosButton'

export const metadata = {
  title: 'Indicadores SINEACE | Sistema de Acreditación UNT',
}

export default async function IndicadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ carreraId?: string; periodo?: string; estado?: string }>
}) {
  const { carreraId, periodo, estado } = await searchParams

  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  const periodosDB = await prisma.registroIndicador.findMany({
    distinct: ['periodo'],
    select: { periodo: true },
    orderBy: { periodo: 'desc' },
  })
  const periodos = periodosDB.length > 0 ? periodosDB : [{ periodo: '2025-I' }, { periodo: '2024-II' }, { periodo: '2024-I' }]
  const periodoActivo = periodo || periodos[0]?.periodo || ''

  // Obtener todos los registros del periodo y carrera seleccionados
  let registrosMap = new Map<string, { valorCalculado: number; cumpleReferencial: boolean }>()
  if (carreraId && periodoActivo) {
    const registros = await prisma.registroIndicador.findMany({
      where: { carreraId, periodo: periodoActivo },
      select: { indicadorId: true, valorCalculado: true, cumpleReferencial: true },
    })
    for (const r of registros) {
      registrosMap.set(r.indicadorId, { valorCalculado: Number(r.valorCalculado), cumpleReferencial: r.cumpleReferencial })
    }
  }

  const estandares = await prisma.estandarSineace.findMany({
    where: { activo: true },
    include: {
      indicadores: {
        where: { activo: true },
        orderBy: { codigo: 'asc' },
      },
    },
    orderBy: { codigo: 'asc' },
  })

  // Aplicar filtro por estado
  const estandaresFiltrados = estandares
    .map((est) => ({
      ...est,
      indicadores: est.indicadores.filter((ind) => {
        const reg = registrosMap.get(ind.id)
        if (!estado || estado === 'todos') return true
        if (estado === 'cumple') return reg?.cumpleReferencial === true
        if (estado === 'no-cumple') return reg?.cumpleReferencial === false
        if (estado === 'sin-calcular') return !reg
        return true
      }),
    }))
    .filter((est) => est.indicadores.length > 0)

  const totalCalculados = registrosMap.size
  const totalCumplen = Array.from(registrosMap.values()).filter((r) => r.cumpleReferencial).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Indicadores SINEACE 2025</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y evaluación de los 29 indicadores obligatorios del Modelo CONEAU 2025
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/indicadores-sineace/variables" className={buttonVariants({ variant: "outline" })}>
            Ingresar Variables
          </Link>
        </div>
      </div>

      {/* Barra de filtros */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b py-2.5">
          <CardTitle className="text-sm">Filtros y Cálculo</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <FiltrosIndicadores
            carreras={carreras}
            periodos={periodos}
            carreraId={carreraId}
            periodoActivo={periodoActivo}
            estado={estado}
            totalCalculados={totalCalculados}
            totalCumplen={totalCumplen}
          />
          {/* Cálculo masivo */}
          {carreraId && (
            <div className="mt-3">
              <CalcularTodosButton
                carreraId={carreraId}
                periodo={periodoActivo}
                indicadorIds={estandares.flatMap((e) => e.indicadores.map((i) => i.id))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de estándares */}
      <div className="grid gap-6">
        {!carreraId ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg mb-2">Seleccione una carrera y periodo</p>
            <p className="text-slate-400 text-sm">Use los filtros superiores para ver el estado de los indicadores.</p>
          </div>
        ) : (
          estandaresFiltrados.map((estandar) => (
            <Card key={estandar.id} className="border-l-4 border-l-blue-600 shadow-sm">
              <CardHeader className="pb-3 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                      Estándar {estandar.codigo}
                    </Badge>
                    <CardTitle className="text-xl">{estandar.nombre}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm mt-2">{estandar.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {estandar.indicadores.map((indicador) => {
                    const reg = registrosMap.get(indicador.id)
                    return (
                      <Link 
                        key={indicador.id} 
                        href={`/indicadores-sineace/${indicador.id}`}
                        className="group"
                      >
                        <div className="h-full rounded-lg border p-4 hover:border-blue-500 hover:shadow-md transition-all flex flex-col bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                              {indicador.codigo}
                            </span>
                            <div className="flex gap-1.5">
                              {reg && (
                                <Badge className={reg.cumpleReferencial ? 'bg-green-600 text-[10px]' : 'bg-red-600 text-[10px]'}>
                                  {reg.cumpleReferencial ? 'Cumple' : 'No cumple'}
                                </Badge>
                              )}
                              {!reg && carreraId && (
                                <Badge variant="outline" className="text-[10px]">Sin calcular</Badge>
                              )}
                              <Badge variant="secondary" className="text-[10px]">
                                {indicador.frecuenciaCalculo}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                            {indicador.nombre}
                          </p>
                          <div className="mt-auto pt-3 border-t flex justify-between items-center text-xs">
                            <span className="text-slate-500">
                              Ref: <span className="font-semibold text-slate-700">{indicador.valorReferencial}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {reg && (
                                <span className={`font-bold ${reg.cumpleReferencial ? 'text-green-600' : 'text-red-600'}`}>
                                  {Number(reg.valorCalculado).toFixed(1)}
                                  {indicador.tipoDato === 'PORCENTAJE' ? '%' : ''}
                                </span>
                              )}
                              <span className="text-blue-600 font-medium group-hover:underline">
                                Ver detalle &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {carreraId && estandaresFiltrados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg mb-2">No hay indicadores con este filtro</p>
            <p className="text-slate-400 text-sm">Intente cambiar el filtro de estado o periodo.</p>
          </div>
        )}
      </div>
    </div>
  )
}
