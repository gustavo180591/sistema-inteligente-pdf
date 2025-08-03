import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inicialización de la base de datos...');

  // Crear conceptos por defecto si no existen
  const conceptos = [
    { codigo: 'HABER', descripcion: 'Haber Básico', tipo: 'HABER' },
    { codigo: 'ANTIG', descripcion: 'Antigüedad', tipo: 'HABER' },
    { codigo: 'TITULO', descripcion: 'Título Docente', tipo: 'HABER' },
    { codigo: 'JERARQ', descripcion: 'Jerarquía', tipo: 'HABER' },
    { codigo: 'JORNADA', descripcion: 'Jornada Completa', tipo: 'HABER' },
    { codigo: 'APORTE', descripcion: 'Aporte Jubilatorio', tipo: 'DESCUENTO' },
    { codigo: 'OBRA_SOC', descripcion: 'Obra Social', tipo: 'DESCUENTO' },
    { codigo: 'SINDICATO', descripcion: 'Aporte Sindical', tipo: 'DESCUENTO' },
  ];

  for (const concepto of conceptos) {
    await prisma.concepto.upsert({
      where: { codigo: concepto.codigo },
      update: {},
      create: concepto,
    });
  }

  console.log('Base de datos inicializada correctamente');
}

main()
  .catch((e) => {
    console.error('Error durante la inicialización:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
