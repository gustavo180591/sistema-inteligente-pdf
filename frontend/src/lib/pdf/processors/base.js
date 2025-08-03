// frontend/src/lib/pdf/processors/base.js
import { prisma } from '$lib/server/prisma';
import { ValidationError } from './errors';

export class PDFProcessor {
  constructor() {
    this.type = 'BASE';
    this.requiredFields = [];
  }

  /**
   * Verifica si este procesador puede manejar el documento
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<boolean>}
   */
  async canProcess(text) {
    try {
      return await this.validateDocumentStructure(text);
    } catch (error) {
      console.error('Error en validación de estructura:', error);
      return false;
    }
  }

  /**
   * Valida la estructura básica del documento
   * @param {string} text - Texto del PDF
   * @returns {Promise<boolean>}
   */
  async validateDocumentStructure(text) {
    if (!text || typeof text !== 'string') {
      throw new ValidationError('El texto proporcionado no es válido');
    }
    
    // Verificar que el texto contenga los campos requeridos
    for (const field of this.requiredFields) {
      if (!text.includes(field)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Procesa el documento y extrae la información estructurada
   * @param {string} text - Texto del PDF
   * @param {string} filePath - Ruta al archivo
   * @returns {Promise<Object>} Datos extraídos
   */
  async process(text, filePath) {
    throw new Error('Método process() debe ser implementado por las clases hijas');
  }

  /**
   * Marca el documento como procesado en la base de datos
   * @param {string} filename - Nombre del archivo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Documento creado/actualizado
   */
  async markAsProcessed(filename, metadata = {}) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verificar si ya existe un registro para este archivo
        const existing = await tx.documentoPDF.findUnique({
          where: { filename }
        });

        if (existing) {
          return tx.documentoPDF.update({
            where: { id: existing.id },
            data: {
              tipo: this.type,
              procesado: true,
              fechaProcesado: new Date(),
              metadata: { ...existing.metadata, ...metadata }
            }
          });
        }

        return tx.documentoPDF.create({
          data: {
            filename,
            tipo: this.type,
            procesado: true,
            fechaProcesado: new Date(),
            metadata
          }
        });
      });
    } catch (error) {
      console.error('Error al marcar como procesado:', error);
      throw new Error('No se pudo guardar el estado del documento');
    }
  }

  // Métodos de utilidad para las clases hijas
  
  /**
   * Extrae una sección del texto usando expresiones regulares
   * @param {string} text - Texto completo
   * @param {RegExp} regex - Expresión regular para extraer la sección
   * @returns {string} Texto extraído
   */
  extractSection(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Parsea una fecha en formato DD/MM/YYYY a objeto Date
   * @param {string} dateStr - Fecha en formato DD/MM/YYYY
   * @returns {Date}
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Normaliza un valor monetario
   * @param {string} amount - Valor monetario como texto
   * @returns {number}
   */
  normalizeAmount(amount) {
    if (!amount) return 0;
    // Remover símbolos de moneda y puntos de miles, reemplazar coma decimal por punto
    const normalized = amount
      .replace(/[^\d,-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    return parseFloat(normalized) || 0;
  }
}