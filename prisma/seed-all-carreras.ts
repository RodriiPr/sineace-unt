// prisma/seed-all-carreras.ts
// =============================================================
// Seed: Genera variables y registros de indicadores para TODAS
// las carreras activas en los periodos 2025-I, 2025-II, 2026-I
// =============================================================
import 'dotenv/config'
import { PrismaClient, Rol } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { evaluarCumplimiento } from '../src/lib/utils'
import { calcularFormulaSINEACE } from '../src/lib/math-parser'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool, { schema: 'public' })
const prisma = new PrismaClient({ adapter } as any)

// ── Datos base de variables (copiados del seed principal) ──
type VariableEntry = { nombre: string; valor: number; fuente: string }

const INDICADOR_VARIABLES_MAP: Record<string, { calculado: number; variables: VariableEntry[] }> = {
  ID1: { calculado: 72.5, variables: [
    { nombre: 'estudiantes_satisfechos', valor: 145, fuente: 'Encuesta semestral satisfacción estudiantil' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas' },
  ]},
  ID2: { calculado: 56, variables: [
    { nombre: 'estudiantes_satisfechos_docentes', valor: 112, fuente: 'Encuesta evaluación docente' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas' },
  ]},
  ID3: { calculado: 65, variables: [
    { nombre: 'estudiantes_satisfechos_recursos', valor: 130, fuente: 'Encuesta semestral satisfacción' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas' },
  ]},
  ID4: { calculado: 67.5, variables: [
    { nombre: 'estudiantes_satisfechos_evaluacion', valor: 135, fuente: 'Encuesta semestral — evaluación' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas' },
  ]},
  ID5: { calculado: 60, variables: [
    { nombre: 'estudiantes_satisfechos_tutoria', valor: 120, fuente: 'Encuesta últimos ciclos' },
    { nombre: 'total_encuestados_titulacion', valor: 200, fuente: 'Registro encuestas titulación' },
  ]},
  ID6: { calculado: 70, variables: [
    { nombre: 'estudiantes_satisfechos_curriculo', valor: 140, fuente: 'Encuesta semestral — currículo' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas' },
  ]},
  ID7: { calculado: 55, variables: [
    { nombre: 'estudiantes_satisfechos_bienestar', valor: 110, fuente: 'Encuesta semestral — bienestar' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas' },
  ]},
  ID8: { calculado: 75, variables: [
    { nombre: 'estudiantes_satisfechos_admin', valor: 150, fuente: 'Encuesta semestral — servicios admin.' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas' },
  ]},
  ID9: { calculado: 62.5, variables: [
    { nombre: 'estudiantes_satisfechos_prog_bienestar', valor: 125, fuente: 'Encuesta semestral — prog. bienestar' },
    { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas' },
  ]},
  ID10: { calculado: 85, variables: [
    { nombre: 'estudiantes_aprobados', valor: 340, fuente: 'Actas de notas finales' },
    { nombre: 'total_matriculados_asignatura', valor: 400, fuente: 'Nómina de matriculados' },
  ]},
  ID11: { calculado: 88, variables: [
    { nombre: 'silabos_cumplidos_al_100', valor: 22, fuente: 'Informe coordinadores de área' },
    { nombre: 'total_silabos_programados', valor: 25, fuente: 'Registro de sílabos programados' },
  ]},
  ID12: { calculado: 70, variables: [
    { nombre: 'docentes_satisfechos_curriculo', valor: 28, fuente: 'Encuesta anual docentes — currículo' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID13: { calculado: 55, variables: [
    { nombre: 'docentes_satisfechos_clima', valor: 22, fuente: 'Encuesta anual docentes — clima' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID14: { calculado: 65, variables: [
    { nombre: 'docentes_satisfechos_evaluacion_promo', valor: 26, fuente: 'Encuesta anual docentes — eval./prom.' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID15: { calculado: 50, variables: [
    { nombre: 'docentes_satisfechos_investigacion', valor: 20, fuente: 'Encuesta anual docentes — investigación' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID16: { calculado: 75, variables: [
    { nombre: 'docentes_satisfechos_recursos', valor: 30, fuente: 'Encuesta anual docentes — recursos' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID17: { calculado: 62.5, variables: [
    { nombre: 'docentes_satisfechos_gestion', valor: 25, fuente: 'Encuesta anual docentes — gestión' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID18: { calculado: 67.5, variables: [
    { nombre: 'docentes_satisfechos_capacitacion', valor: 27, fuente: 'Encuesta anual docentes — capacitación' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID19: { calculado: 55, variables: [
    { nombre: 'docentes_satisfechos_participacion', valor: 22, fuente: 'Encuesta anual docentes — participación' },
    { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes' },
  ]},
  ID20: { calculado: 68.6, variables: [
    { nombre: 'egresados_satisfechos_formacion', valor: 48, fuente: 'Encuesta seguimiento egresados' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID21: { calculado: 64.3, variables: [
    { nombre: 'egresados_satisfechos_docentes', valor: 45, fuente: 'Encuesta seguimiento egresados — docentes' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID22: { calculado: 60, variables: [
    { nombre: 'egresados_satisfechos_curriculo', valor: 42, fuente: 'Encuesta seguimiento egresados — currículo' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID23: { calculado: 57.1, variables: [
    { nombre: 'egresados_satisfechos_ensenanza', valor: 40, fuente: 'Encuesta seguimiento egresados — enseñanza' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID24: { calculado: 65.7, variables: [
    { nombre: 'egresados_satisfechos_impacto', valor: 46, fuente: 'Encuesta seguimiento egresados — impacto' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID25: { calculado: 1.5, variables: [
    { nombre: 'suma_meses_egreso_titulacion', valor: 504, fuente: 'Sistema registros académicos — titulados' },
    { nombre: 'cantidad_titulados_periodo', valor: 28, fuente: 'Registro de titulados' },
  ]},
  ID26: { calculado: 1.42, variables: [
    { nombre: 'suma_meses_egreso_primer_empleo', valor: 408, fuente: 'Encuesta egresados — inserción laboral' },
    { nombre: 'cantidad_egresados_empleados', valor: 24, fuente: 'Registro encuestados empleados' },
  ]},
  ID27: { calculado: 54.3, variables: [
    { nombre: 'egresados_empleados_campo_profesional', valor: 38, fuente: 'Encuesta egresados — situación laboral' },
    { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados' },
  ]},
  ID28: { calculado: 62, variables: [
    { nombre: 'graduados_cohorte', valor: 62, fuente: 'Sistema académico — cohorte histórica' },
    { nombre: 'matriculados_cohorte_ingreso', valor: 100, fuente: 'Nómina ingresantes cohorte' },
  ]},
  ID29: { calculado: 55, variables: [
    { nombre: 'titulados_periodo', valor: 22, fuente: 'Registro de titulados' },
    { nombre: 'graduados_periodo', valor: 40, fuente: 'Graduados últimos 3 años' },
  ]},
}

function randomVariation(base: number, factor: number): number {
  const variation = 0.85 + Math.random() * 0.3 // 0.85–1.15
  return Math.round(base * variation * factor * 100) / 100
}

function randomInt(base: number, minRatio: number, maxRatio: number): number {
  return Math.round(base * (minRatio + Math.random() * (maxRatio - minRatio)))
}

async function main() {
  console.log('🚀 Generando datos para todas las carreras...\n')

  const coordinador = await prisma.user.findFirst({ where: { rol: Rol.COORDINADOR_CALIDAD } })
  if (!coordinador) throw new Error('No se encontró usuario COORDINADOR_CALIDAD')

  const carreras = await prisma.carrera.findMany({ where: { activo: true } })
  console.log(`📚 ${carreras.length} carreras encontradas\n`)

  const indicadores = await prisma.indicadorSineace.findMany({
    where: { activo: true },
    select: { id: true, codigo: true, formulaCalculo: true, valorReferencial: true, tipoDato: true, variables: true },
  })

  const periodos = ['2025-I', '2025-II', '2026-I']
  let totalVars = 0
  let totalRegs = 0

  for (const carrera of carreras) {
    console.log(`\n═══════════════════════════════════════════`)
    console.log(`🏫 ${carrera.nombre} (${carrera.codigo})`)

    for (const periodo of periodos) {
      // Factor de progresión: mejora ligera con el tiempo
      const factor = periodo === '2025-I' ? 1.0 : periodo === '2025-II' ? 1.03 : 1.06

      for (const ind of indicadores) {
        const entry = INDICADOR_VARIABLES_MAP[ind.codigo]
        if (!entry) continue

        // Obtener TODAS las variables requeridas desde el schema del indicador
        const allRequiredVarNames = Object.keys((ind.variables as Record<string, string>) || {})
        const variablesValores: Record<string, number> = {}

        // 1. Crear variables conocidas (desde INDICADOR_VARIABLES_MAP)
        for (const v of entry.variables) {
          let valor: number
          if (v.nombre.includes('total') || v.nombre.startsWith('cantidad') || v.nombre.startsWith('suma')) {
            valor = randomInt(v.valor, 0.7, 1.3)
          } else {
            valor = randomVariation(v.valor, factor)
            const denomEntry = entry.variables.find((x) => x.nombre.startsWith('total') || x.nombre.startsWith('cantidad'))
            if (denomEntry) {
              const denomVal = randomInt(denomEntry.valor, 0.7, 1.3)
              if (valor > denomVal) valor = denomVal * (0.7 + Math.random() * 0.2)
            }
          }

          variablesValores[v.nombre] = valor

          await prisma.variableIndicador.upsert({
            where: {
              carreraId_indicadorId_periodo_nombreVariable: {
                carreraId: carrera.id,
                indicadorId: ind.id,
                periodo,
                nombreVariable: v.nombre,
              },
            },
            update: { valorNumerico: valor },
            create: {
              carreraId: carrera.id,
              indicadorId: ind.id,
              periodo,
              nombreVariable: v.nombre,
              valorNumerico: valor,
              fuenteDato: `${v.fuente} — ${carrera.nombre} ${periodo}`,
              verificadoPorId: coordinador.id,
            },
          })
          totalVars++
        }

        // 2. Crear variables ADICIONALES que están en el schema pero no en mi map
        const knownNames = new Set(entry.variables.map((v) => v.nombre))
        for (const varName of allRequiredVarNames) {
          if (knownNames.has(varName) || !varName.trim()) continue
          const valor = randomInt(50, 0.5, 1.0) // valor sintético razonable
          variablesValores[varName] = valor

          await prisma.variableIndicador.upsert({
            where: {
              carreraId_indicadorId_periodo_nombreVariable: {
                carreraId: carrera.id,
                indicadorId: ind.id,
                periodo,
                nombreVariable: varName,
              },
            },
            update: { valorNumerico: valor },
            create: {
              carreraId: carrera.id,
              indicadorId: ind.id,
              periodo,
              nombreVariable: varName,
              valorNumerico: valor,
              fuenteDato: `Registro generado automáticamente — ${carrera.nombre} ${periodo}`,
              verificadoPorId: coordinador.id,
            },
          })
          totalVars++
        }

        // Calcular el indicador usando la fórmula real
        try {
          const valorCalculado = calcularFormulaSINEACE(ind.formulaCalculo, variablesValores)
          const cumpleReferencial = evaluarCumplimiento(valorCalculado, ind.valorReferencial)

          await prisma.registroIndicador.upsert({
            where: {
              carreraId_indicadorId_periodo: {
                carreraId: carrera.id,
                indicadorId: ind.id,
                periodo,
              },
            },
            update: {
              valorCalculado,
              valorReferencial: ind.valorReferencial,
              cumpleReferencial,
              variablesUtilizadas: variablesValores,
              calculadoPorId: coordinador.id,
              fechaActualizacion: new Date(),
            },
            create: {
              carreraId: carrera.id,
              indicadorId: ind.id,
              periodo,
              valorCalculado,
              valorReferencial: ind.valorReferencial,
              cumpleReferencial,
              variablesUtilizadas: variablesValores,
              calculadoPorId: coordinador.id,
            },
          })
          totalRegs++
        } catch (e: any) {
          console.log(`   ⚠️  Error calculando ${ind.codigo} (${carrera.codigo} ${periodo}): ${e.message}`)
        }

        process.stdout.write(`\r   ${ind.codigo} — ${periodo}`)
      }
    }
    console.log(`\n   ✅ ${carrera.nombre}: ${periodos.length} periodos procesados`)
  }

  console.log(`\n═══════════════════════════════════════════`)
  console.log(`✅ COMPLETADO`)
  console.log(`   📝 ${totalVars} variables registradas/actualizadas`)
  console.log(`   📊 ${totalRegs} registros de indicadores calculados`)
  console.log(`   🏫 ${carreras.length} carreras × ${periodos.length} periodos × ${indicadores.length} indicadores`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
