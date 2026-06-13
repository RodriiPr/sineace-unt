import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { formatDate } from '@/lib/utils'
import { registrarAcreditacion } from '@/actions/acreditacion.actions'

export const metadata = {
  title: 'Gestión de Acreditaciones | SINEACE UNT',
}

export default async function AcreditacionesPage() {
  const cookieStore = await cookies()
  const carreraActivaId = cookieStore.get('carreraId')?.value

  const where = carreraActivaId ? { carreraId: carreraActivaId } : {}

  const acreditaciones = await prisma.acreditacion.findMany({
    where,
    include: {
      carrera: {
        include: { facultad: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const carreras = await prisma.carrera.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procesos de Acreditación</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y seguimiento de los procesos de acreditación de los programas de estudio.
            {carreraActivaId && <span className="ml-1 text-sm">(filtrado por carrera seleccionada)</span>}
          </p>
        </div>
      </div>

      {/* Formulario Nuevo Proceso */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Registrar Nuevo Proceso de Acreditación</CardTitle>
          <CardDescription className="text-xs">Complete los datos para iniciar un proceso.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="flex flex-wrap items-end gap-4" action={async (formData) => {
            'use server'
            await registrarAcreditacion({
              carreraId: formData.get('carreraId'),
              entidadAcreditadora: formData.get('entidadAcreditadora'),
              modelo: formData.get('modelo'),
              fechaInicio: formData.get('fechaInicio'),
              fechaFinEstimada: formData.get('fechaFinEstimada') || undefined,
            })
          }}>
            <div className="space-y-1">
              <Label htmlFor="carreraId" className="text-xs">Carrera</Label>
              <Select name="carreraId" defaultValue={carreraActivaId || undefined} required>
                <SelectTrigger className="h-8 w-[200px]">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {carreras.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="entidadAcreditadora" className="text-xs">Entidad</Label>
              <Input id="entidadAcreditadora" name="entidadAcreditadora" defaultValue="SINEACE" className="h-8 w-[130px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="modelo" className="text-xs">Modelo</Label>
              <Input id="modelo" name="modelo" defaultValue="Modelo CONEAU 2025" className="h-8 w-[160px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fechaInicio" className="text-xs">Inicio</Label>
              <Input id="fechaInicio" name="fechaInicio" type="date" className="h-8 w-[140px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fechaFinEstimada" className="text-xs">Fin estimado</Label>
              <Input id="fechaFinEstimada" name="fechaFinEstimada" type="date" className="h-8 w-[140px]" />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-8">
              Nuevo Proceso
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de procesos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {acreditaciones.map((acred) => (
          <Card key={acred.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={acred.estado === 'ACREDITADA' ? 'default' : 'secondary'} className={acred.estado === 'ACREDITADA' ? 'bg-green-600' : ''}>
                  {acred.estado.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {acred.modelo}
                </span>
              </div>
              <CardTitle className="text-xl">{acred.carrera.nombre}</CardTitle>
              <CardDescription>{acred.carrera.facultad.nombre}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Entidad:</span>
                  <span className="font-medium text-right">{acred.entidadAcreditadora}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium text-right">{formatDate(acred.fechaInicio)}</span>
                </div>
                {acred.fechaFinEstimada && (
                  <div className="grid grid-cols-2 text-sm">
                    <span className="text-muted-foreground">Fin Estimado:</span>
                    <span className="font-medium text-right">{formatDate(acred.fechaFinEstimada)}</span>
                  </div>
                )}
              </div>
              
              <Link href={`/acreditaciones/${acred.id}`} className={buttonVariants({ variant: "outline", className: "w-full mt-auto" })}>
                Ver Expediente
              </Link>
            </CardContent>
          </Card>
        ))}

        {acreditaciones.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-50 rounded-lg border border-dashed">
            <p className="text-slate-500 mb-4">No hay procesos de acreditación registrados en el sistema.</p>
          </div>
        )}
      </div>
    </div>
  )
}
