-- CreateTable
CREATE TABLE "public"."Escuela" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "cuit" TEXT NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Persona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "legajos" INTEGER,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Concepto" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION,

    CONSTRAINT "Concepto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Liquidacion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "escuelaId" INTEGER NOT NULL,
    "conceptoId" INTEGER NOT NULL,
    "totalPersonas" INTEGER NOT NULL,
    "totalMonto" DOUBLE PRECISION NOT NULL,
    "totalRemunerativo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Liquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LiquidacionPersona" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LiquidacionPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transferencia" (
    "id" SERIAL NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "bancoOrigen" TEXT NOT NULL,
    "bancoDestino" TEXT NOT NULL,
    "titularDestino" TEXT NOT NULL,
    "cuitOrigen" TEXT NOT NULL,
    "cuitDestino" TEXT NOT NULL,
    "cbuDestino" TEXT NOT NULL,
    "cuentaOrigen" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "nroOperacion" TEXT NOT NULL,

    CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Escuela_cuit_key" ON "public"."Escuela"("cuit");

-- AddForeignKey
ALTER TABLE "public"."Liquidacion" ADD CONSTRAINT "Liquidacion_escuelaId_fkey" FOREIGN KEY ("escuelaId") REFERENCES "public"."Escuela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Liquidacion" ADD CONSTRAINT "Liquidacion_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "public"."Concepto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiquidacionPersona" ADD CONSTRAINT "LiquidacionPersona_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "public"."Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiquidacionPersona" ADD CONSTRAINT "LiquidacionPersona_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "public"."Liquidacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
