import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { actualizarEstadoAcreditacion } from '@/actions/acreditacion.actions'
import { EstadoAcreditacion } from '@prisma/client'

export default async function AcreditacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const acreditacion = await prisma.acreditacion.findUnique({
    where: { id },
    include: {
      carrera: {
        include: { facultad: true }
      }
    }
  })

  if (!acreditacion) notFound()

  const estadosDisponibles = Object.values(EstadoAcreditacion)

  const periodos = await prisma.registroIndicador.findMany({
    where: { carreraId: acreditacion.carreraId },
    distinct: ['periodo'],
    select: { periodo: true },
    orderBy: { periodo: 'desc' },
  })

  const indicadoresConRegistros = await prisma.indicadorSineace.findMany({
    where: { activo: true },
    include: {
      registros: {
        where: {
          carreraId: acreditacion.carreraId,
          periodo: periodos[0]?.periodo ?? '',
        },
      },
    },
    orderBy: { codigo: 'asc' },
  })

  const cumplen = indicadoresConRegistros.filter(i => i.registros[0]?.cumpleReferencial).length
  const noCumplen = indicadoresConRegistros.filter(i => i.registros[0] && !i.registros[0].cumpleReferencial).length
  const sinCalcular = indicadoresConRegistros.filter(i => !i.registros[0]).length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/acreditaciones" className={buttonVariants({ variant: "outline", size: "sm" })}>
          &larr; Volver
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={acreditacion.estado === 'ACREDITADA' ? 'default' : 'secondary'}
              className={acreditacion.estado === 'ACREDITADA' ? 'bg-green-600' : ''}>
              {acreditacion.estado.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-slate-500">{acreditacion.modelo}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {acreditacion.carrera.nombre}
          </h1>
          <p className="text-muted-foreground">{acreditacion.carrera.facultad.nombre}</p>
        </div>

        <form action={async (formData) => {
          'use server'
          const nuevoEstado = formData.get('estado') as string
          if (nuevoEstado) {
            await actualizarEstadoAcreditacion({ id, estado: nuevoEstado })
          }
          revalidatePath(`/acreditaciones/${id}`)
        }} className="flex items-end gap-2">
          <div className="space-y-1">
            <label htmlFor="estado" className="text-[10px] font-medium text-slate-500">Cambiar estado</label>
            <select
              id="estado"
              name="estado"
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
            >
              {estadosDisponibles.map((est) => (
                <option key={est} value={est} selected={est === acreditacion.estado}>
                  {est.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8">
            Actualizar
          </Button>
        </form>
      </div>

      {/* Datos del proceso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Fecha de Inicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatDate(acreditacion.fechaInicio)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Fin Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {acreditacion.fechaFinEstimada ? formatDate(acreditacion.fechaFinEstimada) : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Fin Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {acreditacion.fechaFinReal ? formatDate(acreditacion.fechaFinReal) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores SINEACE */}
      <Card>
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Indicadores SINEACE</CardTitle>
              <CardDescription>
                {periodos[0]
                  ? `Cumplimiento de los 29 indicadores — Periodo ${periodos[0].periodo}`
                  : 'Seleccione un periodo para ver el cumplimiento'}
              </CardDescription>
            </div>
            {periodos.length > 0 && (
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-semibold">{cumplen} cumplen</span>
                <span className="text-red-600 font-semibold">{noCumplen} no cumplen</span>
                <span className="text-slate-400 font-semibold">{sinCalcular} sin calcular</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {!periodos[0] ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Aún no hay indicadores calculados para esta carrera. Diríjase al módulo de indicadores para registrar variables y calcular.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Referencial</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadoresConRegistros.map((ind) => {
                  const reg = ind.registros[0]
                  return (
                    <TableRow key={ind.id}>
                      <TableCell className="font-medium text-xs">{ind.codigo}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate" title={ind.nombre}>
                        {ind.nombre}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs">
                        {reg ? `${Number(reg.valorCalculado).toFixed(2)}${ind.tipoDato === 'PORCENTAJE' ? '%' : ''}` : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{ind.valorReferencial}</TableCell>
                      <TableCell>
                        {!reg ? (
                          <Badge variant="outline" className="text-[10px]">Sin calcular</Badge>
                        ) : reg.cumpleReferencial ? (
                          <Badge className="bg-green-600 text-[10px]">Cumple</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">No cumple</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {acreditacion.resultado && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{acreditacion.resultado}</p>
          </CardContent>
        </Card>
      )}

      {acreditacion.observaciones && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">{acreditacion.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
