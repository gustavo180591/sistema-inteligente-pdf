// src/lib/pdf/PDFProcessor.js
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../db/prisma-client.js';
import { extractTextFromPDF } from './utils.js';

const execAsync = promisify(exec);

export class PDFProcessor {
  constructor() {
    this.processors = {
      'LISTADO': new ListadoSIDEPPProcessor(),
      'TRANSFERENCIA': new TransferenciaProcessor()
    };
  }

  async processFile(filePath, originalFilename) {
    try {
      // Verificar si ya fue procesado
      const existingDoc = await prisma.documentoPDF.findUnique({
        where: { filename: originalFilename }
      });

      if (existingDoc?.procesado) {
        console.log(`El archivo ${originalFilename} ya fue procesado anteriormente.`);
        return { success: true, message: 'Archivo ya procesado', docId: existingDoc.id };
      }

      // Extraer texto del PDF
      const text = await extractTextFromPDF(filePath);
      
      // Detectar tipo de documento
      const docType = this.detectarTipoDocumento(text);
      
      // Procesar según el tipo
      const processor = this.processors[docType] || this.processors['LISTADO']; // Default a LISTADO
      
      // Registrar documento en la base de datos
      const doc = await prisma.documentoPDF.create({
        data: {
          filename: originalFilename,
          tipo: docType,
          contenido: text.substring(0, 1000), // Guardar solo los primeros 1000 caracteres
          procesado: false
        }
      });

      // Procesar el documento
      const result = await processor.process(text, filePath, doc.id);
      
      // Marcar como procesado
      await prisma.documentoPDF.update({
        where: { id: doc.id },
        data: { 
          procesado: true,
          fechaProcesado: new Date(),
          personaId: result.personaId
        }
      });

      return { 
        success: true, 
        message: `Documento procesado como ${docType}`, 
        docId: doc.id,
        type: docType,
        data: result
      };
    } catch (error) {
      console.error('Error procesando archivo:', error);
      
      // Registrar error en la base de datos
      if (originalFilename) {
        await prisma.documentoPDF.upsert({
          where: { filename: originalFilename },
          update: { 
            error: error.message,
            procesado: false
          },
          create: {
            filename: originalFilename,
            tipo: 'ERROR',
            error: error.message,
            procesado: false
          }
        });
      }
      
      return { 
        success: false, 
        message: `Error procesando archivo: ${error.message}` 
      };
    }
  }

  detectarTipoDocumento(text) {
    const contenido = text.toUpperCase();
    
    if (contenido.includes('TRANSFERENCIA') || 
        contenido.includes('BANCO') || 
        contenido.includes('CBU') ||
        contenido.includes('IMPORTE') ||
        contenido.includes('CUENTA')) {
      return 'TRANSFERENCIA';
    }

    if (contenido.includes('LIQUIDACION') || 
        contenido.includes('LEGAJO') || 
        contenido.includes('APELLIDO') ||
        contenido.includes('NOMBRE') ||
        contenido.includes('CONCEPTO') ||
        contenido.includes('HABER') ||
        contenido.includes('DESCUENTO')) {
      return 'LISTADO';
    }

    return 'DESCONOCIDO';
  }
}