-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'VICERRECTOR', 'DECANO', 'COORDINADOR_CALIDAD', 'EVALUADOR_EXTERNO');

-- CreateEnum
CREATE TYPE "EstadoAcreditacion" AS ENUM ('SOLICITUD', 'AUTOEVALUACION', 'EVALUACION_EXTERNA', 'CONDICIONAMIENTOS', 'RESOLUCION', 'ACREDITADA', 'NO_ACREDITADA', 'RENOVACION');

-- CreateEnum
CREATE TYPE "EstadoCondicionamiento" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'CUMPLIDO', 'NO_CUMPLIDO');

-- CreateEnum
CREATE TYPE "AccionAuditoria" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "TipoDato" AS ENUM ('PORCENTAJE', 'PROMEDIO', 'RAZON');

-- CreateEnum
CREATE TYPE "FrecuenciaCalculo" AS ENUM ('SEMESTRAL', 'ANUAL', 'BIENAL');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('BAJO', 'CRITICO', 'TENDENCIA_NEGATIVA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facultades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "decanoId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "facultades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carreras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "facultadId" TEXT NOT NULL,
    "coordinadorId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "carreras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acreditaciones" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "estado" "EstadoAcreditacion" NOT NULL DEFAULT 'SOLICITUD',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "resultado" TEXT,
    "observaciones" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acreditaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL,
    "acreditacionId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "subidoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estandares_sineace" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estandares_sineace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autoevaluaciones" (
    "id" TEXT NOT NULL,
    "acreditacionId" TEXT NOT NULL,
    "estandarSineaceId" TEXT NOT NULL,
    "puntaje" DECIMAL(5,2) NOT NULL,
    "observaciones" TEXT,
    "evaluadorId" TEXT NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autoevaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_externas" (
    "id" TEXT NOT NULL,
    "acreditacionId" TEXT NOT NULL,
    "fechaVisita" TIMESTAMP(3) NOT NULL,
    "evaluadores" JSONB NOT NULL,
    "informeUrl" TEXT,
    "observaciones" TEXT,
    "resultado" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_externas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condicionamientos" (
    "id" TEXT NOT NULL,
    "acreditacionId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "plazoDias" INTEGER NOT NULL,
    "fechaCumplimiento" TIMESTAMP(3),
    "estado" "EstadoCondicionamiento" NOT NULL DEFAULT 'PENDIENTE',
    "verificadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condicionamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "accion" "AccionAuditoria" NOT NULL,
    "campo" TEXT,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "usuarioId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicadores_sineace" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDato" "TipoDato" NOT NULL,
    "estandarId" TEXT NOT NULL,
    "criterios" JSONB NOT NULL,
    "objetivo" TEXT NOT NULL,
    "valorReferencial" TEXT NOT NULL,
    "interpretacion" TEXT NOT NULL,
    "fuenteInformacion" TEXT NOT NULL,
    "frecuenciaCalculo" "FrecuenciaCalculo" NOT NULL,
    "formulaCalculo" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "indicadores_sineace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_indicadores" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "valorCalculado" DECIMAL(10,4) NOT NULL,
    "valorReferencial" TEXT NOT NULL,
    "cumpleReferencial" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "variablesUtilizadas" JSONB NOT NULL,
    "calculadoPorId" TEXT NOT NULL,
    "fechaCalculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "evidenciaUrl" TEXT,

    CONSTRAINT "registros_indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variables_indicadores" (
    "id" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "nombreVariable" TEXT NOT NULL,
    "valorNumerico" DECIMAL(10,4) NOT NULL,
    "fuenteDato" TEXT NOT NULL,
    "verificadoPorId" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variables_indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_indicadores" (
    "id" TEXT NOT NULL,
    "registroIndicadorId" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "tipoAlerta" "TipoAlerta" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendida" BOOLEAN NOT NULL DEFAULT false,
    "atendidaPorId" TEXT,
    "fechaAtencion" TIMESTAMP(3),
    "observacionAtencion" TEXT,

    CONSTRAINT "alertas_indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "facultades_codigo_key" ON "facultades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "carreras_codigo_key" ON "carreras"("codigo");

-- CreateIndex
CREATE INDEX "acreditaciones_carreraId_estado_idx" ON "acreditaciones"("carreraId", "estado");

-- CreateIndex
CREATE INDEX "acreditaciones_fechaVencimiento_idx" ON "acreditaciones"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "evidencias_acreditacionId_idx" ON "evidencias"("acreditacionId");

-- CreateIndex
CREATE UNIQUE INDEX "estandares_sineace_codigo_key" ON "estandares_sineace"("codigo");

-- CreateIndex
CREATE INDEX "auditorias_fecha_idx" ON "auditorias"("fecha" DESC);

-- CreateIndex
CREATE INDEX "auditorias_tabla_registroId_idx" ON "auditorias"("tabla", "registroId");

-- CreateIndex
CREATE UNIQUE INDEX "indicadores_sineace_codigo_key" ON "indicadores_sineace"("codigo");

-- CreateIndex
CREATE INDEX "indicadores_sineace_estandarId_idx" ON "indicadores_sineace"("estandarId");

-- CreateIndex
CREATE UNIQUE INDEX "registros_indicadores_carreraId_indicadorId_periodo_key" ON "registros_indicadores"("carreraId", "indicadorId", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "variables_indicadores_carreraId_indicadorId_periodo_nombreV_key" ON "variables_indicadores"("carreraId", "indicadorId", "periodo", "nombreVariable");

-- CreateIndex
CREATE INDEX "alertas_indicadores_atendida_fechaGeneracion_idx" ON "alertas_indicadores"("atendida", "fechaGeneracion");

-- CreateIndex
CREATE INDEX "alertas_indicadores_indicadorId_idx" ON "alertas_indicadores"("indicadorId");

-- AddForeignKey
ALTER TABLE "facultades" ADD CONSTRAINT "facultades_decanoId_fkey" FOREIGN KEY ("decanoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carreras" ADD CONSTRAINT "carreras_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "facultades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carreras" ADD CONSTRAINT "carreras_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acreditaciones" ADD CONSTRAINT "acreditaciones_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acreditaciones" ADD CONSTRAINT "acreditaciones_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_acreditacionId_fkey" FOREIGN KEY ("acreditacionId") REFERENCES "acreditaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoevaluaciones" ADD CONSTRAINT "autoevaluaciones_acreditacionId_fkey" FOREIGN KEY ("acreditacionId") REFERENCES "acreditaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoevaluaciones" ADD CONSTRAINT "autoevaluaciones_estandarSineaceId_fkey" FOREIGN KEY ("estandarSineaceId") REFERENCES "estandares_sineace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoevaluaciones" ADD CONSTRAINT "autoevaluaciones_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_externas" ADD CONSTRAINT "evaluaciones_externas_acreditacionId_fkey" FOREIGN KEY ("acreditacionId") REFERENCES "acreditaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_externas" ADD CONSTRAINT "evaluaciones_externas_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicionamientos" ADD CONSTRAINT "condicionamientos_acreditacionId_fkey" FOREIGN KEY ("acreditacionId") REFERENCES "acreditaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicionamientos" ADD CONSTRAINT "condicionamientos_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicadores_sineace" ADD CONSTRAINT "indicadores_sineace_estandarId_fkey" FOREIGN KEY ("estandarId") REFERENCES "estandares_sineace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_indicadores" ADD CONSTRAINT "registros_indicadores_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_indicadores" ADD CONSTRAINT "registros_indicadores_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "indicadores_sineace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_indicadores" ADD CONSTRAINT "registros_indicadores_calculadoPorId_fkey" FOREIGN KEY ("calculadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables_indicadores" ADD CONSTRAINT "variables_indicadores_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables_indicadores" ADD CONSTRAINT "variables_indicadores_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "indicadores_sineace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables_indicadores" ADD CONSTRAINT "variables_indicadores_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_indicadores" ADD CONSTRAINT "alertas_indicadores_registroIndicadorId_fkey" FOREIGN KEY ("registroIndicadorId") REFERENCES "registros_indicadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_indicadores" ADD CONSTRAINT "alertas_indicadores_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "indicadores_sineace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_indicadores" ADD CONSTRAINT "alertas_indicadores_atendidaPorId_fkey" FOREIGN KEY ("atendidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
