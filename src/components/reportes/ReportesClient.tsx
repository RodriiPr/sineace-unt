'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { generarReporteIndicadores } from '@/actions/reporte.actions'
import { FileText, FileSpreadsheet, Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react'

interface CarreraOption {
  id: string
  nombre: string
  codigo: string
  facultad: { nombre: string }
}

interface PeriodoOption {
  periodo: string
}

interface ReportesClientProps {
  carreras: CarreraOption[]
  periodos: PeriodoOption[]
  carreraActivaId?: string
}

function downloadBase64File(base64: string, filename: string, mimeType: string) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function ReportesClient({ carreras, periodos, carreraActivaId }: ReportesClientProps) {
  const [carreraId, setCarreraId] = useState(carreraActivaId || '')
  const [periodo, setPeriodo] = useState('')
  const [tipoReporte, setTipoReporte] = useState('sineace')
  const [formato, setFormato] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!carreraId || !periodo) {
      setError('Seleccione una carrera y un periodo')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await generarReporteIndicadores({
      carreraId,
      periodo,
      tipoReporte,
      formato,
    })

    if (!result.success) {
      setError(result.error || 'Error al generar el reporte')
      setLoading(false)
      return
    }

    const { base64, filename, mimeType } = result.data!
    downloadBase64File(base64, filename, mimeType)
    setSuccess(`Reporte generado: ${filename}`)
    setLoading(false)
  }

  const tipoReportes = [
    {
      value: 'operacional',
      label: 'Operacionales',
      desc: 'Reportes operativos del proceso de acreditación (existente)',
      icon: FileText,
    },
    {
      value: 'gestion',
      label: 'Gestión',
      desc: 'Reportes de gestión académico-administrativa (existente)',
      icon: FileText,
    },
    {
      value: 'sineace',
      label: 'Oficial SINEACE',
      desc: 'Reporte oficial con membrete UNT, indicadores, cumplimiento y plan de mejoras — Modelo CONEAU 2025',
      icon: FileText,
    },
  ]

  const formatos = [
    { value: 'pdf', label: 'PDF — Formato Oficial', desc: 'Documento con membrete institucional UNT' },
    { value: 'xlsx', label: 'Excel — Datos para análisis', desc: 'Datos crudos con hojas de resumen, detalle y mejoras' },
  ]

  const selectedTipo = tipoReportes.find((t) => t.value === tipoReporte)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Módulo de Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Generación de reportes oficiales, operacionales y de gestión del sistema de acreditación.
        </p>
      </div>

      {/* Tarjetas de tipo de reporte */}
      <div className="grid gap-4 md:grid-cols-3">
        {tipoReportes.map((tipo) => {
          const Icon = tipo.icon
          const isSelected = tipoReporte === tipo.value
          return (
            <button
              key={tipo.value}
              type="button"
              onClick={() => setTipoReporte(tipo.value)}
              className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`font-semibold text-sm ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                  {tipo.label}
                </span>
                {tipo.value === 'sineace' && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium ml-auto">
                    NUEVO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{tipo.desc}</p>
            </button>
          )
        })}
      </div>

      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            {selectedTipo?.label || 'Reporte'} — Configuración y Descarga
          </CardTitle>
          <CardDescription>
            Seleccione los filtros y el formato para generar el reporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carreraId">Carrera / Programa</Label>
                <Select value={carreraId} onValueChange={(v) => { if (v) setCarreraId(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {carreras.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre} ({c.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Periodo Académico</Label>
                <Select value={periodo} onValueChange={(v) => { if (v) setPeriodo(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.map((p) => (
                      <SelectItem key={p.periodo} value={p.periodo}>
                        {p.periodo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formato">Formato de Exportación</Label>
                <Select value={formato} onValueChange={(v) => { if (v) setFormato(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatos.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  {formatos.find((f) => f.value === formato)?.desc}
                </p>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Label className="invisible">Generar</Label>
                <Button
                  type="submit"
                  disabled={loading || !carreraId || !periodo}
                  className="bg-blue-600 hover:bg-blue-700 h-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Vista previa de la estructura del reporte SINEACE */}
      {tipoReporte === 'sineace' && (
        <Card>
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm">Estructura del Reporte Oficial SINEACE</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { num: '1', title: 'Portada UNT', desc: 'Membrete institucional, carrera, facultad, periodo' },
                { num: '2', title: 'Índice', desc: 'Tabla de contenidos del documento' },
                { num: '3', title: 'Resultados por Estándar', desc: 'Los 29 indicadores agrupados por los 10 estándares CONEAU 2025' },
                { num: '4', title: 'Análisis Global', desc: 'Cumplimiento vs. no cumplimiento con resumen estadístico' },
                { num: '5', title: 'Plan de Mejoras', desc: 'Acciones correctivas para indicadores deficientes' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
                    {item.num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
