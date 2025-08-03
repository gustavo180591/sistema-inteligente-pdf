/*
  Warnings:

  - The primary key for the `DocumentoPDF` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fechaProcesado` on the `DocumentoPDF` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `DocumentoPDF` table. All the data in the column will be lost.
  - You are about to drop the column `procesado` on the `DocumentoPDF` table. All the data in the column will be lost.
  - The primary key for the `Persona` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `Persona` table. All the data in the column will be lost.
  - The primary key for the `Transferencia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bancoDestino` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `bancoOrigen` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `cantidadPersonas` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `cuentaDestino` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `cuentaOrigen` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Transferencia` table. All the data in the column will be lost.
  - You are about to drop the `Concepto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Liquidacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiquidacionConcepto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiquidacionPersona` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `estado` to the `DocumentoPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreArchivo` to the `DocumentoPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DocumentoPDF` table without a default value. This is not possible if the table is not empty.
  - Made the column `cbuDestino` on table `Transferencia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cbuOrigen` on table `Transferencia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "LiquidacionConcepto" DROP CONSTRAINT "LiquidacionConcepto_conceptoId_fkey";

-- DropForeignKey
ALTER TABLE "LiquidacionConcepto" DROP CONSTRAINT "LiquidacionConcepto_liquidacionId_fkey";

-- DropForeignKey
ALTER TABLE "LiquidacionConcepto" DROP CONSTRAINT "LiquidacionConcepto_personaId_fkey";

-- DropForeignKey
ALTER TABLE "LiquidacionPersona" DROP CONSTRAINT "LiquidacionPersona_liquidacionId_fkey";

-- DropForeignKey
ALTER TABLE "LiquidacionPersona" DROP CONSTRAINT "LiquidacionPersona_personaId_fkey";

-- DropForeignKey
ALTER TABLE "Transferencia" DROP CONSTRAINT "Transferencia_documentoId_fkey";

-- DropIndex
DROP INDEX "DocumentoPDF_filename_key";

-- DropIndex
DROP INDEX "DocumentoPDF_procesado_idx";

-- DropIndex
DROP INDEX "DocumentoPDF_tipo_idx";

-- DropIndex
DROP INDEX "Persona_documento_idx";

-- DropIndex
DROP INDEX "Persona_nombre_apellido_key";

-- AlterTable
ALTER TABLE "DocumentoPDF" DROP CONSTRAINT "DocumentoPDF_pkey",
DROP COLUMN "fechaProcesado",
DROP COLUMN "filename",
DROP COLUMN "procesado",
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombreArchivo" TEXT NOT NULL,
ADD COLUMN     "url" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DocumentoPDF_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DocumentoPDF_id_seq";

-- AlterTable
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_pkey",
DROP COLUMN "email",
DROP COLUMN "telefono",
ADD COLUMN     "legajos" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Persona_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Persona_id_seq";

-- AlterTable
ALTER TABLE "Transferencia" DROP CONSTRAINT "Transferencia_pkey",
DROP COLUMN "bancoDestino",
DROP COLUMN "bancoOrigen",
DROP COLUMN "cantidadPersonas",
DROP COLUMN "cuentaDestino",
DROP COLUMN "cuentaOrigen",
DROP COLUMN "estado",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "cbuDestino" SET NOT NULL,
ALTER COLUMN "cbuOrigen" SET NOT NULL,
ALTER COLUMN "documentoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Transferencia_id_seq";

-- DropTable
DROP TABLE "Concepto";

-- DropTable
DROP TABLE "Liquidacion";

-- DropTable
DROP TABLE "LiquidacionConcepto";

-- DropTable
DROP TABLE "LiquidacionPersona";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIDEPP" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "detalles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SIDEPP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SIDEPP_documentoId_key" ON "SIDEPP"("documentoId");

-- CreateIndex
CREATE INDEX "DocumentoPDF_userId_idx" ON "DocumentoPDF"("userId");

-- CreateIndex
CREATE INDEX "Persona_apellido_nombre_idx" ON "Persona"("apellido", "nombre");

-- AddForeignKey
ALTER TABLE "DocumentoPDF" ADD CONSTRAINT "DocumentoPDF_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "DocumentoPDF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SIDEPP" ADD CONSTRAINT "SIDEPP_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "DocumentoPDF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
