'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { calcularIndicador } from '@/actions/indicador.actions'

export function CalcularTodosButton({
  carreraId,
  periodo,
  indicadorIds,
}: {
  carreraId: string
  periodo: string
  indicadorIds: string[]
}) {
  const [calculando, setCalculando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string; errors?: string[] } | null>(null)
  const router = useRouter()

  async function handleClick() {
    setCalculando(true)
    setProgreso(0)
    setResultado(null)

    let ok = 0
    let fail = 0
    const errors: string[] = []

    for (let i = 0; i < indicadorIds.length; i++) {
      const res = await calcularIndicador({ indicadorId: indicadorIds[i], carreraId, periodo })
      if (res.success) ok++
      else {
        fail++
        errors.push(res.error || 'Error desconocido')
      }
      setProgreso(Math.round(((i + 1) / indicadorIds.length) * 100))
    }

    setCalculando(false)
    router.refresh()

    if (fail === 0) {
      setResultado({ ok: true, msg: `Calculados ${ok}/${indicadorIds.length} indicadores correctamente` })
    } else {
      const primerError = errors[0]?.length > 80 ? errors[0].slice(0, 80) + '...' : (errors[0] || '')
      setResultado({
        ok: false,
        msg: `Calculados ${ok}/${indicadorIds.length} — ${fail} fallaron. Ej: ${primerError}`,
        errors,
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        disabled={calculando || !carreraId}
        className="bg-blue-600 hover:bg-blue-700 h-8"
        onClick={handleClick}
      >
        {calculando ? `Calculando ${progreso}%...` : 'Calcular Todos'}
      </Button>

      {calculando && (
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      )}

      {resultado && (
        <div className={`text-xs px-2 py-1 rounded ${resultado.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {resultado.msg}
        </div>
      )}

      {resultado && !resultado.ok && resultado.errors && (
        <details className="text-[10px] text-red-600 bg-red-50/50 rounded px-2 py-1">
          <summary className="cursor-pointer font-medium">Ver errores ({resultado.errors.length})</summary>
          <ul className="mt-1 list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
            {resultado.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
