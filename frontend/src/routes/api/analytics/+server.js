import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ url }) {
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  const where = {};
  if (startDate || endDate) {
    where.fechaCarga = {};
    if (startDate) where.fechaCarga.gte = new Date(startDate);
    if (endDate) where.fechaCarga.lte = new Date(endDate);
  }

  const [transferencias, sidepp, otros] = await Promise.all([
    prisma.documentoPDF.count({
      where: { ...where, tipo: 'TRANSFERENCIA' }
    }),
    prisma.documentoPDF.count({
      where: { ...where, tipo: 'SIDEPP' }
    }),
    prisma.documentoPDF.count({
      where: {
        ...where,
        tipo: { notIn: ['TRANSFERENCIA', 'SIDEPP'] }
      }
    })
  ]);

  return json({
    labels: ['Transferencias', 'SIDEPP', 'Otros'],
    datasets: [{
      label: 'Documentos',
      data: [transferencias, sidepp, otros],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(249, 115, 22, 0.7)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(249, 115, 22)'
      ],
      borderWidth: 1
    }]
  });
}