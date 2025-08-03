// src/lib/pdf/processors/ListadoSIDEPPProcessor.js
import { PDFProcessor } from './base';
import { ValidationError } from './errors';

export class ListadoSIDEPPProcessor extends PDFProcessor {
  constructor() {
    super();
    this.type = 'SIDEPP';
    this.requiredFields = [
      'Sistema Integrado de Emisión de Planillas de Pago',
      'Liquidación de Haberes',
      'CUIT',
      'Período'
    ];
  }
  async process(text, filePath, docId = null) {
    // Validar estructura del documento
    if (!await this.validateDocumentStructure(text)) {
      throw new ValidationError('El documento no tiene el formato SIDEPP esperado');
    }

    const lineas = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    try {
      // Extraer datos estructurados
      const periodo = this.extraerPeriodo(text);
      const { personas, conceptos } = await this.extraerDatosEstructurados(text, lineas);
      
      // Validar datos extraídos
      this.validarDatosExtraidos({ periodo, personas, conceptos });
      
      // Usar transacción para asegurar consistencia
      return await prisma.$transaction(async (tx) => {
      // 1. Crear o actualizar personas
      const personasGuardadas = await Promise.all(
        personas.map(async (p) => {
          return tx.persona.upsert({
            where: { 
              nombre_apellido: {
                nombre: p.nombre,
                apellido: p.apellido
              }
            },
            update: {
              documento: p.documento || undefined,
              cbu: p.cbu || undefined
            },
            create: {
              nombre: p.nombre,
              apellido: p.apellido,
              documento: p.documento,
              cbu: p.cbu
            }
          });
        })
      );

      // 2. Crear liquidación
      const liquidacion = await tx.liquidacion.create({
        data: {
          tipo: 'SIDEPP',
          periodo: periodo,
          fecha: new Date(),
          montoTotal: personas.reduce((sum, p) => sum + p.monto, 0),
          documentoId: docId
        }
      });

      // 3. Crear relaciones persona-liquidación
      await tx.liquidacionPersona.createMany({
        data: personas.map((p, i) => ({
          personaId: personasGuardadas[i].id,
          liquidacionId: liquidacion.id,
          monto: p.monto,
          detalles: {
            documento: p.documento,
            cbu: p.cbu
          }
        }))
      });

      // 4. Procesar conceptos si existen
      if (conceptos.length > 0) {
        await Promise.all(
          conceptos.map(async (concepto) => {
            await tx.concepto.upsert({
              where: { codigo: concepto.codigo },
              update: {},
              create: {
                codigo: concepto.codigo,
                descripcion: concepto.descripcion,
                tipo: concepto.tipo
              }
            });
            
            // Aquí podrías crear LiquidacionConcepto si es necesario
          })
        );
      }

      return {
        periodo,
        totalPersonas: personasGuardadas.length,
        totalConceptos: conceptos.length,
        detalles: {
          personas: personasGuardadas,
          conceptos: conceptos
        }
      };
    });
  } catch (error) {
    console.error('Error al procesar documento SIDEPP:', error);
    throw new ProcessingError(
      'Error al procesar el documento SIDEPP',
      'SIDEPP_PROCESSING_ERROR'
    );
  }

  /**
   * Extrae datos estructurados del texto del PDF
   * @private
   */
  async extraerDatosEstructurados(text, lineas) {
    const periodo = this.extraerPeriodo(text);
    const personas = this.extraerPersonas(lineas);
    const conceptos = this.extraerConceptos(lineas);
    
    return { periodo, personas, conceptos };
  }

  /**
   * Valida los datos extraídos del documento
   * @private
   */
  validarDatosExtraidos({ periodo, personas, conceptos }) {
    if (!periodo || !periodo.desde || !periodo.hasta) {
      throw new ValidationError('No se pudo determinar el período del documento', 'periodo');
    }

    if (!personas || personas.length === 0) {
      throw new ValidationError('No se encontraron personas en el documento', 'personas');
    }

    if (!conceptos || conceptos.length === 0) {
      console.warn('No se encontraron conceptos en el documento');
    }
  }

  extraerPeriodo(texto) {
    // Buscar patrones de fecha como "Periodo: 07/2024" o "Mes: JULIO 2024"
    const patrones = [
      /Periodo:\s*(\d{2}\/\d{4})/i,
      /Mes:\s*([A-Z]+\s+\d{4})/i,
      /(\d{2}\/\d{4})/ // Cualquier patrón MM/YYYY
    ];

    for (const patron of patrones) {
      const match = texto.match(patron);
      if (match) {
        return match[1];
      }
    }

    // Si no se encuentra, devolver el mes y año actual
    const ahora = new Date();
    return `${String(ahora.getMonth() + 1).padStart(2, '0')}/${ahora.getFullYear()}`;
  }

  extraerPersonas(lineas) {
    const personas = [];
    let enSeccionPersonas = false;

    for (const linea of lineas) {
      // Buscar inicio de la sección de personas
      if (linea.includes('Personas') && linea.includes('Tot Remunerativo')) {
        enSeccionPersonas = true;
        continue;
      }

      if (enSeccionPersonas) {
        // Detener al encontrar totales
        if (linea.includes('Totales:') || linea.includes('Cantidad de Personas:')) {
          break;
        }

        // Extraer datos de persona (ajustar según formato exacto)
        const match = linea.match(/^([A-ZÁÉÍÓÚÑ\s]+?)\s+(\d+[\.,]?\d*)/);
        if (match) {
          const nombreCompleto = match[1].trim();
          const monto = parseFloat(match[2].replace('.', '').replace(',', '.'));
          
          // Extraer documento si está en la línea (ajustar según formato)
          const docMatch = linea.match(/\b\d{7,8}\b/);
          const documento = docMatch ? docMatch[0] : null;
          
          // Extraer CBU si está en la línea (22 dígitos)
          const cbuMatch = linea.match(/\b\d{22}\b/);
          const cbu = cbuMatch ? cbuMatch[0] : null;

          // Separar apellido y nombre (asumimos formato "APELLIDO NOMBRE")
          const partes = nombreCompleto.split(/\s+/);
          const apellido = partes[0] || '';
          const nombre = partes.slice(1).join(' ') || 'N/N';

          if (nombre && apellido) {
            personas.push({
              nombre,
              apellido,
              documento,
              cbu,
              monto
            });
          }
        }
      }
    }

    return personas;
  }

  extraerConceptos(lineas) {
    // Implementar según el formato específico de conceptos en el PDF
    // Este es un ejemplo básico
    const conceptos = [];
    let enSeccionConceptos = false;

    for (const linea of lineas) {
      if (linea.includes('Concepto') && linea.includes('Monto')) {
        enSeccionConceptos = true;
        continue;
      }

      if (enSeccionConceptos) {
        // Detener al encontrar totales o fin de sección
        if (linea.includes('Totales:') || linea.includes('---')) {
          break;
        }

        // Ejemplo: "HABER BASICO 100,000.00"
        const match = linea.match(/^([A-Z\s]+?)\s+([\d.,]+)/i);
        if (match) {
          const descripcion = match[1].trim();
          const monto = parseFloat(match[2].replace('.', '').replace(',', '.'));
          
          // Determinar tipo de concepto
          let tipo = 'Haber';
          if (descripcion.includes('DESCUENTO') || descripcion.includes('RETENCION')) {
            tipo = 'Descuento';
          } else if (descripcion.includes('APORTE') || descripcion.includes('CONTRIBUCIÓN')) {
            tipo = 'Aporte';
          }

          conceptos.push({
            codigo: descripcion.substring(0, 10).trim().toUpperCase().replace(/\s+/g, '_'),
            descripcion,
            tipo,
            monto
          });
        }
      }
    }

    return conceptos;
  }
}