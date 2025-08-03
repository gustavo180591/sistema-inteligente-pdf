// frontend/src/routes/api/upload/+server.js
import { json } from '@sveltejs/kit';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TransferenciaProcessor } from '$lib/pdf/processors/TransferenciaProcessor.js';
import { PrismaClient } from '@prisma/client';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
await mkdir(uploadsDir, { recursive: true });

const prisma = new PrismaClient();

// Type definitions for file handling
/** @typedef {{ name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }} UploadedFile */

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const files = /** @type {UploadedFile[]} */ (Array.from(formData.getAll('files')));
    
    if (!files || files.length === 0) {
      return json({ success: false, error: 'No se proporcionaron archivos' }, { status: 400 });
    }

    const results = [];
    const processor = new TransferenciaProcessor({ prisma });

    // Process each file
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        results.push({
          filename: file.name,
          success: false,
          error: 'Archivo demasiado grande (máximo 10MB)'
        });
        continue;
      }

      // Save file temporarily
      const filename = `${uuidv4()}-${file.name}`;
      const uploadPath = join(uploadsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(uploadPath, buffer);

      try {
        // Process the PDF
        const result = await processor.process(buffer.toString('base64'), filename);
        
        results.push({
          filename: file.name,
          success: true,
          data: result
        });
      } catch (/** @type {any} */ error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          filename: file.name,
          success: false,
          error: error?.message || 'Error al procesar el archivo'
        });
      } finally {
        // Clean up the temporary file
        try {
          await unlink(uploadPath);
        } catch (error) {
          console.error(`Error deleting temporary file ${uploadPath}:`, error);
        }
      }
    }

    return json({
      success: results.every(r => r.success),
      results
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}