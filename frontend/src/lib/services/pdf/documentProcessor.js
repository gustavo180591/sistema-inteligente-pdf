// frontend/src/lib/services/pdf/documentProcessor.js
import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

/**
 * Procesador de documentos PDF para extracción estructurada de datos
 * @class DocumentProcessor
 */
/**
 * @typedef {Object} DocumentoPDF
 * @property {string} [periodo]
 * @property {string} [fecha]
 * @property {Array<Object>} [personas]
 * @property {number} [totalPersonas]
 * @property {number} [totalImporte]
 * @property {string} [cbuOrigen]
 * @property {string} [cbuDestino]
 * @property {number} [monto]
 * @property {string} [moneda]
 */

/**
 * @typedef {Object} ProcesarPDFResultado
 * @property {boolean} success
 * @property {string} type
 * @property {DocumentoPDF} data
 * @property {Object} [metadata]
 */

const DOCUMENT_TYPES = Object.freeze({
  SIDEPP: 'SIDEPP',
  TRANSFER: 'TRANSFERENCIA',
  UNKNOWN: 'DESCONOCIDO'
});

class DocumentProcessor {
  constructor() {
    this.documentTypes = DOCUMENT_TYPES;
    
    // Patrones precompilados para mejor rendimiento
    this.patterns = {
      sidepp: [
        /sidepp/iu,
        /sistema\s+de\s+informaci[oó]n\s+de\s+empleadores\s+del\s+sector\s+p[uú]blico/iu,
        /liquidaci[oó]n\s+de\s+haberes/iu
      ],
      transfer: [
        /transferencia\s+bancaria/iu,
        /orden\s+de\s+transferencia/iu,
        /cbu\s+origen/iu,
        /cbu\s+destino/iu
      ]
    };

    // Expresiones regulares para extraer datos de transferencias
    this.regex = {
      cbu: /CBU\s+(Origen|Destino):\s*([0-9]{22})/gi,
      monto: /Monto:\s*\$?\s*([0-9.,]+)/i,
      fecha: /Fecha:\s*([0-9]{2}[/-][0-9]{2}[-/][0-9]{4})/i,
      // Expresiones regulares para SIDEPP
      periodo: /Per[ií]odo:\s*([A-Za-z]+\s+[0-9]{4})/i,
      persona: /(\d+)\s+([\w\s]+)\s+(\d+)\s+([\d.,]+)/,
      totalPersonas: /Total de personas:\s*(\d+)/i,
      totalImporte: /Total importe:\s*\$?\s*([\d.,]+)/i,
      // Expresiones para datos personales
      nombre: /Nombre:\s*([^\n]+)/i,
      dni: /DNI:\s*(\d{7,8})/i,
      cuil: /CUIL:\s*(\d{2}-\d{8}-\d{1})/i
    };
  }

  /**
   * Procesa un archivo PDF y extrae su información estructurada
   * @param {File} file - Archivo PDF a procesar
   * @returns {Promise<ProcesarPDFResultado>} Resultado del procesamiento
   */
  /**
   * @typedef {Object} PDFTextMetadata
   * @property {string} text - Texto extraído del PDF
   * @property {number} [numpages] - Número de páginas del PDF
   */

  /**
   * Procesa un archivo PDF y extrae su información estructurada

  /**
   * Extrae texto de un archivo PDF
   * @param {Uint8Array} pdfData - Datos del PDF como Uint8Array
   * @returns {Promise<{text: string, numpages: number}>} Texto extraído y número de páginas
   */
  async extractText(pdfData) {
    try {
      // Cargar el documento PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extraer texto de cada página
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      return {
        text: fullText,
        numpages: pdf.numPages
      };
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      throw new Error('No se pudo extraer texto del archivo PDF');
    }
  }

  /**
   * Identifica el tipo de documento basado en su contenido
   * @param {string} text - Texto extraído del PDF
   * @returns {string} Tipo de documento (SIDEPP, TRANSFER, etc.)
   */
  identifyDocumentType(text) {
    if (!text || typeof text !== 'string') {
      return this.documentTypes.UNKNOWN;
    }

    if (text.includes('SIDEPP') || text.includes('Sistema de Declaraciones Patrimoniales')) {
      return this.documentTypes.SIDEPP;
    }

    if (text.includes('Transferencia') || text.match(/CBU\s+(Origen|Destino):/i)) {
      return this.documentTypes.TRANSFER;
    }

    return this.documentTypes.UNKNOWN;
  }

  /**
   * Procesa un documento SIDEPP
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<DocumentoPDF>} Datos estructurados del SIDEPP
   */
  async processSIDEPP(text) {
    if (typeof text !== 'string') {
      throw new Error('Se esperaba un texto válido');
    }

    // Reiniciar índices de expresiones regulares
    Object.values(this.regex).forEach(regex => {
      if (regex instanceof RegExp) {
        regex.lastIndex = 0;
      }
    });

    const periodoMatch = this.regex.periodo.exec(text);
    const totalPersonasMatch = this.regex.totalPersonas.exec(text);
    const totalImporteMatch = this.regex.totalImporte.exec(text);

    // Extraer personas del texto
    const lineasPersona = text.split('\n')
      .filter(linea => this.regex.persona.test(linea))
      .map(linea => {
        const match = this.regex.persona.exec(linea);
        if (!match || match.length < 5) {
          return null;
        }
        return {
          legajo: match[1],
          nombre: match[2].trim(),
          documento: match[3],
          importe: parseFloat(match[4].replace(/\./g, '').replace(',', '.'))
        };
      })
      .filter(item => item !== null);

    /** @type {DocumentoPDF} */
    const result = {
      periodo: periodoMatch ? periodoMatch[1].trim() : '',
      personas: lineasPersona,
      totalPersonas: totalPersonasMatch ? parseInt(totalPersonasMatch[1], 10) : lineasPersona.length,
      totalImporte: totalImporteMatch 
        ? parseFloat(totalImporteMatch[1].replace(/\./g, '').replace(',', '.')) 
        : lineasPersona.reduce((sum, p) => sum + p.importe, 0)
    };

    return result;
  }

  /**
   * Procesa un documento de transferencia
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<ProcesarPDFResultado>} Resultado del procesamiento de transferencia
   */
  async processTransfer(text) {
    if (typeof text !== 'string') {
      throw new Error('Se esperaba un texto válido');
    }

    // Resetear el índice de la expresión regular global
    this.regex.cbu.lastIndex = 0;
    
    const cbuMatches = Array.from(text.matchAll(this.regex.cbu) || []);
    const montoMatch = this.regex.monto.exec(text);
    const fechaMatch = this.regex.fecha.exec(text);

    // Validar CBUs
    const cbuOrigenMatch = cbuMatches.find(match => match[1].toLowerCase() === 'origen');
    const cbuDestinoMatch = cbuMatches.find(match => match[1].toLowerCase() === 'destino');

    if (!cbuOrigenMatch || !cbuDestinoMatch) {
      throw new Error('No se encontraron los CBUs de origen y/o destino');
    }

    const monto = montoMatch ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
    const fecha = fechaMatch ? fechaMatch[1] : new Date().toISOString().split('T')[0];

    /** @type {ProcesarPDFResultado} */
    return {
      success: true,
      type: this.documentTypes.TRANSFER,
      data: {
        cbuOrigen: cbuOrigenMatch[2] || '',
        cbuDestino: cbuDestinoMatch[2] || '',
        monto,
        fecha,
        moneda: 'ARS'
      },
      metadata: {
        extractedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Valida los datos extraídos del documento
   * @param {DocumentoPDF} data - Datos a validar
   * @param {string} type - Tipo de documento
   * @throws {Error} Si la validación falla
   */
  validateDocumentData(data, type) {
    if (!data || typeof data !== 'object') {
      throw new Error('Datos del documento no proporcionados o inválidos');
    }

    switch (type) {
      case this.documentTypes.SIDEPP:
        if (!data.periodo || typeof data.periodo !== 'string') {
          throw new Error('Período no especificado o inválido');
        }
        if (!data.personas || !Array.isArray(data.personas)) {
          throw new Error('Formato de personas inválido');
        }
        break;

      case this.documentTypes.TRANSFER:
        if (!data.cbuOrigen || typeof data.cbuOrigen !== 'string' || data.cbuOrigen.length !== 22) {
          throw new Error('CBU de origen es requerido y debe tener 22 dígitos');
        }
        if (!data.cbuDestino || typeof data.cbuDestino !== 'string' || data.cbuDestino.length !== 22) {
          throw new Error('CBU de destino es requerido y debe tener 22 dígitos');
        }
        if (typeof data.monto !== 'number' || isNaN(data.monto) || data.monto <= 0) {
          throw new Error('Monto inválido');
        }
        if (!data.fecha || typeof data.fecha !== 'string') {
          throw new Error('Fecha inválida');
        }
        break;

      default:
        throw new Error(`Tipo de documento no soportado: ${type}`);
    }
  }

  /**
   * Procesa un documento PDF
   * @param {File} file - Archivo PDF a procesar
   * @returns {Promise<ProcesarPDFResultado>} Resultado del procesamiento
   */
  async processPdf(file) {
    try {
      if (!(file instanceof File)) {
        throw new Error('Se esperaba un objeto File válido');
      }

      const arrayBuffer = await file.arrayBuffer();
      const { text, numpages } = await this.extractText(new Uint8Array(arrayBuffer));
      const docType = this.identifyDocumentType(text);
      const numPages = numpages; // Alias to maintain camelCase in the rest of the code
      
      let result;
      
      switch (docType) {
        case this.documentTypes.SIDEPP: {
          const sideppData = await this.processSIDEPP(text);
          this.validateDocumentData(sideppData, docType);
          result = {
            success: true,
            type: docType,
            data: sideppData,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              pages: numPages,
              extractedAt: new Date().toISOString()
            }
          };
          break;
        }
        case this.documentTypes.TRANSFER: {
          const transferData = await this.processTransfer(text);
          this.validateDocumentData(transferData.data, docType);
          result = {
            ...transferData,
            success: true,
            type: docType,
            metadata: {
              ...(transferData.metadata || {}),
              fileName: file.name,
              fileSize: file.size,
              pages: numPages,
              extractedAt: new Date().toISOString()
            }
          };
          break;
        }
        default:
          throw new Error('Tipo de documento no soportado');
      }
      
      return result;
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw error;
    }
  }
}

/** @type {DocumentProcessor} */
export const documentProcessor = new DocumentProcessor();