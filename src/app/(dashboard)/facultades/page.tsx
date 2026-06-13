import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { crearFacultad, actualizarFacultad, eliminarFacultad } from '@/actions/catalogo.actions'

export const metadata = { title: 'Gestión de Facultades | SINEACE UNT' }

export default async function FacultadesPage() {
  const facultades = await prisma.facultad.findMany({
    include: {
      _count: { select: { carreras: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Facultades</h1>
        <p className="text-muted-foreground mt-1">Facultades y sus programas de estudio asociados.</p>
      </div>

      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Registrar Nueva Facultad</CardTitle>
          <CardDescription className="text-xs">Complete los datos para agregar una facultad.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="flex flex-wrap items-end gap-3" action={async (formData) => {
            'use server'
            await crearFacultad({
              nombre: formData.get('nombre') as string,
              codigo: formData.get('codigo') as string,
            })
          }}>
            <div className="space-y-1">
              <Label htmlFor="nombre" className="text-xs">Nombre</Label>
              <Input id="nombre" name="nombre" className="h-8 w-[280px]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="codigo" className="text-xs">Código</Label>
              <Input id="codigo" name="codigo" className="h-8 w-[100px]" required />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-8">Crear Facultad</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Facultades Registradas ({facultades.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3 text-center">Carreras</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {facultades.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{f.nombre}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{f.codigo}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{f._count.carreras}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={f.activo ? 'default' : 'secondary'} className={f.activo ? 'bg-green-600' : ''}>
                        {f.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <form action={async () => {
                          'use server'
                          await actualizarFacultad(f.id, { activo: !f.activo })
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs">
                            {f.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </form>
                        <form action={async () => {
                          'use server'
                          await eliminarFacultad(f.id)
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700">
                            Eliminar
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {facultades.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No hay facultades registradas.</td>
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
