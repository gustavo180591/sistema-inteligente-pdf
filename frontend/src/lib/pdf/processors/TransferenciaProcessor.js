// src/lib/pdf/processors/TransferenciaProcessor.js
import { PDFProcessor } from './base.js';
import { ProcessingError, ValidationError } from './errors.js';
import { Prisma } from '@prisma/client';

/**
 * Interfaz para los datos de transferencia
 * @typedef {Object} TransferenciaData
 * @property {string} fecha - Fecha de la transferencia (YYYY-MM-DD)
 * @property {number} monto - Monto de la transferencia
 * @property {string | null} cbuOrigen - CBU de origen (22 dígitos)
 * @property {string | null} cbuDestino - CBU de destino (22 dígitos)
 * @property {string | null} referencia - Referencia o concepto de la transferencia
 * @property {string} [moneda] - Código de moneda (ARS/USD)
 * @property {string} [estado] - Estado de la transferencia
 * @property {string[]} [lineas] - Líneas de texto del PDF
 */

export class TransferenciaProcessor extends PDFProcessor {
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
  
  type = 'TRANSFERENCIA';
  requiredFields = [
    'fecha',
    'monto',
    'cbuOrigen',
    'cbuDestino',
    'referencia'
  ];

  /**
   * Verifica si este procesador puede manejar el documento
   * @param {string} text - Texto extraído del PDF
   * @returns {Promise<boolean>} true si puede procesar el documento
   */
  async canProcess(text) {
    const transferenciaIndicators = [
      'COMPROBANTE DE TRANSFERENCIA',
      'TRANSFERENCIA BANCARIA',
      'DETALLE DE TRANSFERENCIA',
      'TRANSFERENCIA DE FONDOS'
    ];
    
    return transferenciaIndicators.some(indicator => 
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
      const data = this.extraerDatosTransferencia(text);
      const missingFields = this.requiredFields.filter(
        /** @type {(field: string) => boolean} */
        (field) => !data[/** @type {keyof typeof data} */ (field)]
      );

      if (missingFields.length > 0) {
        throw new ValidationError(
          `Campos requeridos faltantes: ${missingFields.join(', ')}`
        );
      }

      // Validar formato de CBUs
      if (data.cbuOrigen && !/^\d{22}$/.test(data.cbuOrigen)) {
        throw new ValidationError('CBU de origen inválido');
      }

      if (data.cbuDestino && !/^\d{22}$/.test(data.cbuDestino)) {
        throw new ValidationError('CBU de destino inválido');
      }

      // Validar monto
      if (isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
        throw new ValidationError('El monto debe ser un número positivo');
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
   * Procesa el documento de transferencia
   * @param {string} text - Texto extraído del PDF
   * @param {string} filePath - Ruta al archivo PDF
   * @returns {Promise<Object>} Datos estructurados de la transferencia
   */
  /**
   * Procesa el texto extraído de un PDF de transferencia
   * @param {string} text - Texto extraído del PDF
   * @param {string} [_filePath] - Ruta al archivo (opcional, no utilizado actualmente)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(text, _filePath) {
    // El parámetro _filePath no se utiliza actualmente pero se mantiene
    // por compatibilidad con la firma del método en la clase base
    try {
      // Extraer datos estructurados
      const transferenciaData = this.extraerDatosTransferencia(text);
      
      // Validar estructura
      await this.validateDocumentStructure(text);
      
      // Guardar en base de datos
      const result = await this.guardarEnBaseDeDatos(transferenciaData);
      
      return {
        ...transferenciaData,
        ...result,
        procesado: true,
        fechaProcesamiento: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error procesando transferencia:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new ProcessingError(
        `Error al procesar el documento de transferencia: ${errorMessage}`
      );
    }
  }

  /**
   * Guarda los datos de la transferencia en la base de datos
   * @param {TransferenciaData} data - Datos de la transferencia
   * @returns {Promise<Object>} Resultado de la operación
   */
  /**
   * Guarda los datos de la transferencia en la base de datos
   * @param {TransferenciaData} data - Datos de la transferencia
   * @returns {Promise<{success: boolean, message: string, data?: any}>} Resultado de la operación
   */
  async guardarEnBaseDeDatos(data) {
    if (!this.prisma) {
      console.warn('Prisma no está disponible, omitiendo guardado en base de datos');
      return { success: false, message: 'Prisma no está configurado' };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Buscar o crear persona por CBU
        let persona = null;
        if (data.cbuDestino) {
          persona = await tx.persona.findFirst({
            where: { 
              cbu: data.cbuDestino || undefined,
              // @ts-expect-error - cbu es un campo válido en el modelo Persona
              NOT: { cbu: null }
            }
          });
        }

        // 2. Crear documento PDF primero
        const documentoPDF = await tx.documentoPDF.create({
          data: {
            filename: `transferencia_${Date.now()}.pdf`,
            tipo: 'TRANSFERENCIA',
            procesado: true,
            fechaProcesado: new Date(),
            metadata: {
              lineas: data.lineas || [],
              referencia: data.referencia || ''
            }
          }
        });

        // 3. Crear transferencia
        const transferencia = await tx.transferencia.create({
          data: {
            documento: {
              connect: { id: documentoPDF.id }
            },
            fechaOperacion: data.fecha ? new Date(data.fecha) : new Date(),
            montoTotal: new Prisma.Decimal(data.monto),
            cantidadPersonas: 1,
            cbuOrigen: data.cbuOrigen || null,
            cbuDestino: data.cbuDestino || null,
            referencia: data.referencia || null,
            estado: 'PROCESADO',
            detalles: {
              // Almacenar datos adicionales en el campo JSON
              moneda: data.moneda || 'ARS',
              personaId: persona?.id || null,
              lineas: data.lineas || []
            }
          },
          include: {
            documento: true
          }
        });

        return { 
          success: true, 
          message: 'Transferencia procesada exitosamente',
          data: {
            id: transferencia.id,
            fechaOperacion: transferencia.fechaOperacion,
            montoTotal: transferencia.montoTotal,
            referencia: transferencia.referencia,
            estado: transferencia.estado,
            documentoId: documentoPDF.id,
            personaId: persona?.id || null
          }
        };
      });
      
    } catch (error) {
      console.error('Error al guardar transferencia en la base de datos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new ProcessingError(
        `Error al guardar la transferencia en la base de datos: ${errorMessage}`
      );
    }
  }

  /**
   * Extrae los datos estructurados del texto de la transferencia
   * @private
   * @param {string} texto - Texto del PDF
   * @returns {TransferenciaData} Datos estructurados de la transferencia
   */
  extraerDatosTransferencia(texto) {
    // Normalizar saltos de línea y espacios
    const lineas = texto.split('\n').map(line => line.trim());
    const contenido = lineas.join(' ');
    
    // Extraer montos (buscar patrones como $1,000.00 o 1000,00)
    const montoMatch = contenido.match(/(?:USD\s*)?\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/);
    const monto = montoMatch ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
    
    // Extraer CBUs (22 dígitos)
    const cbus = (contenido.match(/\b\d{22}\b/g) || []).filter(Boolean);
    const cbuOrigen = cbus[0] || null;
    const cbuDestino = cbus[1] || null;
    
    // Extraer fecha (buscar formatos como dd/mm/aaaa o dd-mm-aaaa)
    const fechaMatch = contenido.match(/(?:FECHA|FECHA\s+OPERACI[OÓ]N)[:\s]+(\d{2}[-./]\d{2}[-./]\d{4})/i) || 
                      contenido.match(/\b(\d{2}[-./]\d{2}[-./]\d{4})\b/);
    
    let fecha = '';
    if (fechaMatch && fechaMatch[1]) {
      // Convertir a formato ISO (YYYY-MM-DD)
      const dateParts = fechaMatch[1].match(/(\d{2})[/.-](\d{2})[/.-](\d{4})/);
      if (dateParts) {
        const dd = dateParts[1];
        const mm = dateParts[2];
        const yyyy = dateParts[3];
        fecha = `${yyyy}-${mm}-${dd}`;
      }
    }
    
    // Extraer referencia o concepto
    const refMatch = contenido.match(/(?:REF(?:ERENCIA)?|CONCEPTO)[:\s]+([^\n]+?)(?=\s{2,}|$)/i);
    const referencia = refMatch ? refMatch[1].trim() : null;
    
    // Detectar moneda
    const monedaMatch = contenido.match(/(USD|ARS|\$|U\$S?)/i);
    let moneda = 'ARS';
    if (monedaMatch) {
      const monedaStr = monedaMatch[1].toUpperCase();
      if (monedaStr === 'USD' || monedaStr === 'U$S' || monedaStr === 'U$') {
        moneda = 'USD';
      }
    }

    // Asegurar que los campos requeridos no sean null
    return {
      monto,
      cbuOrigen: cbuOrigen || '',
      cbuDestino: cbuDestino || '',
      fecha: fecha || new Date().toISOString().split('T')[0],
      referencia: referencia || '',
      moneda,
      estado: 'PENDIENTE',
      lineas: lineas.filter(Boolean)
    };
  }
}