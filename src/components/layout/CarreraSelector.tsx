'use client'

import { useFormStatus } from 'react-dom'
import { setCarreraActiva } from '@/actions/carrera.actions'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

type Carrera = { id: string; nombre: string }

export function CarreraSelector({
  carreras,
  activaId,
}: {
  carreras: Carrera[]
  activaId: string | undefined
}) {
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    await setCarreraActiva(val)
    router.refresh()
  }

  return (
    <form action={() => {}} className="relative">
      <div className="relative">
        <select
          name="carreraId"
          defaultValue={activaId || ''}
          onChange={handleChange}
          className="h-9 appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[200px]"
        >
          <option value="">Todas las carreras</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </form>
  )
}
