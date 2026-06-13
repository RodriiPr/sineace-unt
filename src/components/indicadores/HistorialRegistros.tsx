'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { eliminarRegistroIndicador } from '@/actions/indicador.actions'

type Registro = {
  id: string
  periodo: string
  valorCalculado: number
  cumpleReferencial: boolean
  carrera: { id: string; nombre: string; codigo: string }
  calculadoPor?: { nombre: string; apellido: string } | null
}

export function HistorialRegistros({ registros }: { registros: Registro[] }) {
  const router = useRouter()

  if (registros.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed">
        No hay registros de cálculo para este indicador aún.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            <th className="pb-2 pr-2">Periodo</th>
            <th className="pb-2 pr-2">Carrera</th>
            <th className="pb-2 pr-2 text-right">Valor</th>
            <th className="pb-2 pr-2">Estado</th>
            <th className="pb-2 pr-2 hidden sm:table-cell">Calculado por</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {registros.map((reg) => (
            <tr key={reg.id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-2.5 pr-2 font-medium">{reg.periodo}</td>
              <td className="py-2.5 pr-2 text-slate-600">{reg.carrera.codigo}</td>
              <td className={`py-2.5 pr-2 text-right font-bold ${reg.cumpleReferencial ? 'text-green-600' : 'text-red-600'}`}>
                {reg.valorCalculado.toFixed(2)}
              </td>
              <td className="py-2.5 pr-2">
                <Badge variant={reg.cumpleReferencial ? 'default' : 'destructive'} className="text-[10px]">
                  {reg.cumpleReferencial ? 'Cumple' : 'No cumple'}
                </Badge>
              </td>
              <td className="py-2.5 pr-2 text-slate-500 text-xs hidden sm:table-cell">
                {reg.calculadoPor ? `${reg.calculadoPor.nombre} ${reg.calculadoPor.apellido}` : '—'}
              </td>
              <td className="py-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('¿Eliminar este registro de cálculo?')) return
                    await eliminarRegistroIndicador(reg.id)
                    router.refresh()
                  }}
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 transition-colors"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
