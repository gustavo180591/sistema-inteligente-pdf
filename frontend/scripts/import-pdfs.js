import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uploadsDir = path.join(process.cwd(), 'uploads');

async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Intentar extraer texto directamente
  try {
    const data = await pdf(buffer);
    if (data.text.trim()) return data.text;
  } catch (err) {
    console.log(`Error leyendo ${filePath} como texto: ${err.message}`);
  }

  // Si no hay texto, usar OCR
  console.log(`Usando OCR para ${filePath}...`);
  const { data: { text } } = await Tesseract.recognize(buffer, 'spa');
  return text;
}

async function processPDF(filePath) {
  const text = await extractText(filePath);

  // TODO: Adaptar regex según tus PDFs
  const documento = text.match(/\d{2}\.\d{3}\.\d{3}/)?.[0] || 'DESCONOCIDO';
  const nombre = text.match(/[A-Z][a-z]+,\s+[A-Z][a-z]+/)?.[0] || 'SIN NOMBRE';

  // Insertar ejemplo en tabla Persona
  await prisma.persona.create({
    data: {
      nombre: nombre.split(',')[1]?.trim() || 'Desconocido',
      apellido: nombre.split(',')[0]?.trim() || 'Desconocido',
    },
  });

  console.log(`✅ Procesado e insertado: ${filePath}`);
}

async function main() {
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
  for (const file of files) {
    await processPDF(path.join(uploadsDir, file));
  }
  console.log('🚀 Todos los PDFs fueron procesados');
}

main().catch(console.error).finally(() => prisma.$disconnect());
