// src/lib/pdf/processors/TransferenciaProcessor.js
import { prisma } from '../../db/prisma-client.js';

export class TransferenciaProcessor {
  async process(text, filePath, docId) {
    const datos = this.extraerDatosTransferencia(text);
    
    // Usar transacción para asegurar consistencia
    return await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear persona por CBU o nombre si está disponible
      let persona = null;
      if (datos.cbuDestino) {
        persona = await tx.persona.findFirst({
          where: { cbu: datos.cbuDestino }
        });
      }

      // 2. Crear transferencia
      const transferencia = await tx.transferencia.create({
        data: {
          fecha: datos.fecha || new Date(),
          monto: datos.monto,
          cbuOrigen: datos.cbuOrigen,
          cbuDestino: datos.cbuDestino,
          referencia: datos.referencia,
          estado: 'Procesada',
          documentoId: docId
        }
      });

      // 3. Si se identificó una persona, asociarla
      if (persona) {
        await tx.transferencia.update({
          where: { id: transferencia.id },
          data: { personaId: persona.id }
        });
      }

      return { 
        transferenciaId: transferencia.id,
        personaId: persona?.id || null
      };
    });
  }

  extraerDatosTransferencia(texto) {
    // Normalizar saltos de línea y espacios
    const contenido = texto.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
    
    // Extraer montos (buscar patrones como $1,000.00 o 1000,00)
    const montoMatch = contenido.match(/(?:USD\s*)?\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/);
    const monto = montoMatch ? parseFloat(montoMatch[1].replace(/[.,]/g, '').replace(',', '.')) : 0;
    
    // Extraer CBUs (22 dígitos)
    const cbus = contenido.match(/\b\d{22}\b/g) || [];
    const cbuOrigen = cbus[0] || null;
    const cbuDestino = cbus[1] || null;
    
    // Extraer fecha (buscar formatos como dd/mm/aaaa o dd-mm-aaaa)
    const fechaMatch = contenido.match(/\b(\d{2}[\/-]\d{2}[\/-]\d{4})\b/);
    const fecha = fechaMatch ? new Date(fechaMatch[1].replace(/(\d{2})[\/-](\d{2})[\/-](\d{4})/, '$2/$1/$3')) : new Date();
    
    // Extraer referencia o concepto
    const refMatch = contenido.match(/Referencia[:\s]+([^\n]+)/i) || 
                    contenido.match(/Concepto[:\s]+([^\n]+)/i);
    const referencia = refMatch ? refMatch[1].trim() : null;

    return {
      monto,
      cbuOrigen,
      cbuDestino,
      fecha,
      referencia
    };
  }
}