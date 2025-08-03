// frontend/src/lib/pdf/index.js
import { ListadoProcessor } from './processors/listado.js';
import { TransferProcessor } from './processors/transfer.js';

const processors = [
  new ListadoProcessor(),
  new TransferProcessor() // Implementar similar a ListadoProcessor
];

export async function processPDF(filePath) {
  // Leer el texto del PDF
  const text = await extractTextFromPDF(filePath);
  
  // Encontrar el procesador adecuado
  for (const processor of processors) {
    if (await processor.canProcess(text)) {
      return processor.process(filePath);
    }
  }
  
  throw new Error('Tipo de PDF no soportado');
}

async function extractTextFromPDF(filePath) {
  // Implementar con pdf-parse o similar
  const { default: pdfParse } = await import('pdf-parse');
  const data = await pdfParse(filePath);
  return data.text;
}