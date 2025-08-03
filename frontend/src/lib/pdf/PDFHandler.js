// frontend/src/lib/pdf/PDFHandler.js
import { ListadoSIDEPPProcessor } from './processors/ListadoSIDEPPProcessor.js';
import { TransferenciaProcessor } from './processors/TransferenciaProcessor.js';
import { PDFProcessor } from './processors/base.js';

/**
 * Manejador principal para el procesamiento de PDFs
 */
export class PDFHandler {
  /**
   * Crea una nueva instancia del manejador de PDFs
   * @param {Object} options - Opciones de configuración
   * @param {Object} options.prisma - Instancia de Prisma Client
   * @param {string} options.uploadsDir - Directorio para almacenar archivos subidos
   */
  constructor({ prisma, uploadsDir } = {}) {
    if (!prisma) {
      throw new Error('Se requiere una instancia de Prisma Client');
    }
    
    this.prisma = prisma;
    this.uploadsDir = uploadsDir || './uploads';
    
    // Inicializar procesadores con las dependencias necesarias
    this.processors = [
      new ListadoSIDEPPProcessor({ prisma }),
      new TransferenciaProcessor({ prisma })
    ];
    
    // Asegurar que los procesadores hereden correctamente de PDFProcessor
    this.processors.forEach(processor => {
      if (!(processor instanceof PDFProcessor)) {
        throw new Error(`El procesador ${processor.constructor.name} debe heredar de PDFProcessor`);
      }
    });
  }

  /**
   * Identifica el tipo de documento y devuelve el procesador adecuado
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<PDFProcessor>} Procesador adecuado para el documento
   */
  /**
   * Identifica el tipo de documento y devuelve el procesador adecuado
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<PDFProcessor>} Procesador adecuado para el documento
   * @throws {Error} Si no se encuentra un procesador compatible
   */
  async identifyDocumentType(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('El texto proporcionado no es válido');
    }
    
    for (const processor of this.processors) {
      try {
        const canProcess = await processor.canProcess(text);
        if (canProcess) {
          return processor;
        }
      } catch (error) {
        console.warn(`Error al verificar el procesador ${processor.constructor.name}:`, error);
        continue;
      }
    }
    
    throw new Error('Tipo de documento no soportado');
  }

  /**
   * Procesa un archivo PDF
   * @param {string} filePath - Ruta al archivo PDF
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  /**
   * Procesa un archivo PDF
   * @param {string|Buffer} file - Ruta al archivo o buffer del PDF
   * @param {Object} options - Opciones adicionales
   * @param {string} [options.originalName] - Nombre original del archivo
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processPDF(file, { originalName } = {}) {
    let filePath = typeof file === 'string' ? file : null;
    
    try {
      // 1. Si es un buffer, guardar temporalmente
      if (Buffer.isBuffer(file)) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const { v4: uuidv4 } = await import('uuid');
        
        const fileName = originalName || `${uuidv4()}.pdf`;
        filePath = path.join(this.uploadsDir, fileName);
        
        await fs.mkdir(this.uploadsDir, { recursive: true });
        await fs.writeFile(filePath, file);
      }
      
      // 2. Extraer texto del PDF
      const text = await this.extractTextFromPDF(filePath);
      
      // 3. Identificar tipo de documento
      const processor = await this.identifyDocumentType(text);
      
      // 4. Procesar con el procesador específico
      const result = await processor.process(text, filePath);
      
      // 5. Marcar como procesado en la base de datos
      await processor.markAsProcessed(
        originalName || path.basename(filePath),
        { 
          type: processor.type,
          processedAt: new Date().toISOString()
        }
      );
      
      return {
        success: true,
        type: processor.type,
        data: result,
        metadata: {
          fileName: originalName || path.basename(filePath),
          processedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error procesando PDF:', error);
      
      // Registrar el error en la base de datos si es posible
      if (this.prisma) {
        try {
          await this.prisma.processingError.create({
            data: {
              fileName: originalName || (filePath ? path.basename(filePath) : 'unknown'),
              error: error.message,
              stack: error.stack,
              metadata: {
                type: error.name,
                code: error.code
              }
            }
          });
        } catch (dbError) {
          console.error('Error al registrar el error en la base de datos:', dbError);
        }
      }
      
      return {
        success: false,
        error: error.message,
        type: 'PROCESSING_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        file: originalName || filePath
      };
      
    } finally {
      // Limpiar archivo temporal si fue creado
      if (filePath && filePath !== file && this.uploadsDir) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.error('Error al limpiar archivo temporal:', cleanupError);
        }
      }
    }
  }

  /**
   * Extrae texto de un archivo PDF
   * @private
   */
  /**
   * Extrae texto de un archivo PDF
   * @private
   * @param {string} filePath - Ruta al archivo PDF
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromPDF(filePath) {
    const fs = await import('fs/promises');
    const { default: pdf } = await import('pdf-parse');
    
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      throw new Error(`No se pudo extraer texto del PDF: ${error.message}`);
    }
  }
  
  /**
   * Procesa múltiples archivos PDF en paralelo
   * @param {Array<string|Buffer>} files - Lista de rutas o buffers de PDFs
   * @param {Object} options - Opciones de procesamiento
   * @param {number} [options.concurrency=3] - Número máximo de archivos a procesar en paralelo
   * @returns {Promise<Array<Object>>} Resultados del procesamiento
   */
  async processMultiplePDFs(files, { concurrency = 3 } = {}) {
    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(concurrency);
    
    const processFile = async (file, index) => {
      try {
        const result = await this.processPDF(file, { originalName: `file_${index + 1}.pdf` });
        return { ...result, index };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          index,
          type: 'PROCESSING_ERROR'
        };
      }
    };
    
    const tasks = files.map((file, index) => 
      limit(() => processFile(file, index))
    );
    
    return Promise.all(tasks);
  }
}
