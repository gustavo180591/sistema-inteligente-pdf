// frontend/src/lib/pdf/processors/listado.js
import { PDFProcessor } from './base.js';

export class ListadoProcessor extends PDFProcessor {
  constructor() {
    super();
    this.type = 'LISTADO';
    this.patterns = {
      header: /TOTALES\s+POR\s+CONCEPTO\s+-\s+PERSONAS/i,
      personLine: /^([A-ZÁÉÍÓÚÜÑ][A-Z\sÁÉÍÓÚÜÑ]+?)\s+(\d+\.\d{2})/,
      date: /Periodo:\s*([A-Za-z]+\s+\d{4})/i
    };
  }

  async canProcess(text) {
    return this.patterns.header.test(text);
  }

  async process(filePath) {
    const text = await this.extractText(filePath);
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    const periodo = this.extractPeriodo(text);
    const personas = [];
    let inPersonasSection = false;

    for (const line of lines) {
      if (line.includes('Personas') && line.includes('Tot Remunerativo')) {
        inPersonasSection = true;
        continue;
      }

      if (inPersonasSection) {
        if (line.includes('Totales:')) break;
        
        const match = line.match(this.patterns.personLine);
        if (match) {
          const [_, nombreCompleto, monto] = match;
          const [apellido, ...nombres] = nombreCompleto.trim().split(/\s+/);
          const nombre = nombres.join(' ');
          
          personas.push({ nombre, apellido, monto: parseFloat(monto) });
        }
      }
    }

    // Guardar en la base de datos
    await this.saveToDatabase({ personas, periodo, filePath });
    
    return {
      tipo: this.type,
      periodo,
      totalPersonas: personas.length,
      filePath
    };
  }

  async saveToDatabase({ personas, periodo }) {
    return prisma.$transaction(async (tx) => {
      // 1. Crear o actualizar personas
      const personasDB = await Promise.all(
        personas.map(p => 
          tx.persona.upsert({
            where: { 
              nombre_apellido: {
                nombre: p.nombre,
                apellido: p.apellido
              }
            },
            update: {},
            create: {
              nombre: p.nombre,
              apellido: p.apellido
            }
          })
        )
      );

      // 2. Crear liquidación
      const liquidacion = await tx.liquidacion.create({
        data: {
          tipo: 'SIDEPP',
          periodo,
          fecha: new Date()
        }
      });

      // 3. Relacionar personas con la liquidación
      await tx.liquidacionPersona.createMany({
        data: personas.map((p, i) => ({
          personaId: personasDB[i].id,
          liquidacionId: liquidacion.id,
          monto: p.monto
        }))
      });

      return { liquidacionId: liquidacion.id };
    });
  }

  extractPeriodo(text) {
    const match = text.match(this.patterns.date);
    return match ? match[1] : new Date().toLocaleDateString('es-AR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }
}