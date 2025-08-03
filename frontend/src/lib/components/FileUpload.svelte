<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  type FileWithPreview = File & {
    preview?: string;
  };

  const dispatch = createEventDispatcher<{
    complete: { success: boolean; results: Array<{ filename: string; success: boolean; error?: string }> };
    error: { message: string };
  }>();
  
  let isDragging = false;
  let files: FileWithPreview[] = [];
  let uploadProgress = 0;
  let isUploading = false;
  let error: string | null = null;
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    
    if (!event.dataTransfer?.files) return;
    handleFiles(Array.from(event.dataTransfer.files));
  }
  
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    handleFiles(Array.from(target.files));
  }
  
  function handleFiles(fileList: File[]) {
    const newFiles = fileList.filter(file => 
      file.type === 'application/pdf' || file.name.endsWith('.pdf')
    ) as FileWithPreview[];
    
    if (newFiles.length === 0) {
      error = 'Por favor, selecciona archivos PDF válidos.';
      return;
    }
    
    // Add preview for images (if needed)
    const filesWithPreview = newFiles.map(file => {
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
      return file;
    });
    
    files = [...files, ...filesWithPreview];
    error = null;
  }
  
  function removeFile(index: number) {
    // Revoke object URL to avoid memory leaks
    if (files[index]?.preview) {
      URL.revokeObjectURL(files[index].preview!);
    }
    files = files.filter((_, i) => i !== index);
  }
  
  interface UploadResult {
    success: boolean;
    files: Array<{
      filename: string;
      success: boolean;
      error?: string;
    }>;
  }

  async function uploadFiles() {
    if (files.length === 0) {
      error = 'No hay archivos para subir.';
      return;
    }
    
    isUploading = true;
    uploadProgress = 0;
    error = null;
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al subir los archivos');
      }
      
      const result: UploadResult = await response.json();
      dispatch('complete', {
        success: result.success,
        results: result.files
      });
      
      // Reset after successful upload
      files = [];
      uploadProgress = 100;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Error al subir los archivos';
      dispatch('error', { message: error });
    } finally {
      isUploading = false;
    }
  }
  
  // Cleanup object URLs when component is destroyed
  import { onDestroy } from 'svelte';
  
  function cleanup() {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }
  
  onDestroy(cleanup);
</script>

<div class="space-y-4">
  <!-- Drag and Drop Zone -->
  <div 
    role="button"
    aria-label="Haz clic o arrastra archivos PDF aquí para subirlos"
    class={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
    on:dragover|preventDefault={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop|preventDefault={handleDrop}
    tabindex="0"
    on:keydown|stopPropagation={(e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const input = document.getElementById('file-upload') as HTMLInputElement;
        input?.click();
      }
    }}
  >
    <div class="space-y-2">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <div class="flex text-sm text-gray-600">
        <label
          for="file-upload"
          class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 mx-auto"
        >
          <span>Sube un archivo</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            class="sr-only"
            accept=".pdf,application/pdf"
            multiple
            on:change={handleFileSelect}
          />
        </label>
        <p class="pl-1">o arrástralo aquí</p>
      </div>
      <p class="text-xs text-gray-500">PDF hasta 10MB</p>
    </div>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{error}</h3>
        </div>
      </div>
    </div>
  {/if}

  <!-- Selected Files -->
  {#if files.length > 0}
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-700">Archivos seleccionados ({files.length})</h3>
      <ul class="space-y-2">
        {#each files as file, i}
          <li class="flex items-center justify-between bg-gray-50 rounded-md p-3">
            <div class="flex items-center space-x-3 truncate">
              <svg
                class="h-5 w-5 text-red-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
              </svg>
              <span class="truncate">{file.name}</span>
              <span class="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button
              type="button"
              class="text-red-500 hover:text-red-700"
              on:click={() => removeFile(i)}
              disabled={isUploading}
            >
              <span class="sr-only">Eliminar</span>
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
              </svg>
            </button>
          </li>
        {/each}
      </ul>

      <!-- Upload Button -->
      <div class="pt-2">
        <button
          type="button"
          class="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          on:click={uploadFiles}
          disabled={isUploading || files.length === 0}
          aria-busy={isUploading}
          aria-live="polite"
        >
          {#if isUploading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subiendo...
          {:else}
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Subir {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
