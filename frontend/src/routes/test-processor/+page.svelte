<!-- frontend/src/routes/test-processor/+page.svelte -->
<script>
    import { documentProcessor } from '$lib/services/pdf/documentProcessor';
    
    let file = null;
    let processing = false;
    let result = null;
    let error = null;
    
    async function handleFileUpload(event) {
      file = event.target.files[0];
      if (!file) return;
      
      processing = true;
      error = null;
      result = null;
      
      try {
        result = await documentProcessor.processPdf(file);
        console.log('Resultado del procesamiento:', result);
      } catch (err) {
        console.error('Error:', err);
        error = err.message;
      } finally {
        processing = false;
      }
    }
  </script>
  
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Procesador de PDFs - Prueba</h1>
    
    <div class="mb-4">
      <label class="block mb-2">Seleccionar archivo PDF:</label>
      <input 
        type="file" 
        accept=".pdf" 
        on:change={handleFileUpload}
        class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
        {disabled: processing}
      />
    </div>
    
    {#if processing}
      <div class="p-4 bg-blue-50 text-blue-700 rounded-md mb-4">
        Procesando documento...
      </div>
    {/if}
    
    {#if error}
      <div class="p-4 bg-red-50 text-red-700 rounded-md mb-4">
        Error: {error}
      </div>
    {/if}
    
    {#if result}
      <div class="mt-6 p-4 border rounded-md">
        <h2 class="text-xl font-semibold mb-2">Resultado del procesamiento</h2>
        <p><strong>Tipo de documento:</strong> {result.type}</p>
        
        {#if result.success}
          <div class="mt-4">
            <h3 class="font-semibold">Datos extraídos:</h3>
            <pre class="bg-gray-100 p-2 rounded-md mt-2 text-sm overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        {/if}
      </div>
    {/if}
  </div>