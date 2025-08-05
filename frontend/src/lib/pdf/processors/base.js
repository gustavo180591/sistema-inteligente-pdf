// frontend/src/lib/pdf/processors/base.js
import { ValidationError } from './errors';

// Importar Prisma solo cuando sea necesario (en el servidor)
/** @type {import('@prisma/client').PrismaClient | null} */
let prisma = null;

export class PDFProcessor {
  constructor() {
    this.type = 'BASE';
    /** @type {string[]} */
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
   * Marca el documento como procesado (versión simplificada sin BD)
   * @param {string} filename - Nombre del archivo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Documento procesado
   */
  async markAsProcessed(filename, metadata = {}) {
    // Por ahora, solo retornar un objeto simulado
    return {
      id: `doc_${Date.now()}`,
      filename,
      tipo: this.type,
      procesado: true,
      fechaProcesado: new Date(),
      metadata
    };
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
   * @returns {Date | null}
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