// frontend/src/lib/services/pdf/documentProcessor.js
import { parse } from 'pdf-parse/lib/pdf-parse.js';

class DocumentProcessor {
  constructor() {
    this.documentTypes = {
      SIDEPP: 'SIDEPP',
      TRANSFER: 'TRANSFERENCIA',
      UNKNOWN: 'DESCONOCIDO'
    };
  }

  async processPdf(file) {
    try {
      // 1. Leer el archivo PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // 2. Extraer texto
      const text = await this.extractText(pdfData);
      
      // 3. Identificar tipo de documento
      const docType = this.identifyDocumentType(text);
      
      // 4. Procesar según el tipo
      let result;
      switch (docType) {
        case this.documentTypes.SIDEPP:
          result = this.processSIDEPP(text);
          break;
        case this.documentTypes.TRANSFER:
          result = this.processTransfer(text);
          break;
        default:
          throw new Error('Tipo de documento no soportado');
      }
      
      return {
        success: true,
        type: docType,
        data: result,
        metadata: {
          pages: text.numpages,
          text: text.text
        }
      };
    } catch (error) {
      console.error('Error procesando PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async extractText(pdfData) {
    try {
      return await parse(pdfData, {
        max: 1 // Procesar solo la primera página inicialmente
      });
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error);
      throw new Error('No se pudo extraer texto del PDF');
    }
  }

  identifyDocumentType(text) {
    const content = text.text.toLowerCase();
    
    // Patrones para identificar SIDEPP
    const sideppPatterns = [
      /sidepp/i,
      /sistema de información de empleadores del sector público/i,
      /liquidación de haberes/i
    ];
    
    // Patrones para identificar Transferencias
    const transferPatterns = [
      /transferencia bancaria/i,
      /orden de transferencia/i,
      /cbu origen/i,
      /cbu destino/i
    ];
    
    const sideppMatch = sideppPatterns.some(pattern => pattern.test(content));
    const transferMatch = transferPatterns.some(pattern => pattern.test(content));
    
    if (sideppMatch) return this.documentTypes.SIDEPP;
    if (transferMatch) return this.documentTypes.TRANSFER;
    
    return this.documentTypes.UNKNOWN;
  }

  processSIDEPP(text) {
    // Implementar lógica específica para SIDEPP
    const lines = text.text.split('\n').filter(line => line.trim() !== '');
    
    // Extraer datos básicos
    const periodoMatch = text.text.match(/per[ií]odo\s*:\s*([^\n]+)/i);
    const fechaMatch = text.text.match(/fecha\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
    
    // Extraer personas
    const personas = [];
    // ... lógica para extraer personas ...
    
    return {
      periodo: periodoMatch ? periodoMatch[1].trim() : null,
      fecha: fechaMatch ? fechaMatch[1].trim() : null,
      totalPersonas: personas.length,
      personas
    };
  }

  processTransfer(text) {
    // Implementar lógica específica para Transferencias
    const lines = text.text.split('\n').filter(line => line.trim() !== '');
    
    // Extraer datos básicos
    const cbuOrigenMatch = text.text.match(/cbu origen\s*:\s*([0-9]+)/i);
    const cbuDestinoMatch = text.text.match(/cbu destino\s*:\s*([0-9]+)/i);
    const montoMatch = text.text.match(/monto\s*:\s*([0-9]+\,[0-9]{2})/i);
    
    return {
      cbuOrigen: cbuOrigenMatch ? cbuOrigenMatch[1].trim() : null,
      cbuDestino: cbuDestinoMatch ? cbuDestinoMatch[1].trim() : null,
      monto: montoMatch ? montoMatch[1].trim() : null,
      fecha: new Date().toISOString().split('T')[0]
    };
  }

  validateDocumentData(data, type) {
    // Validaciones comunes
    if (!data) {
      throw new Error('Datos del documento no proporcionados');
    }
    
    // Validaciones específicas por tipo
    switch (type) {
      case this.documentTypes.SIDEPP:
        if (!data.periodo) throw new Error('Período no especificado');
        if (!data.personas || data.personas.length === 0) {
          throw new Error('No se encontraron personas en el documento');
        }
        break;
        
      case this.documentTypes.TRANSFER:
        if (!data.cbuOrigen || !data.cbuDestino) {
          throw new Error('CBU de origen y destino son requeridos');
        }
        if (!data.monto) throw new Error('Monto no especificado');
        break;
    }
    
    return true;
  }
}

export const documentProcessor = new DocumentProcessor();