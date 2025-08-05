// src/lib/pdf/PDFProcessor.js
import { extractTextFromPDF } from './utils.js';

export class PDFProcessor {
  constructor() {
    // Por ahora, no inicializar procesadores específicos
    this.processors = {};
  }

  /**
   * Procesa un archivo PDF
   * @param {string} filePath - Ruta al archivo PDF
   * @param {string} originalFilename - Nombre original del archivo
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processFile(filePath, originalFilename) {
    try {
      // Extraer texto del PDF
      const text = await extractTextFromPDF(filePath);
      
      // Detectar tipo de documento
      const docType = this.detectarTipoDocumento(text);
      
      // Por ahora, solo retornar información básica
      return { 
        success: true, 
        message: `Documento procesado como ${docType}`, 
        docId: `doc_${Date.now()}`,
        type: docType,
        data: {
          text: text.substring(0, 500),
          filename: originalFilename,
          processedAt: new Date().toISOString()
        }
      };
    } catch (/** @type {any} */ error) {
      console.error('Error procesando archivo:', error);
      
      return { 
        success: false, 
        message: `Error procesando archivo: ${error?.message || 'Error desconocido'}` 
      };
    }
  }

  /**
   * Detecta el tipo de documento basado en su contenido
   * @param {string} text - Texto extraído del PDF
   * @returns {string} Tipo de documento detectado
   */
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