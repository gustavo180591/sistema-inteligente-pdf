/**
 * @typedef {Object} PDFMetadata
 * @property {string} [fileName] - Nombre del archivo
 * @property {number} [fileSize] - Tamaño del archivo en bytes
 * @property {number} [pages] - Número de páginas
 * @property {string} [extractedAt] - Fecha de extracción en formato ISO
 */

/**
 * @typedef {Object} ProcesarPDFResultado
 * @property {boolean} success - Indica si el procesamiento fue exitoso
 * @property {string} type - Tipo de documento (SIDEPP, TRANSFERENCIA, etc.)
 * @property {any} data - Datos extraídos del documento
 * @property {PDFMetadata} [metadata] - Metadatos adicionales
 */

/**
 * @typedef {Object} DocumentoPDF
 * @property {string} [periodo] - Período del documento (para SIDEPP)
 * @property {Array<Object>} [personas] - Lista de personas (para SIDEPP)
 * @property {string} [cbuOrigen] - CBU de origen (para transferencias)
 * @property {string} [cbuDestino] - CBU de destino (para transferencias)
 * @property {number} [monto] - Monto de la transferencia
 * @property {string} [fecha] - Fecha de la operación
 * @property {string} [moneda] - Código de moneda (ej: 'ARS')
 */

export {};
