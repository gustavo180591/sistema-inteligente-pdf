/*
  Warnings:

  - You are about to drop the column `porcentaje` on the `Concepto` table. All the data in the column will be lost.
  - You are about to drop the column `conceptoId` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `escuelaId` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `totalMonto` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `totalPersonas` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `totalRemunerativo` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to alter the column `monto` on the `LiquidacionPersona` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `legajos` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `cuitDestino` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `cuitOrigen` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `fechaHora` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `importe` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `nroOperacion` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `titularDestino` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the `Escuela` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Concepto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personaId,liquidacionId]` on the table `LiquidacionPersona` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documento]` on the table `Persona` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,apellido]` on the table `Persona` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentoId]` on the table `Transferencia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Concepto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Concepto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Concepto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidadPersonas` to the `Transferencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentoId` to the `Transferencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaOperacion` to the `Transferencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoTotal` to the `Transferencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transferencia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Liquidacion" DROP CONSTRAINT "Liquidacion_conceptoId_fkey";

-- DropForeignKey
ALTER TABLE "Liquidacion" DROP CONSTRAINT "Liquidacion_escuelaId_fkey";

-- AlterTable
ALTER TABLE "Concepto" DROP COLUMN "porcentaje",
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Liquidacion" DROP COLUMN "conceptoId",
DROP COLUMN "escuelaId",
DROP COLUMN "totalMonto",
DROP COLUMN "totalPersonas",
DROP COLUMN "totalRemunerativo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "periodo" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LiquidacionPersona" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detalles" JSONB,
ALTER COLUMN "monto" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Persona" DROP COLUMN "legajos",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documento" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transferencia" DROP COLUMN "cuitDestino",
DROP COLUMN "cuitOrigen",
DROP COLUMN "fechaHora",
DROP COLUMN "importe",
DROP COLUMN "nroOperacion",
DROP COLUMN "titularDestino",
ADD COLUMN     "cantidadPersonas" INTEGER NOT NULL,
ADD COLUMN     "cbuOrigen" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cuentaDestino" TEXT,
ADD COLUMN     "detalles" JSONB,
ADD COLUMN     "documentoId" INTEGER NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "fechaOperacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "montoTotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "bancoOrigen" DROP NOT NULL,
ALTER COLUMN "bancoDestino" DROP NOT NULL,
ALTER COLUMN "cbuDestino" DROP NOT NULL,
ALTER COLUMN "cuentaOrigen" DROP NOT NULL;

-- DropTable
DROP TABLE "Escuela";

-- CreateTable
CREATE TABLE "DocumentoPDF" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "fechaProcesado" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoPDF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidacionConcepto" (
    "id" SERIAL NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "conceptoId" INTEGER NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "cantidad" DECIMAL(65,30) DEFAULT 1,
    "importe" DECIMAL(65,30) NOT NULL,
    "detalles" JSONB,
    "personaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiquidacionConcepto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoPDF_filename_key" ON "DocumentoPDF"("filename");

-- CreateIndex
CREATE INDEX "DocumentoPDF_tipo_idx" ON "DocumentoPDF"("tipo");

-- CreateIndex
CREATE INDEX "DocumentoPDF_procesado_idx" ON "DocumentoPDF"("procesado");

-- CreateIndex
CREATE UNIQUE INDEX "LiquidacionConcepto_liquidacionId_conceptoId_personaId_key" ON "LiquidacionConcepto"("liquidacionId", "conceptoId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Concepto_codigo_key" ON "Concepto"("codigo");

-- CreateIndex
CREATE INDEX "Liquidacion_tipo_idx" ON "Liquidacion"("tipo");

-- CreateIndex
CREATE INDEX "Liquidacion_periodo_idx" ON "Liquidacion"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "LiquidacionPersona_personaId_liquidacionId_key" ON "LiquidacionPersona"("personaId", "liquidacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_documento_key" ON "Persona"("documento");

-- CreateIndex
CREATE INDEX "Persona_documento_idx" ON "Persona"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_nombre_apellido_key" ON "Persona"("nombre", "apellido");

-- CreateIndex
CREATE UNIQUE INDEX "Transferencia_documentoId_key" ON "Transferencia"("documentoId");

-- AddForeignKey
ALTER TABLE "LiquidacionConcepto" ADD CONSTRAINT "LiquidacionConcepto_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "Liquidacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionConcepto" ADD CONSTRAINT "LiquidacionConcepto_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "Concepto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionConcepto" ADD CONSTRAINT "LiquidacionConcepto_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "DocumentoPDF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
