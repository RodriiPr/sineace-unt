# Sistema de Gestión de Acreditación SINEACE — Universidad Nacional de Trujillo (UNT)

> **Marco regulatorio:** Modelo de Acreditación CONEAU 2025 (Resolución N.° 000106-2025-SINEACE/COSUSINEACE-P, 07 agosto 2025)  
> **Estructura:** 10 estándares · 53 criterios · 52 evidencias · 29 indicadores  
> **Ley base:** Ley Universitaria N.º 30220

---

## Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Reglas de Código Obligatorias](#2-reglas-de-código-obligatorias)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Fase 1 — Prisma Schema](#4-fase-1--prisma-schema)
5. [Fase 2 — Catálogo de 29 Indicadores SINEACE 2025](#5-fase-2--catálogo-de-29-indicadores-sineace-2025)
6. [Fase 3 — Configuración Base](#6-fase-3--configuración-base)
7. [Fase 4 — Módulo de Indicadores SINEACE](#7-fase-4--módulo-de-indicadores-sineace)
8. [Fase 5 — Integración con Dashboard Principal](#8-fase-5--integración-con-dashboard-principal)
9. [Fase 6 — Módulo de Gestión de Acreditaciones](#9-fase-6--módulo-de-gestión-de-acreditaciones)
10. [Fase 7 — Módulo de Reportes](#10-fase-7--módulo-de-reportes)
11. [Fase 8 — Seeders Completos](#11-fase-8--seeders-completos)
12. [Instrucciones de Output](#12-instrucciones-de-output)
13. [Checklist de Validación Final](#13-checklist-de-validación-final)
14. [Tabla Comparativa: Versión Anterior vs. SINEACE 2025](#14-tabla-comparativa)

---

## 1. Stack Tecnológico

> ⚠️ El stack es **NO NEGOCIABLE**. Toda implementación debe usar exactamente estas versiones y librerías.

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 15+ (App Router, Server Components por defecto) |
| Lenguaje | TypeScript (strict mode) |
| Base de datos | PostgreSQL 15+ |
| ORM | Prisma 5+ (type-safe) |
| Autenticación | Auth.js v5 (NextAuth.js) — Credentials + OAuth |
| Estilos | Tailwind CSS 3.4+ |
| Componentes UI | shadcn/ui (instalado via CLI) |
| Visualización | Recharts |
| Documentos | react-pdf + xlsx |
| Validación | Zod |
| Formularios | React Hook Form + Zod Resolver |
| Fechas | dayjs con locale `'es'` |

---

## 2. Reglas de Código Obligatorias

1. Usar **Server Actions** de Next.js para mutaciones (NO API Routes tradicionales).
2. Toda query a base de datos debe usar **Prisma con tipos explícitos**.
3. Toda entrada de usuario debe validarse con **Zod ANTES** de tocar la base de datos.
4. Implementar **RBAC** en cada Server Action: verificar rol del usuario autenticado.
5. Manejo de errores: `try/catch` con retorno de objetos `{ success: boolean, error?: string, data?: T }`.
6. **NUNCA** exponer claves, tokens ni información sensible en el cliente.
7. Usar **transacciones Prisma** (`$transaction`) para operaciones que afecten múltiples tablas.
8. Implementar `revalidatePath()` después de mutaciones exitosas.
9. Componentes UI: usar shadcn/ui existentes; solo crear custom si no existe equivalente.
10. Fechas: usar **dayjs con locale `'es'`** para toda presentación.

---

## 3. Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rutas auth (login, register)
│   ├── (dashboard)/              # Grupo de rutas protegidas
│   │   ├── dashboard/
│   │   ├── carreras/
│   │   ├── facultades/
│   │   ├── acreditaciones/
│   │   ├── autoevaluacion/
│   │   ├── evaluacion-externa/
│   │   ├── indicadores-sineace/  # NUEVO: Módulo de indicadores
│   │   └── reportes/
│   ├── api/                      # Solo para webhooks y auth callbacks
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components (NO MODIFICAR)
│   ├── forms/                    # Formularios reutilizables
│   ├── tables/                   # Tablas con filtros/paginación
│   ├── charts/                   # Gráficos con Recharts
│   ├── indicadores/              # NUEVO: Componentes de indicadores
│   └── layout/                   # Navbar, Sidebar, Breadcrumbs
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   ├── auth.ts                   # Configuración Auth.js
│   ├── utils.ts                  # Helpers (cn, formatters)
│   ├── permissions.ts            # Matriz de permisos RBAC
│   ├── indicadores/              # NUEVO: Lógica de cálculo de indicadores
│   └── validators/               # Esquemas Zod por dominio
├── actions/                      # Server Actions organizadas por dominio
│   ├── auth.actions.ts
│   ├── carrera.actions.ts
│   ├── acreditacion.actions.ts
│   ├── indicador.actions.ts      # NUEVO
│   └── reporte.actions.ts
├── hooks/                        # Custom React hooks
├── types/                        # Tipos TypeScript globales
└── prisma/
    └── schema.prisma
```

---

## 4. Fase 1 — Prisma Schema

**Archivo:** `prisma/schema.prisma`

### 4.1 Entidades Base

#### `User`
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | PK |
| email | String | Único |
| nombre | String | |
| apellido | String | |
| rol | Enum `Rol` | Ver roles abajo |
| activo | Boolean | Default: true |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Enum `Rol`:** `SUPERADMIN`, `VICERRECTOR`, `DECANO`, `COORDINADOR_CALIDAD`, `EVALUADOR_EXTERNO`

#### `Facultad`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| nombre | String |
| codigo | String |
| decanoId | FK → User |
| activo | Boolean |

#### `Carrera`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| nombre | String |
| codigo | String |
| facultadId | FK → Facultad |
| coordinadorId | FK → User |
| fechaCreacion | DateTime |
| activo | Boolean |

#### `Acreditacion`
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | PK |
| carreraId | FK → Carrera | |
| estado | Enum `EstadoAcreditacion` | |
| fechaSolicitud | DateTime | |
| fechaResolucion | DateTime? | |
| fechaVencimiento | DateTime? | |
| resultado | String? | |
| observaciones | String? | |
| createdById | FK → User | |

**Enum `EstadoAcreditacion`:** `SOLICITUD`, `AUTOEVALUACION`, `EVALUACION_EXTERNA`, `CONDICIONAMIENTOS`, `RESOLUCION`, `ACREDITADA`, `NO_ACREDITADA`, `RENOVACION`

#### `Evidencia`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| acreditacionId | FK → Acreditacion |
| tipo | String |
| descripcion | String |
| archivoUrl | String |
| version | Int |
| subidoPorId | FK → User |
| createdAt | DateTime |

#### `Autoevaluacion`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| acreditacionId | FK → Acreditacion |
| estandarSineaceId | FK → EstandarSineace |
| puntaje | Decimal |
| observaciones | String? |
| evaluadorId | FK → User |
| fechaEvaluacion | DateTime |

#### `EstandarSineace`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| codigo | String |
| nombre | String |
| descripcion | String |
| activo | Boolean |

#### `EvaluacionExterna`
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| acreditacionId | FK → Acreditacion |
| fechaVisita | DateTime |
| evaluadores | Json |
| informeUrl | String? |
| observaciones | String? |
| resultado | String? |
| createdById | FK → User |

#### `Condicionamiento`
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | |
| acreditacionId | FK → Acreditacion | |
| descripcion | String | |
| plazoDias | Int | |
| fechaCumplimiento | DateTime? | |
| estado | Enum `EstadoCondicionamiento` | |
| verificadoPorId | FK → User? | |

**Enum `EstadoCondicionamiento`:** `PENDIENTE`, `EN_PROCESO`, `CUMPLIDO`, `NO_CUMPLIDO`

#### `Auditoria`
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | |
| tabla | String | |
| registroId | String | |
| accion | Enum `AccionAuditoria` | |
| campo | String? | |
| valorAnterior | String? | |
| valorNuevo | String? | |
| usuarioId | FK → User | SET NULL on delete |
| fecha | DateTime | |

**Enum `AccionAuditoria`:** `CREATE`, `UPDATE`, `DELETE`

---

### 4.2 Entidades de Indicadores SINEACE 2025 (NUEVAS — OBLIGATORIAS)

#### `IndicadorSineace` — Catálogo maestro
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | PK |
| codigo | String | Único. Ej: "ID1"–"ID29" |
| nombre | String | Nombre completo del indicador |
| tipoDato | Enum | `PORCENTAJE`, `PROMEDIO`, `RAZON` |
| estandarId | FK → EstandarSineace | |
| criterios | Json | Array de códigos de criterios |
| objetivo | String | Descripción del objetivo de medición |
| valorReferencial | String | Ej: "≥ 60%", "≤ 2 años" |
| interpretacion | String | Texto de interpretación |
| fuenteInformacion | String | |
| frecuenciaCalculo | Enum | `SEMESTRAL`, `ANUAL`, `BIENAL` |
| formulaCalculo | String | Texto con variables |
| variables | Json | Descripción de cada variable |
| notas | String? | |
| activo | Boolean | Default: true |

#### `RegistroIndicador` — Valores calculados por carrera y periodo
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | PK |
| carreraId | FK → Carrera | |
| indicadorId | FK → IndicadorSineace | |
| periodo | String | Ej: "2024-I", "2024-II", "2024" |
| valorCalculado | Decimal | |
| valorReferencial | String | |
| cumpleReferencial | Boolean | |
| observaciones | String? | |
| variablesUtilizadas | Json | Valores de cada variable |
| calculadoPorId | FK → User | |
| fechaCalculo | DateTime | |
| fechaActualizacion | DateTime | |
| evidenciaUrl | String? | |

> **Índice único compuesto:** `carreraId + indicadorId + periodo`

#### `VariableIndicador` — Valores de entrada para cálculos
| Campo | Tipo |
|---|---|
| id | String (cuid) |
| carreraId | FK → Carrera |
| indicadorId | FK → IndicadorSineace |
| periodo | String |
| nombreVariable | String |
| valorNumerico | Decimal |
| fuenteDato | String |
| verificadoPorId | FK → User |
| fechaRegistro | DateTime |

> **Índice único compuesto:** `carreraId + indicadorId + periodo + nombreVariable`

#### `AlertaIndicador` — Alertas por incumplimiento
| Campo | Tipo | Notas |
|---|---|---|
| id | String (cuid) | PK |
| registroIndicadorId | FK → RegistroIndicador | |
| tipoAlerta | Enum | `BAJO`, `CRITICO`, `TENDENCIA_NEGATIVA` |
| mensaje | String | |
| fechaGeneracion | DateTime | |
| atendida | Boolean | Default: false |
| atendidaPorId | FK → User? | |
| fechaAtencion | DateTime? | |

> **Índice:** `atendida + fechaGeneracion`

---

### 4.3 Índices y Relaciones Obligatorios

| Índice | Tabla | Tipo |
|---|---|---|
| `email` | User | Único |
| `carreraId + estado` | Acreditacion | Compuesto |
| `fechaVencimiento` | Acreditacion | Simple (para alertas) |
| `acreditacionId` | Evidencia | Simple |
| `fecha DESC` | Auditoria | Simple descendente |
| `codigo` | IndicadorSineace | Único |
| `carreraId + indicadorId + periodo` | RegistroIndicador | Único compuesto |
| `carreraId + indicadorId + periodo + nombreVariable` | VariableIndicador | Único compuesto |
| `atendida + fechaGeneracion` | AlertaIndicador | Compuesto |

**Política de eliminación:**
- General: `ON DELETE RESTRICT`
- Auditoria (usuarioId): `ON DELETE SET NULL`

---

## 5. Fase 2 — Catálogo de 29 Indicadores SINEACE 2025

**Archivo:** `prisma/seed.ts`

### 5.1 Indicadores de Satisfacción de Estudiantes (ID1–ID9)

| Código | Nombre | Valor Referencial | Frecuencia |
|---|---|---|---|
| ID1 | % estudiantes satisfechos con la gestión y desarrollo de actividades académicas y administrativas | ≥ 60% | Semestral |
| ID2 | % estudiantes satisfechos con docentes | ≥ 70% | Semestral |
| ID3 | % estudiantes satisfechos con recursos | ≥ 60% | Semestral |
| ID4 | % estudiantes satisfechos con evaluación del aprendizaje | ≥ 60% | Semestral |
| ID5 | % estudiantes satisfechos con asesoría/tutoría para título | ≥ 70% | Semestral |
| ID6 | % estudiantes satisfechos con currículo | ≥ 60% | Semestral |
| ID7 | % estudiantes satisfechos con actividades de bienestar | ≥ 60% | Semestral |
| ID8 | % estudiantes satisfechos con servicios de apoyo administrativo | ≥ 60% | Semestral |
| ID9 | % estudiantes satisfechos con programas de bienestar | ≥ 60% | Semestral |

### 5.2 Indicadores de Desempeño Académico (ID10–ID11)

| Código | Nombre | Valor Referencial | Frecuencia |
|---|---|---|---|
| ID10 | % estudiantes con calificación aprobatoria por asignatura | ≥ 80% | Semestral |
| ID11 | % cumplimiento de sílabos | ≥ 90% | Semestral |

### 5.3 Indicadores de Satisfacción Docente (ID12–ID19)

| Código | Nombre | Valor Referencial | Frecuencia |
|---|---|---|---|
| ID12 | % docentes satisfechos con currículo | ≥ 60% | Anual |
| ID13 | % docentes satisfechos con [completar según modelo oficial] | ≥ 60% | Anual |
| ID14 | % docentes satisfechos con [completar según modelo oficial] | ≥ 60% | Anual |
| ID15 | % docentes satisfechos con [completar según modelo oficial] | ≥ 60% | Anual |
| ID16 | % docentes satisfechos con recursos | ≥ 60% | Anual |
| ID17 | % docentes satisfechos con administración | ≥ 60% | Anual |
| ID18 | % docentes satisfechos con fortalecimiento de capacidades | ≥ 60% | Anual |
| ID19 | % docentes satisfechos con [completar según modelo oficial] | ≥ 60% | Anual |

### 5.4 Indicadores de Satisfacción de Egresados (ID20–ID24)

| Código | Nombre | Valor Referencial | Frecuencia |
|---|---|---|---|
| ID20 | % egresados satisfechos con formación recibida | ≥ 60% | Anual |
| ID21 | % egresados satisfechos con docentes | ≥ 60% | Anual |
| ID22 | % egresados satisfechos con currículo | ≥ 60% | Anual |
| ID23 | % egresados satisfechos con calidad de enseñanza | ≥ 60% | Anual |
| ID24 | % egresados satisfechos con impacto de formación en desarrollo profesional | ≥ 60% | Anual |

### 5.5 Indicadores de Gestión y Resultados (ID25–ID29)

| Código | Nombre | Valor Referencial | Frecuencia |
|---|---|---|---|
| ID25 | Tiempo promedio entre egreso y titulación | ≤ 2 años | Anual |
| ID26 | Tiempo promedio entre egreso y primer empleo en campo profesional | ≤ 1 año | Anual |
| ID27 | % egresados empleados en campo profesional | ≥ 60% | Anual |
| ID28 | Tasa de graduación | ≥ 50% | Anual |
| ID29 | Tasa de titulación + % empleadores satisfechos con desempeño de egresados | ≥ 40% | Anual |

### 5.6 Campos requeridos por cada indicador en el seeder

Cada uno de los 29 registros debe incluir:
- `codigo` — ID1 a ID29
- `nombre` — Nombre completo oficial
- `tipoDato` — `PORCENTAJE` | `PROMEDIO` | `RAZON`
- `estandarId` — Estándar(es) asociado(s) del modelo CONEAU 2025
- `criterios` — Array JSON de códigos de criterios
- `objetivo` — Descripción del objetivo de medición
- `valorReferencial` — Con operador explícito (ej: `"≥ 60%"`)
- `interpretacion` — Qué significa cumplir o no cumplir el indicador
- `formulaCalculo` — Fórmula matemática con nombres de variables
- `variables` — JSON describiendo cada variable de la fórmula
- `frecuenciaCalculo` — `SEMESTRAL` | `ANUAL` | `BIENAL`
- `fuenteInformacion` — Encuesta, sistema académico, registro, etc.
- `notas` — Aclaraciones adicionales

---

## 6. Fase 3 — Configuración Base

### Archivos a generar

#### `src/lib/prisma.ts`
- Singleton `PrismaClient` para evitar múltiples instancias en desarrollo.

#### `src/lib/auth.ts`
- Auth.js v5 con JWT.
- Roles persistidos en el token y en la sesión.

#### `src/lib/permissions.ts`
- Matriz RBAC completa.

```typescript
const PERMISSIONS = {
  // Indicadores
  'indicador:read':     ['SUPERADMIN', 'VICERRECTOR', 'DECANO', 'COORDINADOR_CALIDAD', 'EVALUADOR_EXTERNO'],
  'indicador:create':   ['SUPERADMIN', 'COORDINADOR_CALIDAD'],
  'indicador:update':   ['SUPERADMIN', 'COORDINADOR_CALIDAD'],
  'indicador:delete':   ['SUPERADMIN'],
  'indicador:calcular': ['SUPERADMIN', 'COORDINADOR_CALIDAD'],
  'indicador:exportar': ['SUPERADMIN', 'VICERRECTOR', 'DECANO', 'COORDINADOR_CALIDAD'],
  // ... resto de permisos del sistema
};
```

#### `src/lib/utils.ts`
- Helpers de formato (`cn`, formatters de fecha, moneda, etc.).
- Funciones para evaluar cumplimiento de indicadores (parsear `"≥ 60%"` → operador + umbral).

#### `src/middleware.ts`
- Protección de rutas por rol.
- Redirección a login si no autenticado.
- Acceso denegado si rol insuficiente.

---

## 7. Fase 4 — Módulo de Indicadores SINEACE

### 7.1 Server Actions — `src/actions/indicador.actions.ts`

#### CRUD de Variables de Entrada

| Action | Descripción |
|---|---|
| `registrarVariable(data)` | Validar Zod → verificar permiso `'indicador:create'` → crear `VariableIndicador` → auditoría |
| `actualizarVariable(id, data)` | Actualizar valor → re-calcular indicadores afectados |
| `listarVariables({ carreraId, indicadorId, periodo })` | Filtros combinados |
| `eliminarVariable(id)` | Soft delete con auditoría |

#### Cálculo Automático de Indicadores

**`calcularIndicador(indicadorId, carreraId, periodo)`**
1. Obtener fórmula del catálogo `IndicadorSineace`.
2. Obtener variables registradas para ese periodo.
3. Ejecutar cálculo según tipo de fórmula:
   - `PORCENTAJE`: `(parte / total) * 100`
   - `PROMEDIO`: `suma(valores) / cantidad`
   - `RAZON`: `parte / total`
4. Comparar con valor referencial (parsear `"≥ 60%"` → operador + umbral).
5. Crear o actualizar `RegistroIndicador`.
6. Si NO cumple → crear `AlertaIndicador`.
7. Retornar resultado con interpretación.

**`calcularTodosIndicadores(carreraId, periodo)`**
- Calcular los 29 indicadores en batch.
- Usar `$transaction` de Prisma.

#### Gestión de Alertas

| Action | Descripción |
|---|---|
| `listarAlertas({ atendida, tipoAlerta, carreraId })` | Dashboard de alertas activas |
| `atenderAlerta(id, observaciones)` | Marcar como atendida + auditoría |

#### Reportes de Indicadores

**`generarReporteIndicadores({ carreraId, periodo, formato })`**
1. Query de todos los `RegistroIndicador` con sus `IndicadorSineace`.
2. Generar tabla comparativa:

| Indicador | Valor Calculado | Valor Referencial | ¿Cumple? | Tendencia vs. periodo anterior |
|---|---|---|---|---|

3. Exportar a PDF (formato oficial) o Excel (análisis).

---

### 7.2 Página Principal — `src/app/(dashboard)/indicadores-sineace/page.tsx`

#### KPIs del panel superior (4 tarjetas)
- Total de indicadores calculados en el periodo activo.
- Indicadores que **CUMPLEN** el valor referencial (🟢).
- Indicadores que **NO CUMPLEN** (🔴 con conteo).
- Alertas pendientes sin atender.

#### Tabla maestra de indicadores
| Columna | Contenido |
|---|---|
| Código | ID1–ID29 |
| Nombre | Nombre completo |
| Estándar | Estándar CONEAU asociado |
| Valor Calculado | Resultado numérico |
| Valor Referencial | Meta oficial |
| Estado | 🟢 Cumple / 🔴 No cumple / ⚪ Sin calcular |

**Filtros disponibles:** por estándar, por estado de cumplimiento, por carrera, por periodo.  
**Acciones por fila:** Ver detalle · Calcular · Ver historial · Registrar variables.

#### Gráfico de cumplimiento por estándar (Recharts)
- **Tipo:** Barras apiladas.
- **Ejes X:** Los 10 estándares del modelo CONEAU 2025.
- **Ejes Y:** Cantidad de indicadores.
- **Capas:** Cumplen (verde) vs. No cumplen (rojo).

---

### 7.3 Página de Detalle — `src/app/(dashboard)/indicadores-sineace/[id]/page.tsx`

**Header:** Código · Nombre · Estándar asociado · Descripción del objetivo.

**Panel de cálculo:**
- Fórmula matemática renderizada.
- Tabla de variables con valores actuales (editables según permisos).
- Botón "Recalcular" (ejecuta Server Action).
- Resultado actual con badge: ✅ Cumple / ❌ No cumple.

**Historial temporal:**
- Gráfico de líneas (Recharts): evolución en los últimos 8 periodos.
- Tabla con valores históricos y tendencia:
  - ↗️ Mejorando
  - ↘️ Empeorando
  - ➡️ Estable

**Alertas asociadas:**
- Listado de alertas generadas por este indicador.
- Estado de atención y responsable.

---

### 7.4 Página de Registro de Variables — `src/app/(dashboard)/indicadores-sineace/variables/page.tsx`

**Formulario dinámico según indicador seleccionado:**
- Carga las variables definidas en el catálogo `IndicadorSineace`.
- Campos numéricos con validación Zod (no negativos, rangos lógicos).
- Campo "Fuente de dato" obligatorio (encuesta · sistema académico · registro manual · etc.).
- Adjunto de evidencia (opcional pero recomendado).

**Tabla de variables registradas:**
- Filtros por periodo y carrera.

---

## 8. Fase 5 — Integración con Dashboard Principal

**Archivo a modificar:** `src/app/(dashboard)/dashboard/page.tsx`

### Nuevos widgets de indicadores

#### Widget 1 — Radar de Cumplimiento SINEACE
- **Tipo:** Gráfico radar (Recharts `RadarChart`).
- **Ejes:** Los 10 estándares del modelo CONEAU 2025.
- **Valor por eje:** % de indicadores del estándar que cumplen el valor referencial.
- **Referencia visual:** Línea del 80% de cumplimiento como meta.

#### Widget 2 — Alertas Críticas de Indicadores
- Carrusel o top 5 alertas más recientes no atendidas.
- Prioridad: `CRITICO` > `BAJO` > `TENDENCIA_NEGATIVA`.
- Link directo al indicador para atención.

#### Widget 3 — Cumplimiento Global por Carrera
- Tabla resumen ordenada por % de cumplimiento **ascendente** (primero las que más necesitan atención).

| Carrera | Indicadores Calculados | % Cumplimiento | Tendencia |
|---|---|---|---|

---

## 9. Fase 6 — Módulo de Gestión de Acreditaciones

**Nuevas integraciones con el módulo de indicadores:**

| Evento | Acción automática |
|---|---|
| Cambio de estado → `AUTOEVALUACION` | Disparar cálculo automático de los 29 indicadores del periodo actual |
| Cambio de estado → `EVALUACION_EXTERNA` | Bloquear edición de variables (modo solo lectura) |

**Nueva pestaña en detalle de acreditación:** "Indicadores SINEACE"
- Tabla con los 29 indicadores calculados para esa carrera.
- Estado de cumplimiento por indicador.

---

## 10. Fase 7 — Módulo de Reportes

### Tipos de reporte

#### Tipo 1 — Operacionales (existente)
#### Tipo 2 — Gestión (existente)

#### Tipo 3 — Reporte Oficial de Indicadores SINEACE (NUEVO)
**Estructura del documento:**
1. Portada UNT
2. Índice
3. Resultados por estándar
4. Análisis de cumplimiento global
5. Plan de mejoras para indicadores deficientes

**Contenido visual:**
- Gráficos de tendencia por indicador.
- Tabla comparativa: valor calculado vs. valor referencial vs. periodo anterior.

**Formatos de exportación:**
- PDF — Formato oficial con membrete institucional UNT.
- Excel — Datos crudos para análisis interno.

---

## 11. Fase 8 — Seeders Completos

**Archivo:** `prisma/seed.ts`

### Datos a incluir

#### A) 29 Indicadores SINEACE 2025 (registros completos)
- Todos los campos del catálogo `IndicadorSineace`.
- Fórmulas con variables definidas.
- Valores referenciales con operador explícito.

#### B) Variables de ejemplo — Periodo 2024-II (Carrera: Medicina Humana)
- Entre 3 y 5 variables registradas por indicador.
- Valores **realistas** que generen una mezcla de:
  - Indicadores que **SÍ cumplen** el valor referencial.
  - Indicadores que **NO cumplen** (para demostrar el sistema de alertas).

#### C) Alertas de ejemplo
| # | Estado | Tipo |
|---|---|---|
| Alerta 1 | Atendida ✅ | CRITICO |
| Alerta 2 | Pendiente ⏳ | BAJO |
| Alerta 3 | Pendiente ⏳ | TENDENCIA_NEGATIVA |

---

## 12. Instrucciones de Output

1. Generar el código completo de **cada fase en bloques markdown separados**.
2. Cada archivo debe incluir: imports · types/interfaces · lógica principal · `export default`.
3. Comentar las partes críticas: validaciones, permisos, transacciones, cálculos de indicadores.
4. Al final de cada fase, incluir el **comando exacto para ejecutarla**.
5. Si una dependencia no es estándar, incluir el comando `npm install` exacto.
6. **NO omitir ningún archivo** — generar TODO el código para que compile sin errores.
7. Para las fórmulas de indicadores, implementar un **parser seguro** que evalúe expresiones matemáticas **sin usar `eval()`**.

---

## 13. Checklist de Validación Final

Antes de entregar, verificar:

- [ ] Los 29 indicadores del Modelo CONEAU 2025 están en el catálogo.
- [ ] Cada indicador tiene su fórmula, variables y valor referencial correctos.
- [ ] El cálculo automático evalúa correctamente el cumplimiento (`≥`, `≤`, `=`).
- [ ] Las alertas se generan **solo** cuando NO se cumple el valor referencial.
- [ ] El dashboard muestra el radar de cumplimiento por estándar.
- [ ] Los reportes incluyen el formato oficial para SINEACE.
- [ ] Todos los Server Actions validan permisos RBAC.
- [ ] Las mutaciones usan transacciones Prisma (`$transaction`).
- [ ] Ninguna clave sensible está hardcodeada.
- [ ] Los tipos TypeScript son estrictos (`sin any`).

---

## 14. Tabla Comparativa

| Aspecto | Versión Anterior | Versión SINEACE 2025 |
|---|---|---|
| **Marco regulatorio** | SINEACE genérico | Modelo CONEAU 2025 específico (Res. 000106-2025) |
| **Estructura del modelo** | No detallada | 10 estándares · 53 criterios · 52 evidencias · 29 indicadores |
| **Módulo de indicadores** | No existía | Módulo completo con catálogo, cálculo automático, alertas, historial |
| **Entidades Prisma** | 10 entidades | 14 entidades (+ `IndicadorSineace`, `RegistroIndicador`, `VariableIndicador`, `AlertaIndicador`) |
| **Seeders** | Datos básicos | 29 indicadores completos con fórmulas, variables, valores referenciales |
| **Dashboard** | KPIs generales | + Radar de cumplimiento SINEACE, alertas críticas, cumplimiento por carrera |
| **Reportes** | Operacionales y de gestión | + Reporte oficial SINEACE con formato regulatorio |
| **Cálculos** | Manuales | Automáticos con parser de fórmulas y evaluación de cumplimiento |
| **Alertas** | Solo vencimientos | + Alertas de indicadores no cumplidos con atención y seguimiento |

---

*Documento generado para el proyecto de Sistema de Gestión de Acreditación — Universidad Nacional de Trujillo (UNT) — basado en el Modelo CONEAU 2025.*
