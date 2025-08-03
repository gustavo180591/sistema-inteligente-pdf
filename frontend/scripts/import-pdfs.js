import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();
const uploadsDir = path.join(process.cwd(), 'uploads');



async function extractText(filePath) {
  console.log(`📄 Extrayendo texto de: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return '';
  }

  try {
    const tempFile = path.join(__dirname, 'temp.txt');
    
    // Ejecutar pdftotext de forma asíncrona
    await execAsync(`pdftotext -layout "${filePath}" "${tempFile}"`);
    
    // Leer el archivo de texto generado
    const text = await fs.promises.readFile(tempFile, 'utf8');
    
    // Eliminar el archivo temporal
    await fs.promises.unlink(tempFile).catch(() => {});
    
    return text;
  } catch (error) {
    console.error(`❌ Error extrayendo texto de ${filePath}:`, error.message);
    return '';
  }
}

async function processPDF(filePath) {
  try {
    const text = await extractText(filePath);
    if (!text) {
      console.log(`⚠️ No se pudo extraer texto de ${filePath}`);
      return;
    }

    // Dividir el texto en líneas y limpiarlas
    const lineas = text.split('\n').map(linea => linea.trim()).filter(linea => linea);
    
    let lineasNombres = [];
    let enSeccionPersonas = false;
    
    // Primero intentar extraer de una tabla bien formateada
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      
      // Buscar el inicio de la sección de personas
      if (linea.includes('Personas') && lineas[i+1]?.includes('Tot Remunerativo')) {
        enSeccionPersonas = true;
        i += 1; // Saltar la línea de encabezado
        continue;
      }
      
      // Si estamos en la sección de personas
      if (enSeccionPersonas) {
        // Detener si encontramos la línea de totales
        if (linea.includes('Totales:') || linea.includes('Cantidad de Personas:')) {
          break;
        }
        
        // Intentar extraer el nombre (formato: APELLIDO NOMBRE en mayúsculas seguido de números)
        const match = linea.match(/^([A-ZÁÉÍÓÚÜÑ]+(?:\s+[A-ZÁÉÍÓÚÜÑ]+)+)(?=\s+\d|\.\d)/);
        if (match) {
          const nombreCompleto = match[0].trim();
          // Verificar que no sea parte del encabezado y tenga al menos un espacio
          if (nombreCompleto.split(/\s+/).length >= 2 && 
              !nombreCompleto.includes('Personas') && 
              !nombreCompleto.includes('Remunerativo')) {
            lineasNombres.push(nombreCompleto);
          }
        }
      }
    }
    
    // Si no encontramos la sección de personas, buscar líneas que parezcan nombres completos
    if (lineasNombres.length === 0) {
      console.log('ℹ️ No se pudo encontrar la sección de personas, buscando nombres directamente...');
      
      // Palabras comunes que no son nombres de personas
      const palabrasIgnorar = new Set([
        'PERSONAS', 'REMUNERATIVO', 'CANTIDAD', 'LEGAJOS', 'MONTO', 'CONCEPTO',
        'FECHA', 'PÁGINA', 'PERIODO', 'TOTALES', 'SANTOS', 'MARTIRES', 'LOTE',
        'FRACCION', 'MACRO', 'BUENOS', 'AIRES', 'BANCO', 'SINDICATO', 'DOCENTES',
        'EDUCACIÓN', 'PÚBLICA', 'OPERACIÓN', 'IMPORTE', 'TRANSFERENCIA', 'DATOS',
        'CUENTA', 'ORIGEN', 'DESTINO', 'TITULAR', 'TIPO', 'PROVEEDORES', 'TOTAL',
        'REFERENCIA', 'NÚMERO', 'HORA', 'CIUDAD', 'AUTÓNOMA', 'ORDENANTE', 'ESCUELA',
        'FAMILIA', 'AGRÍCOLA', 'ARISTÓBULO', 'VALLE', 'PAGE', 'OF',
        // Versiones en minúsculas
        ...['personas', 'remunerativo', 'cantidad', 'legajos', 'monto', 'concepto',
          'fecha', 'página', 'periodo', 'totales', 'santos', 'martires', 'lote',
          'fraccion', 'macro', 'buenos', 'aires', 'banco', 'sindicato', 'docentes',
          'educación', 'pública', 'operación', 'importe', 'transferencia', 'datos',
          'cuenta', 'origen', 'destino', 'titular', 'tipo', 'proveedores', 'total',
          'referencia', 'número', 'hora', 'ciudad', 'autónoma', 'ordenante', 'escuela',
          'familia', 'agrícola', 'aristóbulo', 'valle', 'page', 'of']
      ]);
      
      // Buscar líneas que parezcan nombres completos
      for (const linea of lineas) {
        // Filtrar líneas que son muy cortas o muy largas para ser nombres
        if (linea.length < 5 || linea.length > 100) continue;
        
        // Buscar patrones que parezcan nombres (formato: Apellido Nombre)
        // Primero intentar con formato en mayúsculas (para listado1.pdf)
        let posiblesNombres = linea.match(/\b[A-ZÁÉÍÓÚÜÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÜÑ]{2,}){1,2}\b/g) || [];
        
        // Si no hay coincidencias en mayúsculas, intentar con formato normal
        if (posiblesNombres.length === 0) {
          posiblesNombres = linea.match(/\b[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+)+\b/g) || [];
        }
        
        for (const nombre of posiblesNombres) {
          const palabras = nombre.split(/\s+/);
          
          // Filtrar nombres inválidos
          if (palabras.length < 2 || palabras.length > 4) continue;
          
          // Verificar que ninguna palabra esté en la lista de ignorados
          const esNombreValido = palabras.every(palabra => 
            palabra.length > 1 && 
            (/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]*$/.test(palabra) || /^[A-ZÁÉÍÓÚÜÑ]{2,}$/.test(palabra)) &&
            !palabrasIgnorar.has(palabra) &&
            !palabrasIgnorar.has(palabra.toUpperCase())
          );
          
          if (esNombreValido) {
            lineasNombres.push(nombre);
          }
        }
      }
    }
    
    // Filtrar duplicados y limpiar los nombres
    lineasNombres = [...new Set(lineasNombres)]
      .map(nombre => nombre.replace(/\s+/g, ' ').trim())
      .filter(nombre => {
        // Filtrar nombres que contengan palabras de encabezados
        const palabrasProhibidas = ['personas', 'remunerativo', 'cantidad', 'legajos', 'monto', 'concepto'];
        const nombreMinusculas = nombre.toLowerCase();
        return !palabrasProhibidas.some(palabra => nombreMinusculas.includes(palabra));
      });
    
    console.log('📄 Nombres extraídos:', lineasNombres);

    if (lineasNombres.length === 0) {
      console.log(`ℹ️ No se encontraron nombres en el archivo: ${path.basename(filePath)}`);
      console.log('📄 Contenido del archivo:');
      console.log(text);
      return;
    }

    // Procesar cada persona encontrada
    for (const nombreCompleto of lineasNombres) {
      // Separar apellido y nombre (asumimos que el primer segmento es el apellido)
      const partes = nombreCompleto.trim().split(/\s+/);
      if (partes.length < 2) continue;
      
      const apellido = partes[0];
      const nombre = partes.slice(1).join(' ');
      
      console.log(`Procesando: ${apellido}, ${nombre}`);

      // Crear o actualizar la persona
      try {
        await prisma.persona.create({
          data: {
            nombre: nombre || 'Desconocido',
            apellido: apellido || 'Desconocido',
            legajos: 1 // Valor por defecto
          }
        });
        console.log(`✅ Persona insertada: ${apellido}, ${nombre}`);
      } catch (error) {
        if (error.code === 'P2002') { // Error de duplicado
          console.log(`ℹ️ La persona ya existe: ${apellido}, ${nombre}`);
        } else {
          console.error(`❌ Error al insertar persona:`, error.message);
        }
      }
    }
    
    console.log(`✅ Procesado: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('📂 Carpeta de uploads:', uploadsDir);

  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ La carpeta ${uploadsDir} no existe`);
    return;
  }

  const files = fs.readdirSync(uploadsDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => path.join(uploadsDir, f));

  if (files.length === 0) {
    console.log('⚠️ No se encontraron PDFs en', uploadsDir);
    return;
  }

  console.log(`🔍 Encontrados ${files.length} archivos PDF`);

  for (const file of files) {
    await processPDF(file);
  }

  console.log('🚀 Todos los PDFs fueron procesados');
  await prisma.$disconnect();
}

main().catch(console.error);
