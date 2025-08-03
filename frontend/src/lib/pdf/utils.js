// src/lib/pdf/utils.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function extractTextFromPDF(filePath) {
  try {
    // Usar pdftotext para extraer texto
    const tempFile = path.join(path.dirname(filePath), `temp_${Date.now()}.txt`);
    
    await execAsync(`pdftotext -layout "${filePath}" "${tempFile}"`);
    const text = await fs.readFile(tempFile, 'utf8');
    await fs.unlink(tempFile).catch(() => {});
    
    return text;
  } catch (error) {
    console.error('Error extrayendo texto del PDF:', error);
    throw new Error('No se pudo extraer texto del PDF');
  }
}

export function normalizeText(text) {
  if (!text) return '';
  
  // Normalizar espacios, saltos de línea y caracteres especiales
  return text
    .replace(/\r\n/g, '\n')      // Normalizar saltos de línea
    .replace(/\s+/g, ' ')        // Eliminar espacios múltiples
    .replace(/\u00A0/g, ' ')     // Reemplazar espacios duros
    .replace(/[^\S\n]+/g, ' ')   // Eliminar espacios duplicados
    .trim();
}