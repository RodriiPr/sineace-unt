import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Auditoría del Sistema | SINEACE UNT' }

const badgeVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  CREATE: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ tabla?: string; accion?: string }>
}) {
  const { tabla, accion } = await searchParams

  const where: any = {}
  if (tabla) where.tabla = tabla
  if (accion) where.accion = accion

  const tablas = await prisma.auditoria.findMany({
    distinct: ['tabla'],
    select: { tabla: true },
    orderBy: { tabla: 'asc' },
  })

  const registros = await prisma.auditoria.findMany({
    where,
    include: { usuario: { select: { nombre: true, apellido: true, email: true } } },
    orderBy: { fecha: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visor de Auditoría</h1>
        <p className="text-muted-foreground mt-1">Historial de cambios y operaciones realizadas en el sistema.</p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <form className="flex flex-wrap items-end gap-3" method="GET">
            <div className="space-y-1">
              <label htmlFor="tabla" className="text-xs font-medium text-slate-600">Tabla</label>
              <select id="tabla" name="tabla" defaultValue={tabla || ''}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm min-w-[150px]"
              >
                <option value="">Todas</option>
                {tablas.map((t) => (
                  <option key={t.tabla} value={t.tabla}>{t.tabla}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="accion" className="text-xs font-medium text-slate-600">Acción</label>
              <select id="accion" name="accion" defaultValue={accion || ''}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm min-w-[120px]"
              >
                <option value="">Todas</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <Button type="submit" size="sm" className="h-8">Filtrar</Button>
            {(tabla || accion) && (
              <a href="/auditoria" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8" })}>
                Limpiar
              </a>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Registros ({registros.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Tabla</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">ID Registro</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDate(r.fecha)}</td>
                    <td className="px-4 py-3">
                      {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.tabla}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeVariant[r.accion] || 'secondary'} className="text-[10px]">
                        {r.accion}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.registroId.slice(0, 12)}...</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-500 max-w-[300px]">
                        {r.valorNuevo && (
                          <span className="truncate" title={r.valorNuevo}>
                            <span className="font-medium">Nuevo:</span> {r.valorNuevo.slice(0, 120)}
                          </span>
                        )}
                        {r.valorAnterior && (
                          <span className="truncate text-red-500" title={r.valorAnterior}>
                            <span className="font-medium">Anterior:</span> {r.valorAnterior.slice(0, 120)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {registros.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay registros de auditoría.</td>
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
