// src/lib/pdf/processors/ListadoSIDEPPProcessor.js
import { PDFProcessor } from './base.js';
import { ProcessingError, ValidationError } from './errors.js';

/**
 * Interfaz para los datos de un listado SIDEPP
 * @typedef {Object} ListadoSIDEPPData
 * @property {string} periodo - Período del listado (YYYY-MM)
 * @property {number} total - Total del listado
 * @property {Array<ItemListado>} items - Items del listado
 * @property {string} institucion - Nombre de la institución
 * @property {string|null} cuit - CUIT de la institución
 */

/**
 * Interfaz para un item del listado
 * @typedef {Object} ItemListado
 * @property {string} legajo - Número de legajo
 * @property {string} apellido - Apellido del socio
 * @property {string} nombre - Nombre del socio
 * @property {string|null} documento - DNI/CUIL del socio
 * @property {number} haber - Monto del haber
 * @property {number} descuento - Monto del descuento
 * @property {number} neto - Monto neto
 * @property {string} concepto - Concepto del descuento
 */

/**
 * Interfaz para los montos extraídos
 * @typedef {Object} MontosExtraidos
 * @property {number} haber - Monto del haber
 * @property {number} descuento - Monto del descuento
 * @property {number} neto - Monto neto
 */

export class ListadoSIDEPPProcessor extends PDFProcessor {
  /** @type {import('@prisma/client').PrismaClient} */
  prisma;

  /**
   * @param {Object} options
   * @param {import('@prisma/client').PrismaClient} options.prisma
   */
  constructor({ prisma }) {
    super();
    this.prisma = prisma;
  }
  
  type = 'SIDEPP';
  requiredFields = ['periodo', 'items'];

  /**
   * Verifica si este procesador puede manejar el documento
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<boolean>} true si puede procesar el documento
   */
  async canProcess(text) {
    const sideppIndicators = [
      'LIQUIDACION',
      'LEGAJO',
      'APELLIDO',
      'NOMBRE',
      'CONCEPTO',
      'HABER',
      'DESCUENTO',
      'NETO',
      'SIDEPP'
    ];
    
    return sideppIndicators.some(indicator => 
      text.toUpperCase().includes(indicator)
    );
  }

  /**
   * Valida la estructura del documento
   * @param {string} text - Texto del documento a validar
   * @returns {Promise<boolean>} true si la estructura es válida
   */
  async validateDocumentStructure(text) {
    try {
      const data = this.extraerDatosListado(text);
      
      if (!data.periodo) {
        throw new ValidationError('No se pudo detectar el período del listado');
      }

      if (!data.items || data.items.length === 0) {
        throw new ValidationError('No se encontraron items en el listado');
      }

      // Validar que al menos algunos items tengan datos válidos
      const validItems = data.items.filter(item => 
        item.legajo && item.apellido && item.nombre && item.neto > 0
      );

      if (validItems.length === 0) {
        throw new ValidationError('No se encontraron items válidos en el listado');
      }

      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Error al validar la estructura del documento');
    }
  }

  /**
   * Procesa el documento de listado SIDEPP
   * @param {string} text - Texto extraído del PDF
   * @param {string} [_filePath] - Ruta al archivo (opcional)
   * @returns {Promise<Object>} Datos estructurados del listado
   */
  async process(text, _filePath) {
    try {
      // Extraer datos estructurados
      const listadoData = this.extraerDatosListado(text);
      
      // Validar estructura
      await this.validateDocumentStructure(text);
      
      // Por ahora, solo retornar los datos extraídos sin guardar en BD
      return {
        ...listadoData,
        procesado: true,
        fechaProcesamiento: new Date().toISOString(),
        success: true,
        message: 'Listado SIDEPP procesado exitosamente'
      };
      
    } catch (error) {
      console.error('Error procesando listado SIDEPP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new ProcessingError(
        `Error al procesar el listado SIDEPP: ${errorMessage}`
      );
    }
  }

  /**
   * Extrae los datos estructurados del texto del listado
   * @private
   * @param {string} texto - Texto del PDF
   * @returns {ListadoSIDEPPData} Datos estructurados del listado
   */
  extraerDatosListado(texto) {
    const lineas = texto.split('\n').map(line => line.trim()).filter(Boolean);
    const contenido = lineas.join(' ');
    
    // Extraer período (buscar patrones como "PERIODO: 2024-01" o "MES: ENERO 2024")
    const periodoMatch = contenido.match(/(?:PERIODO|MES)[:\s]+(\d{4}[-/]\d{1,2})/i) ||
                        contenido.match(/(?:ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{4})/i);
    
    let periodo = '';
    if (periodoMatch) {
      if (periodoMatch[1].includes('-') || periodoMatch[1].includes('/')) {
        periodo = periodoMatch[1].replace('/', '-');
      } else {
        // Convertir mes a número
        const meses = {
          'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
          'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
          'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
        };
        const mesStr = Object.keys(meses).find(mes => 
          periodoMatch[0].toUpperCase().includes(mes)
        );
        if (mesStr && meses[/** @type {keyof typeof meses} */ (mesStr)]) {
          periodo = `${periodoMatch[1]}-${meses[/** @type {keyof typeof meses} */ (mesStr)]}`;
        }
      }
    }

    // Extraer CUIT de institución
    const cuitMatch = contenido.match(/(?:CUIT|C\.U\.I\.T\.)[:\s]*(\d{2}-\d{8}-\d{1})/i);
    const cuit = cuitMatch ? cuitMatch[1] : null;

    // Extraer nombre de institución
    const institucionMatch = contenido.match(/(?:INSTITUCION|ESTABLECIMIENTO|ESCUELA)[:\s]+([^\n]+?)(?=\s{2,}|$)/i);
    const institucion = institucionMatch ? institucionMatch[1].trim() : null;

    // Extraer items del listado
    const items = this.extraerItemsListado(lineas);

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.neto || 0), 0);

    return {
      periodo: periodo || new Date().toISOString().substring(0, 7),
      institucion: institucion || 'Institución no especificada',
      cuit: cuit,
      items,
      total
    };
  }

  /**
   * Extrae los items individuales del listado
   * @private
   * @param {string[]} lineas - Líneas del texto
   * @returns {ItemListado[]} Array de items extraídos
   */
  extraerItemsListado(lineas) {
    const items = [];
    
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      
      // Buscar líneas que contengan legajo y apellido/nombre
      const legajoMatch = linea.match(/(\d{4,8})/); // Legajo de 4-8 dígitos
      
      if (legajoMatch) {
        // Buscar apellido y nombre en la misma línea o líneas siguientes
        const apellidoNombreMatch = linea.match(/([A-ZÁÉÍÓÚÑ\s]+)\s+([A-ZÁÉÍÓÚÑ\s]+)/i);
        
        if (apellidoNombreMatch) {
          const legajo = legajoMatch[1];
          const apellido = apellidoNombreMatch[1].trim();
          const nombre = apellidoNombreMatch[2].trim();
          
          // Buscar montos en la línea o líneas siguientes
          const montos = this.extraerMontos(linea);
          
          // Buscar documento en líneas cercanas
          const documento = this.extraerDocumento(lineas, i);
          
          // Buscar concepto
          const concepto = this.extraerConcepto(lineas, i);
          
          if (apellido && nombre && montos.neto > 0) {
            items.push({
              legajo,
              apellido,
              nombre,
              documento,
              haber: montos.haber,
              descuento: montos.descuento,
              neto: montos.neto,
              concepto: concepto || 'Aporte SIDEPP'
            });
          }
        }
      }
    }
    
    return items;
  }

  /**
   * Extrae montos de una línea
   * @private
   * @param {string} linea - Línea de texto
   * @returns {MontosExtraidos} Montos extraídos
   */
  extraerMontos(linea) {
    // Buscar patrones de montos ($1,000.00, 1000,00, etc.)
    const montos = linea.match(/(?:USD\s*)?\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g);
    
    if (montos && montos.length >= 3) {
      const haber = parseFloat(montos[0].replace(/[$,]/g, ''));
      const descuento = parseFloat(montos[1].replace(/[$,]/g, ''));
      const neto = parseFloat(montos[2].replace(/[$,]/g, ''));
      
      return { haber, descuento, neto };
    }
    
    return { haber: 0, descuento: 0, neto: 0 };
  }

  /**
   * Extrae documento de líneas cercanas
   * @private
   * @param {string[]} lineas - Todas las líneas
   * @param {number} index - Índice de la línea actual
   * @returns {string|null} Documento extraído
   */
  extraerDocumento(lineas, index) {
    // Buscar en líneas cercanas (índice actual ± 2)
    for (let i = Math.max(0, index - 2); i <= Math.min(lineas.length - 1, index + 2); i++) {
      const docMatch = lineas[i].match(/(\d{2}-\d{8}-\d{1})/); // CUIL
      if (docMatch) return docMatch[1];
      
      const dniMatch = lineas[i].match(/(\d{7,8})/); // DNI
      if (dniMatch) return dniMatch[1];
    }
    
    return null;
  }

  /**
   * Extrae concepto de líneas cercanas
   * @private
   * @param {string[]} lineas - Todas las líneas
   * @param {number} index - Índice de la línea actual
   * @returns {string|null} Concepto extraído
   */
  extraerConcepto(lineas, index) {
    // Buscar en líneas cercanas
    for (let i = Math.max(0, index - 1); i <= Math.min(lineas.length - 1, index + 1); i++) {
      const conceptoMatch = lineas[i].match(/(?:CONCEPTO|DESCRIPCION)[:\s]+([^\n]+?)(?=\s{2,}|$)/i);
      if (conceptoMatch) return conceptoMatch[1].trim();
    }
    
    return null;
  }
}