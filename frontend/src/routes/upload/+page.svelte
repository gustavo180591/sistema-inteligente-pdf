<!-- frontend/src/routes/upload/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { invalidate } from '$app/navigation';
  
  let isUploading = false;
  let uploadResult = null;
  let error = null;

  async function handleSubmit({ data, formElement }) {
    isUploading = true;
    error = null;
    uploadResult = null;
    
    try {
      const formData = new FormData(formElement);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el archivo');
      }
      
      uploadResult = result;
      // Actualizar la lista de documentos
      invalidate('documents:list');
    } catch (err) {
      error = err.message;
    } finally {
      isUploading = false;
    }
    
    return async () => {
      return { status: 200, data: {} };
    };
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Cargar PDFs</h1>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}
  
  {#if uploadResult}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
      <p class="font-bold">¡Archivo procesado con éxito!</p>
      <p>Tipo: {uploadResult.tipo}</p>
      {#if uploadResult.periodo}
        <p>Período: {uploadResult.periodo}</p>
      {/if}
      {#if uploadResult.totalPersonas}
        <p>Personas procesadas: {uploadResult.totalPersonas}</p>
      {/if}
    </div>
  {/if}

  <form method="POST" use:enhance={handleSubmit} class="space-y-4">
    <div class="flex items-center justify-center w-full">
      <label for="file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p class="mb-2 text-sm text-gray-500">
            <span class="font-semibold">Haz clic para subir</span> o arrastra el archivo
          </p>
          <p class="text-xs text-gray-500">PDF (MAX. 10MB)</p>
        </div>
        <input id="file" name="file" type="file" class="hidden" accept=".pdf" />
      </label>
    </div>
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isUploading}
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Procesando...' : 'Subir y Procesar'}
      </button>
    </div>
  </form>
</div>