import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crearCarrera, actualizarCarrera, eliminarCarrera } from '@/actions/catalogo.actions'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Gestión de Carreras | SINEACE UNT' }

export default async function CarrerasPage() {
  const carreras = await prisma.carrera.findMany({
    include: { facultad: true, coordinador: { select: { nombre: true, apellido: true } } },
    orderBy: { nombre: 'asc' },
  })
  const facultades = await prisma.facultad.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Carreras</h1>
        <p className="text-muted-foreground mt-1">Programas de estudio registrados en el sistema.</p>
      </div>

      {/* Formulario nueva carrera */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Registrar Nueva Carrera</CardTitle>
          <CardDescription className="text-xs">Complete los datos para agregar un programa de estudio.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="flex flex-wrap items-end gap-3" action={async (formData) => {
            'use server'
            await crearCarrera({
              nombre: formData.get('nombre') as string,
              codigo: formData.get('codigo') as string,
              facultadId: formData.get('facultadId') as string,
            })
          }}>
            <div className="space-y-1">
              <Label htmlFor="nombre" className="text-xs">Nombre</Label>
              <Input id="nombre" name="nombre" className="h-8 w-[240px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="codigo" className="text-xs">Código</Label>
              <Input id="codigo" name="codigo" className="h-8 w-[100px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facultadId" className="text-xs">Facultad</Label>
              <Select name="facultadId" required>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {facultades.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-8">Crear Carrera</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de carreras */}
      <Card>
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Carreras Registradas ({carreras.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Facultad</th>
                  <th className="px-4 py-3">Coordinador</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {carreras.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{c.codigo}</td>
                    <td className="px-4 py-3 text-slate-600">{c.facultad.nombre}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {c.coordinador ? `${c.coordinador.nombre} ${c.coordinador.apellido}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.activo ? 'default' : 'secondary'} className={c.activo ? 'bg-green-600' : ''}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <form action={async () => {
                          'use server'
                          await actualizarCarrera(c.id, { activo: !c.activo })
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs">
                            {c.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </form>
                        <form action={async () => {
                          'use server'
                          await eliminarCarrera(c.id)
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700">
                            Eliminar
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {carreras.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay carreras registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
