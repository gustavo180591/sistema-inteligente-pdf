// frontend/src/lib/pdf/processors/base.js
import { prisma } from '$lib/server/prisma';

export class PDFProcessor {
  constructor() {
    this.type = 'BASE';
  }

  async canProcess(text) {
    return false;
  }

  async process(filePath) {
    throw new Error('Método process() debe ser implementado por las clases hijas');
  }

  async markAsProcessed(filename, metadata = {}) {
    return prisma.documentoPDF.create({
      data: {
        filename,
        tipo: this.type,
        procesado: true,
        fechaProcesado: new Date(),
        metadata
      }
    });
  }
}