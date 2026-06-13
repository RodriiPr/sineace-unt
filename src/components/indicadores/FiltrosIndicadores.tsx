'use client'

type Carrera = { id: string; nombre: string }
type Periodo = { periodo: string }

export function FiltrosIndicadores({
  carreras,
  periodos,
  carreraId,
  periodoActivo,
  estado,
  totalCalculados,
  totalCumplen,
}: {
  carreras: Carrera[]
  periodos: Periodo[]
  carreraId?: string
  periodoActivo: string
  estado?: string
  totalCalculados: number
  totalCumplen: number
}) {
  function navigateWithParams(updates: Record<string, string | null>) {
    const url = new URL(window.location.href)
    for (const [key, value] of Object.entries(updates)) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    window.location.href = url.toString()
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="filter-carrera" className="text-xs font-medium text-slate-600">Carrera</label>
        <select
          id="filter-carrera"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm min-w-[180px]"
          onChange={(e) => {
            const params: Record<string, string | null> = { carreraId: e.target.value || null, estado: null }
            if (e.target.value) params.periodo = periodoActivo
            navigateWithParams(params)
          }}
          value={carreraId || ''}
        >
          <option value="">Seleccionar carrera...</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-periodo" className="text-xs font-medium text-slate-600">Periodo</label>
        <select
          id="filter-periodo"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm min-w-[120px]"
          onChange={(e) => navigateWithParams({
            carreraId: carreraId || null,
            periodo: e.target.value,
          })}
          value={periodoActivo}
          disabled={!carreraId}
        >
          {periodos.map((p) => (
            <option key={p.periodo} value={p.periodo}>{p.periodo}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-estado" className="text-xs font-medium text-slate-600">Estado</label>
        <select
          id="filter-estado"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm min-w-[140px]"
          onChange={(e) => navigateWithParams({
            carreraId: carreraId || null,
            periodo: periodoActivo || null,
            estado: e.target.value && e.target.value !== 'todos' ? e.target.value : null,
          })}
          value={estado || 'todos'}
          disabled={!carreraId}
        >
          <option value="todos">Todos</option>
          <option value="cumple">Cumplen</option>
          <option value="no-cumple">No cumplen</option>
          <option value="sin-calcular">Sin calcular</option>
        </select>
      </div>

      {carreraId && (
        <div className="flex items-center gap-2 ml-auto text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border">
          <span className="text-green-600 font-semibold">{totalCumplen} cumplen</span>
          <span className="text-slate-300">|</span>
          <span>{totalCalculados} calculados</span>
        </div>
      )}
    </div>
  )
}
