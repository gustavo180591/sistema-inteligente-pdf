// scripts/process-pdfs.js
import { processPDF } from '../src/lib/pdf/index.js';
import { prisma } from '@prisma/client';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv para cargar variables de entorno
import 'dotenv/config';

const UPLOADS_DIR = join(__dirname, '../uploads');

async function processPendingPDFs() {
  try {
    // Obtener archivos en el directorio de uploads
    const files = (await readdir(UPLOADS_DIR))
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(f => join(UPLOADS_DIR, f));

    // Verificar si ya fueron procesados
    const processedFiles = new Set(
      (await prisma.documentoPDF.findMany({
        where: { procesado: true },
        select: { filename: true }
      })).map(doc => join(UPLOADS_DIR, doc.filename))
    );

    const pendingFiles = files.filter(f => !processedFiles.has(f));

    console.log(`Encontrados ${pendingFiles.length} archivos por procesar`);

    // Procesar cada archivo pendiente
    for (const file of pendingFiles) {
      try {
        console.log(`Procesando: ${file}`);
        const result = await processPDF(file);
        console.log(`Procesado: ${file}`, result);
      } catch (error) {
        console.error(`Error procesando ${file}:`, error.message);
      }
    }

    console.log('Proceso completado');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
    process.exit(1);
  }
}

processPendingPDFs();