import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { registrarVariable } from '@/actions/indicador.actions'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Registro de Variables | SINEACE UNT',
}

export default async function VariablesPage() {
  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
  const indicadores = await prisma.indicadorSineace.findMany({ where: { activo: true }, orderBy: { codigo: 'asc' } })

  const variablesRecientes = await prisma.variableIndicador.findMany({
    take: 50,
    orderBy: { fechaRegistro: 'desc' },
    include: {
      carrera: { select: { nombre: true } },
      indicador: { select: { codigo: true, nombre: true } },
      verificadoPor: { select: { nombre: true, apellido: true } },
    },
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/indicadores-sineace" className={buttonVariants({ variant: "outline", size: "sm" })}>
          &larr; Volver al catálogo
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Variables</h1>
        <p className="text-muted-foreground mt-1">
          Ingrese los valores de las variables requeridas para el cálculo de indicadores.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Nueva Variable</CardTitle>
          <CardDescription>
            Asegúrese de contar con la evidencia y fuente de información correspondiente antes de registrar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-6" action={async (formData) => {
            'use server'
            const data = {
              carreraId: formData.get('carreraId'),
              indicadorId: formData.get('indicadorId'),
              periodo: formData.get('periodo'),
              nombreVariable: formData.get('nombreVariable'),
              valorNumerico: Number(formData.get('valorNumerico')),
              fuenteDato: formData.get('fuenteDato'),
            }
            await registrarVariable(data)
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carreraId">Carrera / Programa</Label>
                <Select name="carreraId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {carreras.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="periodo">Periodo Académico</Label>
                <Input id="periodo" name="periodo" placeholder="Ej: 2025-I" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="indicadorId">Indicador Asociado</Label>
                <Select name="indicadorId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un indicador" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicadores.map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.codigo} - {i.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreVariable">Nombre de la Variable</Label>
                <Input id="nombreVariable" name="nombreVariable" placeholder="Ej: estudiantes_satisfechos" required />
                <p className="text-xs text-muted-foreground">Debe coincidir exactamente con la fórmula</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorNumerico">Valor (Numérico)</Label>
                <Input id="valorNumerico" name="valorNumerico" type="number" step="0.01" min="0" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fuenteDato">Fuente de Información / Evidencia</Label>
                <Input id="fuenteDato" name="fuenteDato" placeholder="Ej: Reporte de Sistema Académico, Acta N° 123" required />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Guardar Registro
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de variables registradas */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Variables Registradas</CardTitle>
          <CardDescription>Últimas 50 variables ingresadas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {variablesRecientes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No hay variables registradas aún. Use el formulario superior para ingresar la primera.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Variable</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variablesRecientes.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-medium text-xs">{v.indicador.codigo}</span>
                    </TableCell>
                    <TableCell className="text-xs">{v.carrera.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{v.periodo}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate" title={v.nombreVariable}>
                      {v.nombreVariable}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs">{Number(v.valorNumerico).toFixed(2)}</TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={v.fuenteDato}>
                      {v.fuenteDato}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {v.verificadoPor.nombre} {v.verificadoPor.apellido}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(v.fechaRegistro)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
