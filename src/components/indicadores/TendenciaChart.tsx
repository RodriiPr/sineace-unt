'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'

type Registro = {
  periodo: string
  valorCalculado: number
  cumpleReferencial: boolean
  carrera: { id: string; nombre: string; codigo?: string }
}

export function TendenciaChart({
  registros,
  valorReferencial,
  tipoDato,
}: {
  registros: Registro[]
  valorReferencial: string
  tipoDato: string
}) {
  const ref = parseFloat(valorReferencial)

  const carrerasUnicas = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of registros) {
      if (!map.has(r.carrera.id)) map.set(r.carrera.id, r.carrera.nombre)
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [registros])

  const [selectedCarrera, setSelectedCarrera] = useState<string>('')

  const chartData = useMemo(() => {
    const periodSet = new Set<string>()
    for (const r of registros) periodSet.add(r.periodo)
    const periodos = Array.from(periodSet).sort()

    const filtered = selectedCarrera
      ? registros.filter((r) => r.carrera.id === selectedCarrera)
      : registros

    return periodos.map((per) => {
      const point: Record<string, string | number> = { periodo: per }
      const entries = filtered.filter((r) => r.periodo === per)
      for (const r of entries) {
        point[r.carrera.nombre] = Number(r.valorCalculado)
      }
      return point
    })
  }, [registros, selectedCarrera])

  const carrerasConDatos = useMemo(() => {
    if (selectedCarrera) return [selectedCarrera]
    return carrerasUnicas.map((c) => c.id)
  }, [carrerasUnicas, selectedCarrera])

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#65a30d']

  if (registros.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed">
        No hay datos históricos para mostrar.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {carrerasUnicas.length > 1 && (
        <div className="flex items-center gap-2">
          <label htmlFor="chart-carrera" className="text-xs font-medium text-slate-600">Carrera:</label>
          <select
            id="chart-carrera"
            className="h-7 rounded border border-input bg-transparent px-2 text-xs"
            value={selectedCarrera}
            onChange={(e) => setSelectedCarrera(e.target.value)}
          >
            <option value="">Todas</option>
            {carrerasUnicas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="periodo"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              domain={[0, 'auto']}
              tickFormatter={(v: number) => tipoDato === 'PORCENTAJE' ? `${v}%` : `${v}`}
            />
            <Tooltip
              formatter={((v: any) => tipoDato === 'PORCENTAJE' ? `${(v as number).toFixed(1)}%` : (v as number).toFixed(2)) as any}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={ref}
              stroke="#dc2626"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: `Ref: ${tipoDato === 'PORCENTAJE' ? `${ref}%` : ref}`,
                position: 'right',
                fill: '#dc2626',
                fontSize: 11,
              }}
            />
            {carrerasConDatos.map((carreraId, idx) => {
              const carrera = carrerasUnicas.find((c) => c.id === carreraId)
              return (
                <Line
                  key={carreraId}
                  type="monotone"
                  dataKey={carrera?.nombre || carreraId}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 text-center">
        Línea roja punteada = valor referencial ({tipoDato === 'PORCENTAJE' ? `${ref}%` : ref})
      </p>
    </div>
  )
}
