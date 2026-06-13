import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Rol } from '@prisma/client'
import { cambiarRolUsuario, toggleActivoUsuario } from '@/actions/admin.actions'

export const metadata = { title: 'Gestión de Usuarios | SINEACE UNT' }

const rolColors: Record<string, string> = {
  SUPERADMIN: 'bg-red-600',
  VICERRECTOR: 'bg-blue-600',
  DECANO: 'bg-emerald-600',
  COORDINADOR_CALIDAD: 'bg-amber-600',
  EVALUADOR_EXTERNO: 'bg-purple-600',
}

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user || session.user.rol !== Rol.SUPERADMIN) redirect('/dashboard')

  const usuarios = await prisma.user.findMany({
    select: { id: true, nombre: true, apellido: true, email: true, rol: true, activo: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">Administración de cuentas y roles del sistema.</p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm">Usuarios Registrados ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const otrosRoles = Object.values(Rol).filter((r) => r !== u.rol)
                  return (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">{u.nombre} {u.apellido}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${rolColors[u.rol] || ''} text-[10px]`}>{u.rol}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.activo ? 'default' : 'secondary'} className={u.activo ? 'bg-green-600' : ''}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <form action={async (formData) => {
                            'use server'
                            const nuevoRol = formData.get('rol') as Rol
                            if (nuevoRol) await cambiarRolUsuario(u.id, nuevoRol)
                          }}>
                            <select name="rol" defaultValue="" className="h-7 rounded border border-input bg-transparent px-1 text-xs mr-1">
                              <option value="" disabled>Cambiar rol...</option>
                              {otrosRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">Ok</Button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await toggleActivoUsuario(u.id, !u.activo)
                          }}>
                            <Button type="submit" variant="ghost" size="sm" className="h-6 text-xs text-slate-500">
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
