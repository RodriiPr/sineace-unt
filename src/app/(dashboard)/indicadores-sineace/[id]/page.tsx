import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { calcularIndicador } from '@/actions/indicador.actions'
import { TendenciaChart } from '@/components/indicadores/TendenciaChart'
import { HistorialRegistros } from '@/components/indicadores/HistorialRegistros'

export default async function IndicadorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const indicador = await prisma.indicadorSineace.findUnique({
    where: { id },
    include: {
      estandar: true,
      registros: {
        include: { carrera: true, calculadoPor: { select: { nombre: true, apellido: true } } },
        orderBy: { periodo: 'desc' },
      },
    },
  })

  if (!indicador) notFound()

  // Serializar registros para evitar Decimal → Client Component error
  const registrosSerialized = indicador.registros.map((r) => ({
    ...r,
    valorCalculado: Number(r.valorCalculado),
    calculadoPor: r.calculadoPor ?? undefined,
  }))

  const variablesReq = indicador.variables as Record<string, string>

  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  const periodos = await prisma.registroIndicador.findMany({
    distinct: ['periodo'],
    select: { periodo: true },
    orderBy: { periodo: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/indicadores-sineace" className={buttonVariants({ variant: "outline", size: "sm" })}>
          &larr; Volver al catálogo
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-blue-600 text-sm px-3 py-1">{indicador.codigo}</Badge>
            <Badge variant="outline" className="text-slate-600">Estándar {indicador.estandar.codigo}</Badge>
            <Badge variant="secondary">{indicador.frecuenciaCalculo}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {indicador.nombre}
          </h1>
        </div>
        <form action={async (formData) => {
          'use server'
          const carreraId = formData.get('carreraId') as string
          const periodo = formData.get('periodo') as string
          if (carreraId && periodo) {
            await calcularIndicador({ indicadorId: id, carreraId, periodo })
          }
          revalidatePath(`/indicadores-sineace/${id}`)
        }} className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1">
            <label htmlFor="carreraId" className="text-[10px] font-medium text-slate-500">Carrera</label>
            <select
              id="carreraId"
              name="carreraId"
              required
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
            >
              <option value="">Seleccionar...</option>
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="periodo" className="text-[10px] font-medium text-slate-500">Periodo</label>
            <select
              id="periodo"
              name="periodo"
              required
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
            >
              <option value="">Seleccionar...</option>
              {(periodos.length > 0 ? periodos : [{ periodo: '2025-I' }, { periodo: '2024-II' }, { periodo: '2024-I' }]).map((p) => (
                <option key={p.periodo} value={p.periodo}>{p.periodo}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white h-8">
            Calcular
          </Button>
        </form>
      </div>

      {/* Gráfico de Tendencia */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Tendencia Histórica</CardTitle>
          <CardDescription className="text-xs">Evolución del indicador a lo largo de los periodos evaluados</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <TendenciaChart
            registros={registrosSerialized as any}
            valorReferencial={indicador.valorReferencial}
            tipoDato={indicador.tipoDato}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda - Ficha Técnica */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Ficha Técnica del Indicador</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Objetivo</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{indicador.objetivo}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">Valor Referencial Mínimo</h3>
                  <div className="text-2xl font-bold text-blue-700">{indicador.valorReferencial}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">Tipo de Dato</h3>
                  <div className="text-lg font-medium text-slate-700">{indicador.tipoDato}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Criterios a Evaluar</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {indicador.criterios.map((criterio) => (
                    <Badge key={criterio} variant="outline" className="bg-slate-100">{criterio}</Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-2">Interpretación</h3>
                <p className="text-sm text-slate-700 italic">{indicador.interpretacion}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Fórmula y Variables</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
                {indicador.formulaCalculo}
              </div>

              <h3 className="font-semibold text-slate-900 mb-3">Variables Requeridas:</h3>
              <div className="space-y-3">
                {Object.entries(variablesReq).map(([key, desc]) => (
                  <div key={key} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 border rounded-lg bg-slate-50">
                    <div className="font-mono text-sm font-semibold text-blue-700 min-w-[200px]">
                      {key}
                    </div>
                    <div className="text-sm text-slate-600">{desc}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Fuente de Información</h3>
                <p className="text-sm text-slate-600">{indicador.fuenteInformacion}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Historial y Estado */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cálculos</CardTitle>
              <CardDescription>Registros evaluados — haga clic en Eliminar para remover un registro.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-4">
                <HistorialRegistros registros={registrosSerialized as any} />
              </div>
            </CardContent>
          </Card>

          {indicador.notas && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                  📌 Notas Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {indicador.notas}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
