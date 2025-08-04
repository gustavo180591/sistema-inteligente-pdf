<!-- frontend/src/routes/test-processor/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { documentProcessor } from '$lib/services/pdf/documentProcessor';
  
  // Tipos
  interface ProcessResult {
    success: boolean;
    type?: string;
    data?: {
      totalPersonas?: number;
      totalImporte?: number;
      periodo?: string;
      cbuOrigen?: string;
      cbuDestino?: string;
      monto?: number;
      moneda?: string;
      fecha?: string;
      [key: string]: any;
    };
    metadata?: {
      fileName?: string;
      fileSize?: number;
      [key: string]: any;
    };
  }
  
  // Estados
  let file: File | null = null;
  let processing = false;
  let result: ProcessResult | null = null;
  let error: string | null = null;
  let fileSizeError = '';
  
  // Constantes
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf'];
  
  // Formatear tamaño de archivo a un string legible
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(k)),
      sizes.length - 1
    );
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  // Maneja la carga de archivos
  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const selectedFile = target.files[0];
    
    // Resetear estados
    file = null;
    result = null;
    error = null;
    fileSizeError = '';
    
    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      error = 'Tipo de archivo no permitido. Solo se aceptan archivos PDF.';
      return;
    }
    
    // Validar tamaño del archivo
    if (selectedFile.size > MAX_FILE_SIZE) {
      fileSizeError = `El archivo es demasiado grande (${formatFileSize(selectedFile.size)}). Tamaño máximo: 5MB.`;
      return;
    }
    
    file = selectedFile;
    processing = true;
    
    try {
      result = await documentProcessor.processPdf(file);
      console.log('Resultado del procesamiento:', result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error procesando PDF:', errorMessage);
      error = `Error al procesar el archivo: ${errorMessage}`;
    } finally {
      processing = false;
    }
  }
</script>
  
<div class="container mx-auto p-4 max-w-4xl">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Procesador de PDFs</h1>
    <p class="text-gray-600">
      Sube un archivo PDF para extraer información estructurada de documentos SIDEPP o transferencias bancarias.
    </p>
  </header>
  
  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <div class="mb-6">
      <div class="mb-2">
        <label for="pdf-upload" class="block text-sm font-medium text-gray-700">
          Seleccionar archivo PDF
        </label>
      </div>
      <div class="mt-1 flex items-center">
        <label for="pdf-upload" class="cursor-pointer">
          <span class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {file ? file.name : 'Seleccionar archivo'}
          </span>
          <input 
            id="pdf-upload"
            name="pdf-upload"
            type="file" 
            accept="application/pdf"
            on:change={handleFileUpload}
            class="sr-only"
            disabled={processing}
          />
        </label>
        {#if file}
          <span class="ml-4 text-sm text-gray-500">{formatFileSize(file.size)}</span>
        {/if}
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Archivos PDF de hasta 5MB
      </p>
      
      {#if fileSizeError}
        <p class="mt-2 text-sm text-red-600">{fileSizeError}</p>
      {/if}
    </div>
    
    {#if processing}
      <div class="p-4 bg-blue-50 text-blue-700 rounded-md mb-6 flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Procesando documento...
      </div>
    {/if}
    
    {#if error}
      <div class="p-4 bg-red-50 text-red-700 rounded-md mb-6 flex items-start">
        <svg class="h-5 w-5 text-red-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="font-medium">Error al procesar el archivo</h3>
          <p class="text-sm mt-1">{error}</p>
        </div>
      </div>
    {/if}
  </div>
  
  {#if result && result.success}
    <div class="mt-8 p-6 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">
        Resultados del procesamiento
        {#if result.type}
          <span class="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {result.type}
          </span>
        {/if}
      </h2>
      
      {#if result.metadata && result.metadata.fileName}
        <div class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-600">
            <span class="font-medium">Archivo:</span> {result.metadata.fileName}
            {#if result.metadata.fileSize}
              <span class="text-gray-500 ml-2">({formatFileSize(result.metadata.fileSize)})</span>
            {/if}
          </p>
        </div>
      {/if}

      {#if result.data}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-blue-700">Total Personas</p>
            <p class="text-2xl font-bold text-blue-900">{result.data.totalPersonas || 0}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-green-700">Importe Total</p>
            <p class="text-2xl font-bold text-green-900">
              ${result.data.totalImporte ? result.data.totalImporte.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-purple-700">Período</p>
            <p class="text-lg font-semibold text-purple-900">
              {result.data.periodo || 'No especificado'}
            </p>
          </div>
        </div>
      {/if}
      
      {#if result.type === 'TRANSFERENCIA' && result.data}
        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Detalles de la transferencia</h3>
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <dl class="divide-y divide-gray-200">
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">CBU Origen</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">
                  {result.data.cbuOrigen || 'No especificado'}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt class="text-sm font-medium text-gray-500">CBU Destino</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">
                  {result.data.cbuDestino || 'No especificado'}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Monto</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  ${result.data.monto ? result.data.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0.00'} {result.data.moneda || 'ARS'}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt class="text-sm font-medium text-gray-500">Fecha</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {result.data.fecha || new Date().toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>