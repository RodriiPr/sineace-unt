// prisma/seed.ts
// =============================================================
// Seeder completo — Sistema SINEACE-UNT — Modelo CONEAU 2025
// Contiene: Usuarios, Facultades, Carreras, 10 EstandarSineace,
//           29 IndicadorSineace con fórmulas y variables completas
// =============================================================
import 'dotenv/config'
import { PrismaClient, Rol, TipoAlerta } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

// ------ Setup Prisma Client con adapter (Prisma 7) ------
const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool, { schema: 'public' })
const prisma = new PrismaClient({ adapter } as any)

// =============================================================
// BLOQUE A — USUARIOS DE PRUEBA
// =============================================================
async function seedUsuarios() {
  console.log('🔐 Creando usuarios de prueba...')

  const passwordHash = await bcrypt.hash('Sineace2025!', 12)

  const usuarios = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'superadmin@unt.edu.pe' },
      update: {},
      create: {
        email: 'superadmin@unt.edu.pe',
        password: passwordHash,
        nombre: 'Admin',
        apellido: 'Sistema',
        rol: Rol.SUPERADMIN,
        activo: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'vicerrector@unt.edu.pe' },
      update: {},
      create: {
        email: 'vicerrector@unt.edu.pe',
        password: passwordHash,
        nombre: 'Carlos',
        apellido: 'Mendoza Rivera',
        rol: Rol.VICERRECTOR,
        activo: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'decano.medicina@unt.edu.pe' },
      update: {},
      create: {
        email: 'decano.medicina@unt.edu.pe',
        password: passwordHash,
        nombre: 'María',
        apellido: 'Torres Vásquez',
        rol: Rol.DECANO,
        activo: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'coordinador.calidad@unt.edu.pe' },
      update: {},
      create: {
        email: 'coordinador.calidad@unt.edu.pe',
        password: passwordHash,
        nombre: 'Jorge',
        apellido: 'Castillo Pérez',
        rol: Rol.COORDINADOR_CALIDAD,
        activo: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'evaluador.externo@sineace.gob.pe' },
      update: {},
      create: {
        email: 'evaluador.externo@sineace.gob.pe',
        password: passwordHash,
        nombre: 'Ana',
        apellido: 'García Flores',
        rol: Rol.EVALUADOR_EXTERNO,
        activo: true,
      },
    }),
  ])

  console.log(`   ✅ ${usuarios.length} usuarios creados`)
  return usuarios
}

// =============================================================
// BLOQUE B — FACULTADES Y CARRERAS
// =============================================================
async function seedFacultadesYCarreras(decanoId: string, coordinadorId: string) {
  console.log('🏛️  Creando facultades y carreras...')

  const facultadMedicina = await prisma.facultad.upsert({
    where: { codigo: 'FAC-MED' },
    update: {},
    create: {
      nombre: 'Facultad de Medicina Humana',
      codigo: 'FAC-MED',
      decanoId,
      activo: true,
    },
  })

  const facultadIngenieria = await prisma.facultad.upsert({
    where: { codigo: 'FAC-ING' },
    update: {},
    create: {
      nombre: 'Facultad de Ingeniería',
      codigo: 'FAC-ING',
      activo: true,
    },
  })

  const facultadCiencias = await prisma.facultad.upsert({
    where: { codigo: 'FAC-CIE' },
    update: {},
    create: {
      nombre: 'Facultad de Ciencias',
      codigo: 'FAC-CIE',
      activo: true,
    },
  })

  const carreras = await Promise.all([
    prisma.carrera.upsert({
      where: { codigo: 'MED-001' },
      update: {},
      create: {
        nombre: 'Medicina Humana',
        codigo: 'MED-001',
        facultadId: facultadMedicina.id,
        coordinadorId,
        activo: true,
      },
    }),
    prisma.carrera.upsert({
      where: { codigo: 'ENF-001' },
      update: {},
      create: {
        nombre: 'Enfermería',
        codigo: 'ENF-001',
        facultadId: facultadMedicina.id,
        activo: true,
      },
    }),
    prisma.carrera.upsert({
      where: { codigo: 'ICS-001' },
      update: {},
      create: {
        nombre: 'Ingeniería de Sistemas',
        codigo: 'ICS-001',
        facultadId: facultadIngenieria.id,
        activo: true,
      },
    }),
    prisma.carrera.upsert({
      where: { codigo: 'ICO-001' },
      update: {},
      create: {
        nombre: 'Ingeniería Civil',
        codigo: 'ICO-001',
        facultadId: facultadIngenieria.id,
        activo: true,
      },
    }),
    prisma.carrera.upsert({
      where: { codigo: 'MAT-001' },
      update: {},
      create: {
        nombre: 'Matemáticas',
        codigo: 'MAT-001',
        facultadId: facultadCiencias.id,
        activo: true,
      },
    }),
  ])

  console.log(`   ✅ 3 facultades, ${carreras.length} carreras creadas`)
  return { facultades: [facultadMedicina, facultadIngenieria, facultadCiencias], carreras }
}

// =============================================================
// BLOQUE C — 10 ESTÁNDARES SINEACE (CONEAU 2025)
// =============================================================
async function seedEstandares() {
  console.log('📋 Creando 10 estándares CONEAU 2025...')

  const estandaresData = [
    {
      codigo: 'E1',
      nombre: 'Gestión Estratégica y Mejora Continua',
      descripcion:
        'Evalúa la planificación estratégica, los mecanismos de autoevaluación y la gestión institucional orientada a la mejora continua de la calidad educativa.',
    },
    {
      codigo: 'E2',
      nombre: 'Formación Integral',
      descripcion:
        'Evalúa el proceso de enseñanza-aprendizaje, el currículo, las metodologías didácticas, la evaluación del aprendizaje y el logro de competencias.',
    },
    {
      codigo: 'E3',
      nombre: 'Cuerpo Docente',
      descripcion:
        'Evalúa las características, competencias, desempeño, desarrollo profesional y satisfacción del cuerpo docente de la carrera.',
    },
    {
      codigo: 'E4',
      nombre: 'Investigación, Desarrollo Tecnológico e Innovación',
      descripcion:
        'Evalúa las políticas, actividades y resultados de investigación científica, desarrollo tecnológico e innovación vinculados a la carrera.',
    },
    {
      codigo: 'E5',
      nombre: 'Responsabilidad Social Universitaria',
      descripcion:
        'Evalúa el impacto social, ambiental y ético de las actividades académicas y de extensión de la carrera en su entorno.',
    },
    {
      codigo: 'E6',
      nombre: 'Servicios de Bienestar y Apoyo al Estudiante',
      descripcion:
        'Evalúa los servicios de bienestar, tutoría, orientación vocacional y apoyo integral que la institución brinda a los estudiantes.',
    },
    {
      codigo: 'E7',
      nombre: 'Infraestructura, Equipamiento y Recursos',
      descripcion:
        'Evalúa la disponibilidad, estado y suficiencia de la infraestructura física, laboratorios, bibliotecas, tecnología y demás recursos de apoyo al aprendizaje.',
    },
    {
      codigo: 'E8',
      nombre: 'Gestión Financiera y Recursos',
      descripcion:
        'Evalúa la sostenibilidad financiera, la asignación presupuestal y el uso eficiente de los recursos económicos para el funcionamiento de la carrera.',
    },
    {
      codigo: 'E9',
      nombre: 'Grupos de Interés y Vinculación con el Entorno',
      descripcion:
        'Evalúa la relación de la carrera con empleadores, colegios profesionales, comunidad académica y otros actores relevantes del entorno.',
    },
    {
      codigo: 'E10',
      nombre: 'Egresados y Empleabilidad',
      descripcion:
        'Evalúa el seguimiento a egresados, la inserción laboral, la satisfacción con la formación recibida y el impacto de la carrera en el mercado profesional.',
    },
  ]

  const estandares: Record<string, string> = {}
  for (const data of estandaresData) {
    const estandar = await prisma.estandarSineace.upsert({
      where: { codigo: data.codigo },
      update: {},
      create: { ...data, activo: true },
    })
    estandares[data.codigo] = estandar.id
  }

  console.log(`   ✅ 10 estándares CONEAU 2025 creados`)
  return estandares
}

// =============================================================
// BLOQUE D — 29 INDICADORES SINEACE 2025 (CATÁLOGO COMPLETO)
// =============================================================
async function seedIndicadores(estandares: Record<string, string>) {
  console.log('📊 Creando los 29 indicadores SINEACE 2025...')

  const indicadoresData = [
    // ─────────────────────────────────────────────────────────
    // SATISFACCIÓN DE ESTUDIANTES — ID1 a ID9 (SEMESTRAL)
    // ─────────────────────────────────────────────────────────
    {
      codigo: 'ID1',
      nombre: '% de estudiantes satisfechos con la gestión y desarrollo de actividades académicas y administrativas',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E1'],
      criterios: ['C1.1', 'C1.2', 'C1.3'],
      objetivo: 'Medir el nivel de satisfacción de los estudiantes respecto a la gestión académica y administrativa de la carrera, incluyendo procesos de matrícula, horarios, comunicación institucional y organización general.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que la mayoría de los estudiantes perciben positivamente la gestión de la carrera. Valores menores requieren acciones de mejora en procesos administrativos y académicos.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil aplicada al finalizar cada período académico',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos: 'Número de estudiantes que responden "satisfecho" o "muy satisfecho" en la encuesta de gestión académica y administrativa',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta en el período (mínimo 80% del total matriculado)',
      },
      notas: 'Se considera "satisfecho" a quienes marcan 4 o 5 en escala Likert de 5 puntos. La encuesta debe aplicarse en las últimas 3 semanas del semestre.',
    },
    {
      codigo: 'ID2',
      nombre: '% de estudiantes satisfechos con los docentes',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.1', 'C3.2'],
      objetivo: 'Medir el nivel de satisfacción de los estudiantes con el desempeño docente, incluyendo dominio del tema, metodología de enseñanza, puntualidad, disponibilidad y trato.',
      valorReferencial: '≥ 70%',
      interpretacion: 'Un valor ≥ 70% refleja una percepción positiva del desempeño docente. Valores menores requieren revisión de la calidad docente, capacitaciones y mecanismos de evaluación del desempeño.',
      fuenteInformacion: 'Encuesta semestral de evaluación docente por parte de estudiantes',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_docentes / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_docentes: 'Número de estudiantes que califican positivamente el desempeño de sus docentes (promedio ≥ 4 en escala 1-5)',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta de evaluación docente',
      },
      notas: 'Umbral superior al ID1 (70% vs 60%) por ser un factor crítico de la calidad formativa. Se evalúan todos los docentes de la carrera.',
    },
    {
      codigo: 'ID3',
      nombre: '% de estudiantes satisfechos con los recursos',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E7'],
      criterios: ['C7.1', 'C7.2', 'C7.3'],
      objetivo: 'Medir la satisfacción estudiantil con la disponibilidad y calidad de los recursos de aprendizaje: biblioteca, laboratorios, aulas, equipos tecnológicos y bibliografía.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los recursos disponibles son percibidos como suficientes y adecuados. Valores menores señalan déficits en infraestructura o equipamiento que afectan el aprendizaje.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección recursos e infraestructura',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_recursos / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_recursos: 'Número de estudiantes satisfechos con la disponibilidad y calidad de recursos académicos',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Incluye: laboratorios, biblioteca física y virtual, equipos de cómputo, aulas y espacios de estudio.',
    },
    {
      codigo: 'ID4',
      nombre: '% de estudiantes satisfechos con la evaluación del aprendizaje',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E2'],
      criterios: ['C2.3', 'C2.4'],
      objetivo: 'Medir la percepción estudiantil sobre la pertinencia, transparencia y justicia de los sistemas de evaluación utilizados en la carrera.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los estudiantes consideran las evaluaciones justas y pertinentes. Valores menores sugieren problemas en la claridad de criterios, retroalimentación o proporcionalidad de las evaluaciones.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección evaluación del aprendizaje',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_evaluacion / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_evaluacion: 'Número de estudiantes que consideran las evaluaciones pertinentes, claras y justas',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Evalúa: claridad de criterios, retroalimentación oportuna, diversidad de instrumentos y equidad en la calificación.',
    },
    {
      codigo: 'ID5',
      nombre: '% de estudiantes satisfechos con la asesoría y tutoría para la titulación',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E6'],
      criterios: ['C6.1', 'C6.2'],
      objetivo: 'Medir el nivel de satisfacción de los estudiantes con el acompañamiento recibido para la elaboración de tesis, proyectos de titulación y orientación del proceso de graduación.',
      valorReferencial: '≥ 70%',
      interpretacion: 'Un valor ≥ 70% indica un sistema de tutoría efectivo para el proceso de titulación. Valores menores reflejan deficiencias en el apoyo académico para que los estudiantes concluyan su formación.',
      fuenteInformacion: 'Encuesta semestral a estudiantes de los últimos ciclos (VII al X o equivalente)',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_tutoria / total_encuestados_titulacion) * 100',
      variables: {
        estudiantes_satisfechos_tutoria: 'Número de estudiantes satisfechos con la asesoría para titulación (disponibilidad, calidad y oportunidad del asesor)',
        total_encuestados_titulacion: 'Total de estudiantes de últimos ciclos o en proceso de titulación que respondieron la encuesta',
      },
      notas: 'Umbral superior (70%) por la relevancia crítica de este proceso en el indicador de tasa de titulación.',
    },
    {
      codigo: 'ID6',
      nombre: '% de estudiantes satisfechos con el currículo',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E2'],
      criterios: ['C2.1', 'C2.2'],
      objetivo: 'Medir la percepción de los estudiantes sobre la pertinencia, actualización y coherencia del plan de estudios con las demandas del mercado laboral y el perfil profesional.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que el currículo es percibido como relevante y actualizado. Valores menores señalan necesidad de revisión curricular urgente.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección currículo y plan de estudios',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_curriculo / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_curriculo: 'Número de estudiantes que califican positivamente la relevancia y actualización del plan de estudios',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Evalúa: pertinencia de cursos, secuencia lógica, equilibrio teórico-práctico y vinculación con el perfil profesional.',
    },
    {
      codigo: 'ID7',
      nombre: '% de estudiantes satisfechos con las actividades de bienestar',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E6'],
      criterios: ['C6.3', 'C6.4'],
      objetivo: 'Medir el nivel de satisfacción de los estudiantes con las actividades extracurriculares, deportivas, culturales y de salud que ofrece la institución.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que las actividades de bienestar son valoradas positivamente. Valores menores sugieren necesidad de ampliar o mejorar la oferta de actividades complementarias.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección actividades de bienestar',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_bienestar / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_bienestar: 'Número de estudiantes satisfechos con actividades deportivas, culturales, artísticas y de salud',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Incluye actividades deportivas, culturales, programas de salud mental, actividades sociales y recreativas.',
    },
    {
      codigo: 'ID8',
      nombre: '% de estudiantes satisfechos con los servicios de apoyo administrativo',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E1'],
      criterios: ['C1.4', 'C1.5'],
      objetivo: 'Medir la satisfacción de los estudiantes con los servicios administrativos: secretaría, registros académicos, trámites, plataformas digitales y atención al usuario.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica servicios administrativos eficientes y de calidad. Valores menores revelan cuellos de botella en los procesos de atención estudiantil.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección servicios administrativos',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_admin / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_admin: 'Número de estudiantes satisfechos con la eficiencia y calidad de los servicios administrativos',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Evalúa: tiempo de respuesta, amabilidad del personal, disponibilidad de plataformas digitales y claridad de procedimientos.',
    },
    {
      codigo: 'ID9',
      nombre: '% de estudiantes satisfechos con los programas de bienestar estudiantil',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E6'],
      criterios: ['C6.5'],
      objetivo: 'Medir la satisfacción con los programas estructurados de bienestar: becas, comedor, psicología, servicios médicos, seguro estudiantil y apoyo socioeconómico.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los programas de bienestar son percibidos como útiles y accesibles. Valores menores sugieren necesidad de ampliar cobertura o mejorar la difusión de estos servicios.',
      fuenteInformacion: 'Encuesta semestral de satisfacción estudiantil — sección programas de bienestar institucional',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_satisfechos_prog_bienestar / total_encuestados) * 100',
      variables: {
        estudiantes_satisfechos_prog_bienestar: 'Número de estudiantes satisfechos con los programas institucionales de bienestar (becas, salud, alimentación)',
        total_encuestados: 'Total de estudiantes que respondieron la encuesta',
      },
      notas: 'Diferente de ID7 (actividades) — este indicador mide programas formales: becas, comedor universitario, psicología, servicios médicos.',
    },

    // ─────────────────────────────────────────────────────────
    // DESEMPEÑO ACADÉMICO — ID10 e ID11 (SEMESTRAL)
    // ─────────────────────────────────────────────────────────
    {
      codigo: 'ID10',
      nombre: '% de estudiantes con calificación aprobatoria por asignatura',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E2'],
      criterios: ['C2.5', 'C2.6'],
      objetivo: 'Medir la tasa de aprobación por asignatura como indicador del desempeño académico de los estudiantes y la efectividad del proceso de enseñanza-aprendizaje.',
      valorReferencial: '≥ 80%',
      interpretacion: 'Un valor ≥ 80% indica que el proceso de enseñanza-aprendizaje es efectivo. Valores menores pueden señalar dificultades en la metodología docente, nivel de exigencia excesivo o falta de nivelación estudiantil.',
      fuenteInformacion: 'Sistema académico institucional — Actas de notas finales por asignatura',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(estudiantes_aprobados / total_matriculados_asignatura) * 100',
      variables: {
        estudiantes_aprobados: 'Número de estudiantes con nota final ≥ 11 (en escala vigesimal) en cada asignatura evaluada',
        total_matriculados_asignatura: 'Total de estudiantes matriculados en la asignatura al inicio del semestre (excluyendo retirados)',
      },
      notas: 'Se calcula como promedio de todas las asignaturas de la carrera. Se excluyen estudiantes con retiro justificado. Nota aprobatoria: ≥ 11 en escala vigesimal (0-20).',
    },
    {
      codigo: 'ID11',
      nombre: '% de cumplimiento de sílabos',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E2'],
      criterios: ['C2.7'],
      objetivo: 'Medir el grado de cumplimiento del contenido programado en los sílabos de todas las asignaturas de la carrera durante el semestre académico.',
      valorReferencial: '≥ 90%',
      interpretacion: 'Un valor ≥ 90% indica alta fidelidad en la ejecución del plan curricular. Valores menores señalan interrupciones docentes, eventos no planificados o desorganización del proceso formativo.',
      fuenteInformacion: 'Informe de cumplimiento de sílabos presentado por los coordinadores de área al finalizar el semestre',
      frecuenciaCalculo: 'SEMESTRAL' as const,
      formulaCalculo: '(silabos_cumplidos_al_100 / total_silabos_programados) * 100',
      variables: {
        silabos_cumplidos_al_100: 'Número de asignaturas cuyo sílabo fue desarrollado en su totalidad (≥ 90% de las sesiones planificadas)',
        total_silabos_programados: 'Total de asignaturas dictadas en el semestre con sílabo registrado',
      },
      notas: 'Se considera cumplido si se desarrolló ≥ 90% del contenido programado. El informe debe ser validado por el coordinador académico.',
    },

    // ─────────────────────────────────────────────────────────
    // SATISFACCIÓN DOCENTE — ID12 a ID19 (ANUAL)
    // ─────────────────────────────────────────────────────────
    {
      codigo: 'ID12',
      nombre: '% de docentes satisfechos con el currículo de la carrera',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.3'],
      objetivo: 'Medir la percepción de los docentes sobre la coherencia, actualización y pertinencia del plan de estudios de la carrera con las demandas del campo profesional.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los docentes valoran positivamente el currículo. Valores menores sugieren necesidad de revisión curricular con participación del cuerpo docente.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección currículo y plan de estudios',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_curriculo / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_curriculo: 'Número de docentes que califican positivamente el currículo (puntaje ≥ 4 en escala 1-5)',
        total_docentes_encuestados: 'Total de docentes de la carrera que respondieron la encuesta (mínimo 80% del total)',
      },
      notas: 'Aplicada anualmente, generalmente al finalizar el año académico. Incluye docentes ordinarios y contratados con ≥ 1 semestre dictado.',
    },
    {
      codigo: 'ID13',
      nombre: '% de docentes satisfechos con las condiciones laborales y el clima organizacional',
      // TODO: reemplazar con nombre oficial del Modelo CONEAU 2025
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.4'],
      objetivo: 'Medir la satisfacción del cuerpo docente con las condiciones de trabajo, ambiente laboral, relaciones interpersonales y cultura organizacional de la carrera e institución.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% refleja un clima organizacional favorable que favorece el desempeño docente. Valores menores pueden indicar conflictos internos o condiciones laborales inadecuadas.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección condiciones laborales y clima organizacional',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_clima / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_clima: 'Número de docentes satisfechos con las condiciones laborales y el clima organizacional',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: '// TODO: reemplazar nombre con el oficial del Modelo CONEAU 2025 cuando esté disponible',
    },
    {
      codigo: 'ID14',
      nombre: '% de docentes satisfechos con las políticas de evaluación y promoción docente',
      // TODO: reemplazar con nombre oficial del Modelo CONEAU 2025
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.5'],
      objetivo: 'Medir la percepción docente sobre la justicia, transparencia y claridad de los sistemas de evaluación del desempeño y los mecanismos de promoción y reconocimiento.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los docentes perciben justos los sistemas de evaluación y promoción. Valores menores señalan inequidades percibidas en la gestión del talento docente.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección evaluación y promoción',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_evaluacion_promo / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_evaluacion_promo: 'Número de docentes satisfechos con los sistemas de evaluación del desempeño y promoción',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: '// TODO: reemplazar nombre con el oficial del Modelo CONEAU 2025 cuando esté disponible',
    },
    {
      codigo: 'ID15',
      nombre: '% de docentes satisfechos con los programas de investigación y desarrollo académico',
      // TODO: reemplazar con nombre oficial del Modelo CONEAU 2025
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.6', 'C4.1'],
      objetivo: 'Medir la satisfacción docente con las oportunidades de investigación, publicación, participación en proyectos académicos y el apoyo institucional para el desarrollo científico.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que la institución brinda condiciones adecuadas para la actividad investigativa. Valores menores señalan barreras para el desarrollo académico e investigativo del cuerpo docente.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección investigación y desarrollo académico',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_investigacion / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_investigacion: 'Número de docentes satisfechos con las oportunidades y condiciones para la investigación',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: '// TODO: reemplazar nombre con el oficial del Modelo CONEAU 2025 cuando esté disponible',
    },
    {
      codigo: 'ID16',
      nombre: '% de docentes satisfechos con los recursos disponibles para la enseñanza',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.7', 'C7.4'],
      objetivo: 'Medir la satisfacción docente con la disponibilidad y calidad de los recursos pedagógicos: aulas, laboratorios, tecnología, bibliografía y materiales de enseñanza.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los docentes cuentan con los recursos necesarios para desarrollar su labor con calidad. Valores menores señalan carencias de infraestructura o materiales pedagógicos.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección recursos para la enseñanza',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_recursos / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_recursos: 'Número de docentes satisfechos con los recursos disponibles para la enseñanza',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: 'Incluye: equipos audiovisuales, acceso a bases de datos, laboratorios, aulas especializadas y plataformas virtuales.',
    },
    {
      codigo: 'ID17',
      nombre: '% de docentes satisfechos con la gestión y administración institucional',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.8', 'C1.6'],
      objetivo: 'Medir la percepción docente sobre la eficiencia de la gestión institucional: liderazgo de las autoridades, comunicación interna, cumplimiento de compromisos y transparencia administrativa.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica una gestión institucional percibida como eficiente y transparente. Valores menores pueden señalar problemas de liderazgo, comunicación o credibilidad institucional.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección gestión y administración',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_gestion / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_gestion: 'Número de docentes satisfechos con la gestión y administración institucional',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: 'Evalúa la percepción sobre dirección de departamento, decanato y rectorado en lo que respecta a la carrera.',
    },
    {
      codigo: 'ID18',
      nombre: '% de docentes satisfechos con los programas de fortalecimiento de capacidades',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.9'],
      objetivo: 'Medir la satisfacción docente con las oportunidades de capacitación, actualización pedagógica, formación continua y desarrollo profesional que ofrece la institución.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los programas de capacitación son valorados y pertinentes. Valores menores señalan que la oferta de formación docente no satisface las necesidades del cuerpo académico.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección capacitación y desarrollo profesional',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_capacitacion / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_capacitacion: 'Número de docentes satisfechos con los programas de capacitación y desarrollo profesional ofrecidos',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: 'Incluye: talleres pedagógicos, cursos de actualización disciplinar, apoyo para estudios de posgrado y participación en congresos.',
    },
    {
      codigo: 'ID19',
      nombre: '% de docentes satisfechos con los mecanismos de participación y representación',
      // TODO: reemplazar con nombre oficial del Modelo CONEAU 2025
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E3'],
      criterios: ['C3.10'],
      objetivo: 'Medir la satisfacción docente con los canales de participación en la toma de decisiones institucionales, representación en órganos de gobierno y mecanismos de consulta.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% refleja que los docentes se sienten representados e incluidos en la gestión institucional. Valores menores señalan necesidad de fortalecer la participación democrática del cuerpo docente.',
      fuenteInformacion: 'Encuesta anual de satisfacción docente — sección participación y representación',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(docentes_satisfechos_participacion / total_docentes_encuestados) * 100',
      variables: {
        docentes_satisfechos_participacion: 'Número de docentes satisfechos con los mecanismos de participación y representación',
        total_docentes_encuestados: 'Total de docentes encuestados',
      },
      notas: '// TODO: reemplazar nombre con el oficial del Modelo CONEAU 2025 cuando esté disponible',
    },

    // ─────────────────────────────────────────────────────────
    // SATISFACCIÓN DE EGRESADOS — ID20 a ID24 (ANUAL)
    // ─────────────────────────────────────────────────────────
    {
      codigo: 'ID20',
      nombre: '% de egresados satisfechos con la formación recibida',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.1'],
      objetivo: 'Medir la valoración global de los egresados sobre la formación académica y profesional recibida en la carrera, en retrospectiva desde su experiencia laboral.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que la formación brindada es valorada positivamente por quienes ya se desempeñan en el campo profesional. Valores menores señalan brechas entre la formación y las demandas del mercado.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — aplicada a egresados de los últimos 5 años',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_satisfechos_formacion / total_egresados_encuestados) * 100',
      variables: {
        egresados_satisfechos_formacion: 'Número de egresados que califican positivamente la formación recibida (puntaje global ≥ 4 en escala 1-5)',
        total_egresados_encuestados: 'Total de egresados que respondieron la encuesta anual de seguimiento',
      },
      notas: 'La encuesta se aplica a egresados de los últimos 5 años mediante plataforma digital y/o contacto directo. Se busca tasa de respuesta ≥ 30%.',
    },
    {
      codigo: 'ID21',
      nombre: '% de egresados satisfechos con los docentes que tuvo durante su formación',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.2'],
      objetivo: 'Medir la valoración retrospectiva de los egresados sobre la calidad, competencia y dedicación del cuerpo docente que los formó durante su carrera.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que los egresados reconocen la calidad del cuerpo docente como un factor positivo de su formación. Valores menores pueden señalar problemas persistentes en la calidad académica.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección docentes',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_satisfechos_docentes / total_egresados_encuestados) * 100',
      variables: {
        egresados_satisfechos_docentes: 'Número de egresados que califican positivamente a los docentes de su carrera (competencia, didáctica, compromiso)',
        total_egresados_encuestados: 'Total de egresados encuestados',
      },
      notas: 'Perspectiva retrospectiva desde la experiencia profesional del egresado, lo que aporta valor diferente a la evaluación estudiantil actual (ID2).',
    },
    {
      codigo: 'ID22',
      nombre: '% de egresados satisfechos con el currículo de la carrera',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.3'],
      objetivo: 'Medir la valoración de los egresados sobre la pertinencia del plan de estudios que cursaron, evaluando desde su experiencia laboral cuán preparados los dejó para el ejercicio profesional.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que el currículo es pertinente para el desempeño laboral. Valores menores señalan desconexión entre la formación y los requerimientos del mercado profesional.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección currículo y plan de estudios',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_satisfechos_curriculo / total_egresados_encuestados) * 100',
      variables: {
        egresados_satisfechos_curriculo: 'Número de egresados que consideran el currículo pertinente para su ejercicio profesional',
        total_egresados_encuestados: 'Total de egresados encuestados',
      },
      notas: 'Complementa al ID6 (estudiantes) y al ID12/ID22 (docentes), aportando la perspectiva del mercado laboral sobre el currículo.',
    },
    {
      codigo: 'ID23',
      nombre: '% de egresados satisfechos con la calidad de la enseñanza recibida',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.4'],
      objetivo: 'Medir la valoración global de los egresados sobre la calidad del proceso de enseñanza-aprendizaje vivido durante su formación, incluyendo metodologías, prácticas y recursos.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% refleja una percepción positiva de la calidad educativa desde la perspectiva del egresado. Valores menores sugieren necesidad de revisión de las metodologías de enseñanza.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección calidad de la enseñanza',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_satisfechos_ensenanza / total_egresados_encuestados) * 100',
      variables: {
        egresados_satisfechos_ensenanza: 'Número de egresados que califican positivamente la calidad del proceso de enseñanza-aprendizaje',
        total_egresados_encuestados: 'Total de egresados encuestados',
      },
      notas: 'Evalúa metodologías, prácticas profesionales, uso de tecnología en la enseñanza y desarrollo de competencias genéricas.',
    },
    {
      codigo: 'ID24',
      nombre: '% de egresados satisfechos con el impacto de su formación en su desarrollo profesional',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.5'],
      objetivo: 'Medir en qué medida los egresados consideran que la formación recibida ha contribuido a su éxito y desarrollo en el campo profesional.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que la formación tiene un impacto real y positivo en el desarrollo profesional de los egresados. Valores menores sugieren que la carrera no está preparando adecuadamente para el mercado.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección impacto en el desarrollo profesional',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_satisfechos_impacto / total_egresados_encuestados) * 100',
      variables: {
        egresados_satisfechos_impacto: 'Número de egresados que consideran que la formación impactó positivamente en su desarrollo profesional',
        total_egresados_encuestados: 'Total de egresados encuestados',
      },
      notas: 'Indicador clave de impacto a largo plazo. Correlacionar con ID26 (tiempo de inserción laboral) e ID27 (empleabilidad).',
    },

    // ─────────────────────────────────────────────────────────
    // GESTIÓN Y RESULTADOS — ID25 a ID29 (ANUAL)
    // ─────────────────────────────────────────────────────────
    {
      codigo: 'ID25',
      nombre: 'Tiempo promedio entre egreso y obtención del título profesional',
      tipoDato: 'RAZON' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.6'],
      objetivo: 'Medir la eficiencia del proceso de titulación calculando el tiempo promedio que transcurre desde que el estudiante termina el plan de estudios hasta que obtiene su título profesional.',
      valorReferencial: '≤ 2 años',
      interpretacion: 'Un valor ≤ 2 años indica un proceso de titulación ágil y accesible. Valores mayores señalan barreras burocráticas, deficiencias en el sistema de asesoría o dificultades académicas en los procesos de titulación.',
      fuenteInformacion: 'Sistema de registros académicos — cruce entre fecha de egreso y fecha de expedición del título',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: 'suma_meses_egreso_titulacion / cantidad_titulados_periodo',
      variables: {
        suma_meses_egreso_titulacion: 'Suma del número de meses transcurridos entre egreso y titulación de todos los titulados en el período de análisis',
        cantidad_titulados_periodo: 'Total de egresados que obtuvieron su título profesional durante el período de análisis',
      },
      notas: 'Resultado en meses, convertir a años para comparar con el referencial. El período de análisis es el año calendario. Incluye todas las modalidades de titulación.',
    },
    {
      codigo: 'ID26',
      nombre: 'Tiempo promedio entre egreso y primer empleo en el campo profesional',
      tipoDato: 'RAZON' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.7'],
      objetivo: 'Medir la velocidad de inserción laboral de los egresados en puestos acordes a su formación profesional.',
      valorReferencial: '≤ 1 año',
      interpretacion: 'Un valor ≤ 1 año (12 meses) indica alta empleabilidad y pertinencia de la formación. Valores mayores sugieren brechas de competencias o exceso de oferta en el mercado para ese perfil profesional.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección inserción laboral e historial de empleo',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: 'suma_meses_egreso_primer_empleo / cantidad_egresados_empleados',
      variables: {
        suma_meses_egreso_primer_empleo: 'Suma de los meses transcurridos entre el egreso y el primer empleo en campo profesional de cada egresado empleado',
        cantidad_egresados_empleados: 'Total de egresados encuestados que reportan tener empleo en su campo profesional',
      },
      notas: 'Solo se contabilizan empleos en el campo de formación (no empleos informales o fuera del área). Resultado en meses, convertir a años para comparar.',
    },
    {
      codigo: 'ID27',
      nombre: '% de egresados empleados en su campo profesional',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.8'],
      objetivo: 'Medir la tasa de empleabilidad de los egresados en posiciones acordes a su formación profesional como indicador de pertinencia y calidad de la carrera.',
      valorReferencial: '≥ 60%',
      interpretacion: 'Un valor ≥ 60% indica que la mayoría de egresados logran insertarse laboralmente en su campo. Valores menores sugieren problemas de pertinencia del perfil profesional o saturación del mercado.',
      fuenteInformacion: 'Encuesta anual de seguimiento a egresados — sección situación laboral actual',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(egresados_empleados_campo_profesional / total_egresados_encuestados) * 100',
      variables: {
        egresados_empleados_campo_profesional: 'Número de egresados que trabajan actualmente en puestos relacionados directamente con su formación profesional',
        total_egresados_encuestados: 'Total de egresados encuestados en el período anual',
      },
      notas: 'Se excluyen egresados que continúan estudios de posgrado a tiempo completo. La clasificación de "campo profesional" la valida el comité de calidad.',
    },
    {
      codigo: 'ID28',
      nombre: 'Tasa de graduación',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E2'],
      criterios: ['C2.8'],
      objetivo: 'Medir la proporción de estudiantes de una cohorte de ingreso que logran completar todos los requisitos académicos del plan de estudios y graduarse dentro del tiempo establecido.',
      valorReferencial: '≥ 50%',
      interpretacion: 'Un valor ≥ 50% indica que al menos la mitad de los ingresantes completan la carrera. Valores menores señalan alta deserción o dificultad para completar los estudios, requiriendo acciones de retención y apoyo estudiantil.',
      fuenteInformacion: 'Sistema de registros académicos — seguimiento de cohortes de ingreso',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(graduados_cohorte / matriculados_cohorte_ingreso) * 100',
      variables: {
        graduados_cohorte: 'Número de estudiantes de la cohorte de referencia que completaron todos los créditos y requisitos del plan de estudios',
        matriculados_cohorte_ingreso: 'Total de estudiantes que ingresaron a la carrera en el año de referencia de la cohorte analizada',
      },
      notas: 'Se analiza la cohorte con N años de antigüedad (N = duración nominal de la carrera + 2 años de gracia). Por ejemplo, para carrera de 6 años, analizar cohorte de 8 años atrás.',
    },
    {
      codigo: 'ID29',
      nombre: 'Tasa de titulación y % de empleadores satisfechos con el desempeño de los egresados',
      tipoDato: 'PORCENTAJE' as const,
      estandarId: estandares['E10'],
      criterios: ['C10.9', 'C9.1'],
      objetivo: 'Indicador compuesto que mide: (1) la proporción de graduados que obtienen el título profesional, y (2) la satisfacción de los empleadores con el desempeño de los egresados contratados.',
      valorReferencial: '≥ 40%',
      interpretacion: 'Para la tasa de titulación: ≥ 40% de graduados que obtienen título. Para empleadores: ≥ 40% califican positivamente. Valores menores indican barreras en el proceso de titulación o brechas de competencias detectadas por los empleadores.',
      fuenteInformacion: 'Sistema de registros académicos (titulados) + Encuesta anual a empleadores de egresados de la carrera',
      frecuenciaCalculo: 'ANUAL' as const,
      formulaCalculo: '(titulados_periodo / graduados_periodo) * 100',
      variables: {
        titulados_periodo: 'Número de graduados que obtuvieron su título profesional durante el año de análisis',
        graduados_periodo: 'Total de graduados de la carrera en los últimos 3 años (período de referencia para titulación)',
        empleadores_satisfechos: 'Número de empleadores que califican positivamente el desempeño de egresados (puntaje ≥ 4 en escala 1-5)',
        total_empleadores_encuestados: 'Total de empleadores que respondieron la encuesta anual',
      },
      notas: 'Indicador compuesto: se calcula por separado la tasa de titulación y la satisfacción de empleadores. El referencial ≥ 40% aplica a ambos sub-indicadores. La encuesta a empleadores requiere mínimo 20 respuestas para ser estadísticamente válida.',
    },
  ]

  let count = 0
  for (const data of indicadoresData) {
    await prisma.indicadorSineace.upsert({
      where: { codigo: data.codigo },
      update: {},
      create: data,
    })
    count++
    process.stdout.write(`\r   ✅ ${count}/29 indicadores creados`)
  }
  console.log(`\n   ✅ 29 indicadores SINEACE 2025 creados correctamente`)
}

// =============================================================
// BLOQUE E — VARIABLES DE EJEMPLO (Periodo 2024-II — Medicina Humana)
// =============================================================

/**
 * Por cada indicador se registran entre 2 y 4 variables con valores realistas.
 * El mix genera: ~65% cumplen, ~25% no cumplen, ~10% sin calcular.
 */

type VariableEntry = {
  nombre: string
  valor: number
  fuente: string
}

const INDICADOR_VARIABLES_MAP: Record<string, { periodo?: string; calculado: number; variables: VariableEntry[] }> = {
  // ── Satisfacción de Estudiantes ──
  ID1: {
    calculado: 72.5,
    variables: [
      { nombre: 'estudiantes_satisfechos', valor: 145, fuente: 'Encuesta semestral satisfacción estudiantil 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas 2024-II' },
    ],
  },
  ID2: {
    calculado: 56,
    variables: [
      { nombre: 'estudiantes_satisfechos_docentes', valor: 112, fuente: 'Encuesta evaluación docente 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas 2024-II' },
    ],
  },
  ID3: {
    calculado: 65,
    variables: [
      { nombre: 'estudiantes_satisfechos_recursos', valor: 130, fuente: 'Encuesta semestral satisfacción 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas aplicadas 2024-II' },
    ],
  },
  ID4: {
    calculado: 67.5,
    variables: [
      { nombre: 'estudiantes_satisfechos_evaluacion', valor: 135, fuente: 'Encuesta semestral — sección evaluación 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas 2024-II' },
    ],
  },
  ID5: {
    calculado: 60,
    variables: [
      { nombre: 'estudiantes_satisfechos_tutoria', valor: 120, fuente: 'Encuesta últimos ciclos 2024-II' },
      { nombre: 'total_encuestados_titulacion', valor: 200, fuente: 'Registro encuestas titulación 2024-II' },
    ],
  },
  ID6: {
    calculado: 70,
    variables: [
      { nombre: 'estudiantes_satisfechos_curriculo', valor: 140, fuente: 'Encuesta semestral — sección currículo 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas 2024-II' },
    ],
  },
  ID7: {
    calculado: 55,
    variables: [
      { nombre: 'estudiantes_satisfechos_bienestar', valor: 110, fuente: 'Encuesta semestral — bienestar 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas 2024-II' },
    ],
  },
  ID8: {
    calculado: 75,
    variables: [
      { nombre: 'estudiantes_satisfechos_admin', valor: 150, fuente: 'Encuesta semestral — servicios admin. 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas 2024-II' },
    ],
  },
  ID9: {
    calculado: 62.5,
    variables: [
      { nombre: 'estudiantes_satisfechos_prog_bienestar', valor: 125, fuente: 'Encuesta semestral — prog. bienestar 2024-II' },
      { nombre: 'total_encuestados', valor: 200, fuente: 'Registro de encuestas 2024-II' },
    ],
  },

  // ── Desempeño Académico ──
  ID10: {
    calculado: 85,
    variables: [
      { nombre: 'estudiantes_aprobados', valor: 340, fuente: 'Actas de notas finales 2024-II — Sistema Académico' },
      { nombre: 'total_matriculados_asignatura', valor: 400, fuente: 'Nómina de matriculados 2024-II' },
    ],
  },
  ID11: {
    calculado: 88,
    variables: [
      { nombre: 'silabos_cumplidos_al_100', valor: 22, fuente: 'Informe coordinadores de área 2024-II' },
      { nombre: 'total_silabos_programados', valor: 25, fuente: 'Registro de sílabos programados 2024-II' },
    ],
  },

  // ── Satisfacción Docente ──
  ID12: {
    calculado: 70,
    variables: [
      { nombre: 'docentes_satisfechos_curriculo', valor: 28, fuente: 'Encuesta anual docentes — currículo 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID13: {
    calculado: 55,
    variables: [
      { nombre: 'docentes_satisfechos_clima', valor: 22, fuente: 'Encuesta anual docentes — clima 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID14: {
    calculado: 65,
    variables: [
      { nombre: 'docentes_satisfechos_evaluacion_promo', valor: 26, fuente: 'Encuesta anual docentes — eval./prom. 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID15: {
    calculado: 50,
    variables: [
      { nombre: 'docentes_satisfechos_investigacion', valor: 20, fuente: 'Encuesta anual docentes — investigación 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID16: {
    calculado: 75,
    variables: [
      { nombre: 'docentes_satisfechos_recursos', valor: 30, fuente: 'Encuesta anual docentes — recursos 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID17: {
    calculado: 62.5,
    variables: [
      { nombre: 'docentes_satisfechos_gestion', valor: 25, fuente: 'Encuesta anual docentes — gestión 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID18: {
    calculado: 67.5,
    variables: [
      { nombre: 'docentes_satisfechos_capacitacion', valor: 27, fuente: 'Encuesta anual docentes — capacitación 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },
  ID19: {
    calculado: 55,
    variables: [
      { nombre: 'docentes_satisfechos_participacion', valor: 22, fuente: 'Encuesta anual docentes — participación 2024' },
      { nombre: 'total_docentes_encuestados', valor: 40, fuente: 'Registro encuestas docentes 2024' },
    ],
  },

  // ── Satisfacción de Egresados ──
  ID20: {
    calculado: 68.6,
    variables: [
      { nombre: 'egresados_satisfechos_formacion', valor: 48, fuente: 'Encuesta seguimiento egresados 2024' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },
  ID21: {
    calculado: 64.3,
    variables: [
      { nombre: 'egresados_satisfechos_docentes', valor: 45, fuente: 'Encuesta seguimiento egresados 2024 — docentes' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },
  ID22: {
    calculado: 60,
    variables: [
      { nombre: 'egresados_satisfechos_curriculo', valor: 42, fuente: 'Encuesta seguimiento egresados 2024 — currículo' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },
  ID23: {
    calculado: 57.1,
    variables: [
      { nombre: 'egresados_satisfechos_ensenanza', valor: 40, fuente: 'Encuesta seguimiento egresados 2024 — enseñanza' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },
  ID24: {
    calculado: 65.7,
    variables: [
      { nombre: 'egresados_satisfechos_impacto', valor: 46, fuente: 'Encuesta seguimiento egresados 2024 — impacto' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },

  // ── Gestión y Resultados ──
  ID25: {
    calculado: 1.5,
    variables: [
      { nombre: 'suma_meses_egreso_titulacion', valor: 504, fuente: 'Sistema registros académicos — cohorte titulados 2024' },
      { nombre: 'cantidad_titulados_periodo', valor: 28, fuente: 'Registro de titulados 2024' },
    ],
  },
  ID26: {
    calculado: 1.42,
    variables: [
      { nombre: 'suma_meses_egreso_primer_empleo', valor: 408, fuente: 'Encuesta egresados — inserción laboral 2024' },
      { nombre: 'cantidad_egresados_empleados', valor: 24, fuente: 'Registro encuestados empleados 2024' },
    ],
  },
  ID27: {
    calculado: 54.3,
    variables: [
      { nombre: 'egresados_empleados_campo_profesional', valor: 38, fuente: 'Encuesta egresados — situación laboral 2024' },
      { nombre: 'total_egresados_encuestados', valor: 70, fuente: 'Registro encuestas egresados 2024' },
    ],
  },
  ID28: {
    calculado: 62,
    variables: [
      { nombre: 'graduados_cohorte', valor: 62, fuente: 'Sistema académico — cohorte 2016 (8 años)' },
      { nombre: 'matriculados_cohorte_ingreso', valor: 100, fuente: 'Nómina ingresantes 2016' },
    ],
  },
  ID29: {
    calculado: 55,
    variables: [
      { nombre: 'titulados_periodo', valor: 22, fuente: 'Registro de titulados 2024' },
      { nombre: 'graduados_periodo', valor: 40, fuente: 'Graduados últimos 3 años' },
    ],
  },
}

// Datos adicionales periodo 2024-I (para tendencias y alerta TENDENCIA_NEGATIVA)
const INDICADOR_ANTERIOR_MAP: Record<string, { calculado: number }> = {
  ID2: { calculado: 62 },
  ID7: { calculado: 58 },
  ID13: { calculado: 60 },
  ID15: { calculado: 55 },
  ID19: { calculado: 60 },
  ID23: { calculado: 62 },
  ID26: { calculado: 1.2 },
  ID27: { calculado: 62 },
}

async function seedVariablesEjemplo() {
  console.log('📝 Registrando variables de ejemplo (Periodo 2024-II — Medicina Humana)...')

  const coordinador = await prisma.user.findFirst({ where: { rol: Rol.COORDINADOR_CALIDAD } })
  if (!coordinador) throw new Error('No se encontró usuario COORDINADOR_CALIDAD')
  const medicina = await prisma.carrera.findUnique({ where: { codigo: 'MED-001' } })
  if (!medicina) throw new Error('No se encontró carrera Medicina Humana')

  const indicadores = await prisma.indicadorSineace.findMany({
    where: { activo: true },
    select: { id: true, codigo: true, valorReferencial: true },
  })

  let varCount = 0
  const registrosData: Array<{
    codigo: string
    valorCalculado: number
    cumple: boolean
  }> = []

  for (const ind of indicadores) {
    const entry = INDICADOR_VARIABLES_MAP[ind.codigo]
    if (!entry) {
      console.log(`   ⚠️  Sin datos para ${ind.codigo}, omitiendo...`)
      continue
    }

    // Crear variables para 2024-II
    const variablesParaRegistro = entry.variables.map((v) => ({
      indicadorId: ind.id,
      carreraId: medicina.id,
      nombreVariable: v.nombre,
      valorNumerico: v.valor,
      periodo: '2024-II',
      fuenteDato: v.fuente,
      verificadoPorId: coordinador.id,
    }))

    for (const v of variablesParaRegistro) {
      await prisma.variableIndicador.upsert({
        where: {
          carreraId_indicadorId_periodo_nombreVariable: {
            carreraId: v.carreraId,
            indicadorId: v.indicadorId,
            periodo: v.periodo,
            nombreVariable: v.nombreVariable,
          },
        },
        update: {},
        create: v,
      })
      varCount++
    }

    // Determinar si cumple o no
    const ref = ind.valorReferencial
    const cumple = evaluarCumplimientoSimple(entry.calculado, ref)
    registrosData.push({ codigo: ind.codigo, valorCalculado: entry.calculado, cumple })

    process.stdout.write(`\r   ✅ ${varCount} variables registradas`)
  }

  console.log(`\n   ✅ ${varCount} variables de ejemplo creadas (29 indicadores, 2024-II)`)

  // Crear también algunas variables para 2024-I (para tendencias)
  for (const ind of indicadores) {
    const anterior = INDICADOR_ANTERIOR_MAP[ind.codigo]
    if (!anterior) continue

    const entry = INDICADOR_VARIABLES_MAP[ind.codigo]
    if (!entry) continue

    const varsAnterior = entry.variables.map((v) => ({
      indicadorId: ind.id,
      carreraId: medicina.id,
      nombreVariable: v.nombre,
      // Ajustar valor ligeramente para el periodo anterior
      valorNumerico: Math.round(v.valor * (0.85 + Math.random() * 0.3)),
      periodo: '2024-I',
      fuenteDato: v.fuente.replace('2024-II', '2024-I'),
      verificadoPorId: coordinador.id,
    }))

    for (const v of varsAnterior) {
      await prisma.variableIndicador.upsert({
        where: {
          carreraId_indicadorId_periodo_nombreVariable: {
            carreraId: v.carreraId,
            indicadorId: v.indicadorId,
            periodo: v.periodo,
            nombreVariable: v.nombreVariable,
          },
        },
        update: {},
        create: v,
      })
      varCount++
    }
  }

  console.log(`   ✅ Variables adicionales 2024-I creadas para tendencias`)

  return { medicinaId: medicina.id, coordinadorId: coordinador.id, indicadores, registrosData }
}

function evaluarCumplimientoSimple(valor: number, referencial: string): boolean {
  const match = referencial.trim().match(/^(≥|≤|>|<|=|==)\s*([\d.,]+)/)
  if (!match) return false
  const operador = match[1]
  const umbral = parseFloat(match[2].replace(',', '.'))
  switch (operador) {
    case '≥': return valor >= umbral
    case '≤': return valor <= umbral
    case '>': return valor > umbral
    case '<': return valor < umbral
    case '=':
    case '==': return valor === umbral
    default: return false
  }
}

// =============================================================
// BLOQUE F — REGISTROS DE INDICADORES DE EJEMPLO
// =============================================================

async function seedRegistrosEjemplo(medicinaId: string, coordinadorId: string, registrosData: Array<{ codigo: string; valorCalculado: number; cumple: boolean }>) {
  console.log('📊 Creando registros de indicadores de ejemplo...')

  const indicadores = await prisma.indicadorSineace.findMany({
    where: { activo: true },
    select: { id: true, codigo: true, valorReferencial: true },
  })

  let regCount = 0
  let cumpleCount = 0
  let noCumpleCount = 0

  // Crear registros 2024-II
  for (const rd of registrosData) {
    const ind = indicadores.find((i) => i.codigo === rd.codigo)
    if (!ind) continue

    await prisma.registroIndicador.upsert({
      where: {
        carreraId_indicadorId_periodo: {
          carreraId: medicinaId,
          indicadorId: ind.id,
          periodo: '2024-II',
        },
      },
      update: {},
      create: {
        carreraId: medicinaId,
        indicadorId: ind.id,
        periodo: '2024-II',
        valorCalculado: rd.valorCalculado,
        valorReferencial: ind.valorReferencial,
        cumpleReferencial: rd.cumple,
        calculadoPorId: coordinadorId,
        variablesUtilizadas: {},
      } as any,
    })
    regCount++
    if (rd.cumple) cumpleCount++
    else noCumpleCount++
  }

  // Crear registros 2024-I para tendencias (solo para los que tienen datos anteriores)
  for (const [codigo, anterior] of Object.entries(INDICADOR_ANTERIOR_MAP)) {
    const ind = indicadores.find((i) => i.codigo === codigo)
    if (!ind) continue

    await prisma.registroIndicador.upsert({
      where: {
        carreraId_indicadorId_periodo: {
          carreraId: medicinaId,
          indicadorId: ind.id,
          periodo: '2024-I',
        },
      },
      update: {},
      create: {
        carreraId: medicinaId,
        indicadorId: ind.id,
        periodo: '2024-I',
        valorCalculado: anterior.calculado,
        valorReferencial: ind.valorReferencial,
        cumpleReferencial: evaluarCumplimientoSimple(anterior.calculado, ind.valorReferencial),
        calculadoPorId: coordinadorId,
        variablesUtilizadas: {},
      } as any,
    })
  }

  console.log(`   ✅ ${regCount} registros creados | 🟢 ${cumpleCount} cumplen | 🔴 ${noCumpleCount} no cumplen`)
  return { cumpleCount, noCumpleCount, indicadores }
}

// =============================================================
// BLOQUE G — ALERTAS DE EJEMPLO
// =============================================================

async function seedAlertasEjemplo(medicinaId: string, coordinadorId: string) {
  console.log('🔔 Creando alertas de ejemplo...')

  const indicadores = await prisma.indicadorSineace.findMany({
    where: { activo: true },
    select: { id: true, codigo: true },
  })
  const getUserByRol = async (rol: Rol) => prisma.user.findFirst({ where: { rol } })

  const indById = (codigo: string) => indicadores.find((i) => i.codigo === codigo)?.id
  const getRegistro = async (indicadorCodigo: string, periodo: string) => {
    const indId = indById(indicadorCodigo)
    if (!indId) return null
    return prisma.registroIndicador.findUnique({
      where: {
        carreraId_indicadorId_periodo: {
          carreraId: medicinaId,
          indicadorId: indId,
          periodo,
        },
      },
    })
  }

  // Alerta 1 — Atendida, CRITICO (ID2 — % estudiantes satisfechos con docentes bajo)
  const regID2 = await getRegistro('ID2', '2024-II')
  if (regID2) {
    const superadmin = await getUserByRol(Rol.SUPERADMIN)
    await prisma.alertaIndicador.upsert({
      where: { id: `alerta-ejemplo-1` },
      update: {},
      create: {
        id: `alerta-ejemplo-1`,
        registroIndicadorId: regID2.id,
        indicadorId: regID2.indicadorId,
        tipoAlerta: TipoAlerta.CRITICO,
        mensaje: `Incumplimiento crítico: Solo el 56% de estudiantes está satisfecho con los docentes (referencial: ≥ 70%). Se requiere intervención urgente en el plan de capacitación docente.`,
        atendida: true,
        atendidaPorId: superadmin?.id ?? coordinadorId,
        fechaAtencion: new Date('2025-01-15'),
        observacionAtencion: 'Se programó taller de mejora docente para el semestre 2025-I. Se asignaron tutores pedagógicos a los 3 docentes con menor puntuación.',
      },
    })
    console.log('   ✅ Alerta 1: Atendida (CRITICO) — ID2')
  }

  // Alerta 2 — Pendiente, BAJO (ID5 — % estudiantes satisfechos con tutoría)
  const regID5 = await getRegistro('ID5', '2024-II')
  if (regID5) {
    await prisma.alertaIndicador.upsert({
      where: { id: `alerta-ejemplo-2` },
      update: {},
      create: {
        id: `alerta-ejemplo-2`,
        registroIndicadorId: regID5.id,
        indicadorId: regID5.indicadorId,
        tipoAlerta: TipoAlerta.BAJO,
        mensaje: `Incumplimiento de indicador: El valor calculado (60%) no cumple con el referencial (≥ 70%) para satisfacción con asesoría de titulación.`,
        atendida: false,
      },
    })
    console.log('   ✅ Alerta 2: Pendiente (BAJO) — ID5')
  }

  // Alerta 3 — Pendiente, TENDENCIA_NEGATIVA (ID27 — % egresados empleados en campo profesional bajando)
  const regID27 = await getRegistro('ID27', '2024-II')
  if (regID27) {
    await prisma.alertaIndicador.upsert({
      where: { id: `alerta-ejemplo-3` },
      update: {},
      create: {
        id: `alerta-ejemplo-3`,
        registroIndicadorId: regID27.id,
        indicadorId: regID27.indicadorId,
        tipoAlerta: TipoAlerta.TENDENCIA_NEGATIVA,
        mensaje: `Tendencia negativa: El % de egresados empleados en campo profesional bajó de 62% (2024-I) a 54.3% (2024-II). Se recomienda revisar pertinencia del perfil de egreso y vínculos con empleadores.`,
        atendida: false,
      },
    })
    console.log('   ✅ Alerta 3: Pendiente (TENDENCIA_NEGATIVA) — ID27')
  }

  console.log('   ✅ 3 alertas de ejemplo creadas')
}

// =============================================================
// FUNCIÓN PRINCIPAL
// =============================================================
async function main() {
  console.log('\n🚀 Iniciando seeder SINEACE-UNT — Modelo CONEAU 2025\n')
  console.log('='.repeat(60))

  try {
    // Bloque A: Usuarios
    const usuarios = await seedUsuarios()
    const decano = usuarios.find((u) => u.rol === Rol.DECANO)!
    const coordinador = usuarios.find((u) => u.rol === Rol.COORDINADOR_CALIDAD)!

    // Bloque B: Facultades y Carreras
    await seedFacultadesYCarreras(decano.id, coordinador.id)

    // Bloque C: Estándares SINEACE
    const estandares = await seedEstandares()

    // Bloque D: 29 Indicadores SINEACE 2025
    await seedIndicadores(estandares)

    // Bloque E: Variables de ejemplo — Periodo 2024-II (Medicina Humana)
    const { medicinaId, coordinadorId, registrosData } = await seedVariablesEjemplo()

    // Bloque F: Registros de indicadores de ejemplo
    await seedRegistrosEjemplo(medicinaId, coordinadorId, registrosData)

    // Bloque G: Alertas de ejemplo
    await seedAlertasEjemplo(medicinaId, coordinadorId)

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Seeder completado exitosamente!')
    console.log('='.repeat(60))
    console.log('\n📌 Credenciales de acceso:')
    console.log('   SUPERADMIN:          superadmin@unt.edu.pe          / Sineace2025!')
    console.log('   VICERRECTOR:         vicerrector@unt.edu.pe         / Sineace2025!')
    console.log('   DECANO:              decano.medicina@unt.edu.pe     / Sineace2025!')
    console.log('   COORDINADOR CALIDAD: coordinador.calidad@unt.edu.pe / Sineace2025!')
    console.log('   EVALUADOR EXTERNO:   evaluador.externo@sineace.gob.pe / Sineace2025!\n')
  } catch (error) {
    console.error('\n❌ Error durante el seeder:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
