/*
  Warnings:

  - You are about to drop the column `fechaResolucion` on the `acreditaciones` table. All the data in the column will be lost.
  - You are about to drop the column `fechaSolicitud` on the `acreditaciones` table. All the data in the column will be lost.
  - You are about to drop the column `fechaVencimiento` on the `acreditaciones` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "acreditaciones_fechaVencimiento_idx";

-- AlterTable
ALTER TABLE "acreditaciones" DROP COLUMN "fechaResolucion",
DROP COLUMN "fechaSolicitud",
DROP COLUMN "fechaVencimiento",
ADD COLUMN     "entidadAcreditadora" TEXT NOT NULL DEFAULT 'SINEACE',
ADD COLUMN     "fechaFinEstimada" TIMESTAMP(3),
ADD COLUMN     "fechaFinReal" TIMESTAMP(3),
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modelo" TEXT NOT NULL DEFAULT 'Modelo CONEAU 2025';

-- CreateIndex
CREATE INDEX "acreditaciones_fechaFinEstimada_idx" ON "acreditaciones"("fechaFinEstimada");
