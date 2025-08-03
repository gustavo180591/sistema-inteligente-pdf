// frontend/src/routes/api/upload/+server.js
import { json } from '@sveltejs/kit';
import { processPDF } from '$lib/pdf';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // Guardar archivo temporalmente
    const filename = `${uuidv4()}.pdf`;
    const uploadPath = join(process.cwd(), 'uploads', filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(uploadPath, buffer);

    // Procesar el archivo
    const result = await processPDF(uploadPath);

    return json({
      success: true,
      filename,
      ...result
    });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return json(
      { error: 'Error al procesar el archivo', details: error.message },
      { status: 500 }
    );
  }
}