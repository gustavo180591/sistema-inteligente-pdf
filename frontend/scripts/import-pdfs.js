import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uploadsDir = path.join(process.cwd(), '..', 'frontend', 'uploads');

async function extractText(filePath) {
  try {
    console.log(`📄 Procesando: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    
    // Intentar extraer texto directamente
    try {
      const data = await pdf(buffer);
      if (data.text.trim()) return data.text;
    } catch (err) {
      console.log(`⚠️  No se pudo extraer texto directamente de ${filePath}: ${err.message}`);
    }

    // Si no hay texto, usar OCR
    console.log(`🔍 Usando OCR para ${filePath}...`);
    const { data: { text } } = await Tesseract.recognize(buffer, 'spa');
    return text;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    throw error;
  }
}

async function processPDF(filePath) {
  try {
    const text = await extractText(filePath);
    
    // Extraer información del PDF usando expresiones regulares
    const documento = text.match(/\d{2}\.\d{3}\.\d{3}/)?.[0] || 'DESCONOCIDO';
    const nombre = text.match(/[A-Z][a-z]+,\s+[A-Z][a-z]+/)?.[0] || 'SIN NOMBRE';
    
    // Crear documento en la base de datos
    await prisma.document.create({
      data: {
        filename: path.basename(filePath),
        documentNumber: documento,
        name: nombre,
        content: text.substring(0, 1000),
        fullContent: text,
        processedAt: new Date()
      }
    });

    // Crear persona asociada al documento
    const [apellido, ...nombres] = nombre.split(',').map(s => s.trim());
    const nombreCompleto = nombres.join(' ');
    
    await prisma.persona.upsert({
      where: { documento },
      update: {},
      create: {
        documento,
        nombre: nombreCompleto || 'Desconocido',
        apellido: apellido || 'Desconocido'
      }
    });
    
    console.log(`✅ Procesado e insertado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    // Verificar si el directorio existe
    if (!fs.existsSync(uploadsDir)) {
      console.error(`❌ El directorio ${uploadsDir} no existe`);
      return;
    }

    // Leer archivos PDF del directorio
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(uploadsDir, file));

    if (files.length === 0) {
      console.log('ℹ️  No se encontraron archivos PDF en el directorio uploads');
      return;
    }

    console.log(`🔍 Encontrados ${files.length} archivos PDF para procesar`);
    
    // Procesar cada archivo secuencialmente
    for (const file of files) {
      await processPDF(file);
    }
    
    console.log('🚀 Todos los PDFs fueron procesados exitosamente');
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Iniciar el proceso
main().catch(console.error);
